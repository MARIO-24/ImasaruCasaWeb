-- ==============================================================================
-- CASA VACACIONAL IMASARU: SISTEMA DE NOTIFICACIONES DE NUEVAS RESEÑAS
-- ==============================================================================
-- Este script configura las tablas, políticas de seguridad RLS, canales
-- de Supabase Realtime y deduplicación persistente con Fencing Token para
-- las notificaciones de administradores (in-app y Web Push).
-- Totalmente idempotente y re-ejecutable sin pérdida de datos históricos.
-- ==============================================================================

-- 1. TABLA DE PREFERENCIAS DE NOTIFICACIÓN POR ADMINISTRADOR
-- Permite que cada administrador active o desactive individualmente
-- las alertas de nuevas reseñas sin afectar a otros administradores.
CREATE TABLE IF NOT EXISTS public.admin_notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    notify_new_reviews BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Política RLS: Solo administradores autorizados pueden consultar y editar sus preferencias
DROP POLICY IF EXISTS "Admins gestionan sus propias preferencias de notificacion" ON public.admin_notification_preferences;
CREATE POLICY "Admins gestionan sus propias preferencias de notificacion"
    ON public.admin_notification_preferences
    FOR ALL
    TO authenticated
    USING (public.is_admin() AND auth.uid() = user_id)
    WITH CHECK (public.is_admin() AND auth.uid() = user_id);


-- 2. TABLA DE SUSCRIPCIONES WEB PUSH (DISPOSITIVOS)
-- Almacena las suscripciones Web Push de los navegadores/dispositivos
-- (Android, iPhone PWA, PC/Mac) asociados a cada administrador.
CREATE TABLE IF NOT EXISTS public.admin_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    device_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON public.admin_push_subscriptions (user_id);

ALTER TABLE public.admin_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política RLS: Cada administrador solo puede registrar, ver y borrar sus propias suscripciones
DROP POLICY IF EXISTS "Admins gestionan sus propias suscripciones push" ON public.admin_push_subscriptions;
CREATE POLICY "Admins gestionan sus propias suscripciones push"
    ON public.admin_push_subscriptions
    FOR ALL
    TO authenticated
    USING (public.is_admin() AND auth.uid() = user_id)
    WITH CHECK (public.is_admin() AND auth.uid() = user_id);


-- 3. HABILITAR SUPABASE REALTIME EN LA TABLA DE RESEÑAS
-- Permite que los administradores con el panel abierto reciban avisos
-- instantáneos en vivo en cuanto un visitante envía una nueva reseña.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'reviews'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
    END IF;
END $$;


-- 4. VISTA / FUNCIÓN AUXILIAR PARA CONSULTAR DESTINATARIOS ACTIVOS
-- Utilizada por la Edge Function para obtener únicamente las suscripciones
-- de administradores que tienen las notificaciones activas.
DROP FUNCTION IF EXISTS public.get_active_push_recipients();

CREATE OR REPLACE FUNCTION public.get_active_push_recipients()
RETURNS TABLE (
    subscription_id UUID,
    user_id UUID,
    endpoint TEXT,
    p256dh TEXT,
    auth TEXT,
    device_name TEXT,
    email TEXT
)
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS subscription_id,
        s.user_id,
        s.endpoint,
        s.p256dh,
        s.auth,
        s.device_name,
        a.email
    FROM public.admin_push_subscriptions s
    INNER JOIN public.app_admins a ON a.user_id = s.user_id
    LEFT JOIN public.admin_notification_preferences p ON p.user_id = s.user_id
    WHERE COALESCE(p.notify_new_reviews, true) = true;
END;
$$ LANGUAGE plpgsql;

-- Restringir ejecución de la función auxiliar exclusivamente al rol de servicio
REVOKE ALL ON FUNCTION public.get_active_push_recipients() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_push_recipients() TO service_role;


-- 5. TABLA Y FUNCIONES DE DEDUPLICACIÓN PERSISTENTE CON FENCING TOKEN
-- Garantiza que cada reseña solo genere un único evento de difusión de notificaciones,
-- protegiendo contra concurrencia entre múltiples instancias de la Edge Function,
-- reintentos de red y ejecuciones concurrentes entre frontend y Database Webhooks.
-- Utiliza un Fencing Token (claim_token) para evitar que instancias lentas sobrescriban
-- el estado de nuevas instancias tras la expiración del cerrojo.

-- 5.1 Creación de la tabla si no existe
CREATE TABLE IF NOT EXISTS public.review_notification_logs (
    review_id UUID PRIMARY KEY REFERENCES public.reviews(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('processing', 'sent', 'failed')),
    sent_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    error_message TEXT
);

-- 5.2 Migración incremental segura e idempotente (para bases de datos donde la tabla ya existía sin claim_token)
DO $$
BEGIN
    -- Añadir columna claim_token si aún no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'review_notification_logs' 
          AND column_name = 'claim_token'
    ) THEN
        ALTER TABLE public.review_notification_logs 
        ADD COLUMN claim_token UUID DEFAULT gen_random_uuid();
    END IF;

    -- Asignar UUID a registros anteriores que no tengan token
    UPDATE public.review_notification_logs 
    SET claim_token = gen_random_uuid() 
    WHERE claim_token IS NULL;

    -- Asegurar restricción NOT NULL y valor por defecto permanente
    ALTER TABLE public.review_notification_logs 
    ALTER COLUMN claim_token SET NOT NULL;

    ALTER TABLE public.review_notification_logs 
    ALTER COLUMN claim_token SET DEFAULT gen_random_uuid();
END $$;

-- 5.3 Índices y políticas RLS
CREATE INDEX IF NOT EXISTS idx_review_notif_logs_status_updated 
    ON public.review_notification_logs(status, updated_at);

ALTER TABLE public.review_notification_logs ENABLE ROW LEVEL SECURITY;

-- Revocar expresamente todo acceso a anon y authenticated; acceso exclusivo para service_role
REVOKE ALL ON public.review_notification_logs FROM anon, authenticated, PUBLIC;
GRANT ALL ON public.review_notification_logs TO service_role;

-- 5.4 Eliminar expresamente las firmas anteriores para permitir el cambio de tipos y parámetros
-- En PostgreSQL, cambiar el tipo de retorno de una función (de BOOLEAN a UUID)
-- exige obligatoriamente un DROP FUNCTION previo antes de recrearla.
-- Asimismo, se eliminan ambas firmas posibles de complete_review_notification (4 y 5 parámetros)
-- para garantizar un estado limpio antes de recrear la versión definitiva.
DROP FUNCTION IF EXISTS public.claim_review_notification(UUID);
DROP FUNCTION IF EXISTS public.complete_review_notification(UUID, TEXT, INTEGER, TEXT);
DROP FUNCTION IF EXISTS public.complete_review_notification(UUID, UUID, TEXT, INTEGER, TEXT);

-- 5.5 Función atómica para reclamar el envío con Fencing Token (retorna UUID)
-- Devuelve el UUID del claim_token si adquiere el cerrojo con éxito.
-- Devuelve NULL si la reseña ya fue enviada o si otra instancia la está procesando actualmente.
CREATE OR REPLACE FUNCTION public.claim_review_notification(p_review_id UUID)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_token UUID := gen_random_uuid();
    v_acquired_token UUID := NULL;
BEGIN
    -- 1. Intentar registrar el cerrojo en estado 'processing' con un nuevo claim_token.
    -- Si no existe, se inserta directamente.
    -- Si ya existe con 'sent' o 'processing' reciente (< 5 minutos), el WHERE no coincide y no se actualiza nada.
    -- Si falló previamente ('failed') o quedó colgado en 'processing' hace más de 5 minutos, se renueva el cerrojo.
    INSERT INTO public.review_notification_logs (review_id, status, claim_token, created_at, updated_at)
    VALUES (p_review_id, 'processing', v_token, now(), now())
    ON CONFLICT (review_id) DO UPDATE
        SET status = 'processing',
            claim_token = v_token,
            updated_at = now()
        WHERE public.review_notification_logs.status = 'failed'
           OR (public.review_notification_logs.status = 'processing' AND public.review_notification_logs.updated_at < now() - INTERVAL '5 minutes')
    RETURNING public.review_notification_logs.claim_token INTO v_acquired_token;

    RETURN v_acquired_token;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.claim_review_notification(UUID) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_review_notification(UUID) TO service_role;

-- 5.6 Función atómica para completar el envío exigiendo el claim_token (retorna BOOLEAN)
-- Solo completa si:
-- 1. Coincide review_id y el claim_token activo.
-- 2. El estado actual es estrictamente 'processing'.
-- 3. El estado nuevo es exclusivamente 'sent' o 'failed'.
-- Devuelve TRUE si se actualizó el registro; FALSE si el cerrojo expiró o fue tomado por otra instancia.
CREATE OR REPLACE FUNCTION public.complete_review_notification(
    p_review_id UUID,
    p_claim_token UUID,
    p_status TEXT,
    p_sent_count INTEGER,
    p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_completed BOOLEAN := false;
BEGIN
    -- Validar que el nuevo estado sea estrictamente 'sent' o 'failed'
    IF p_status NOT IN ('sent', 'failed') THEN
        RAISE EXCEPTION 'Estado inválido: %. Solo se permite ''sent'' o ''failed''.', p_status;
    END IF;

    -- Validar que el claim_token no sea nulo
    IF p_claim_token IS NULL THEN
        RAISE EXCEPTION 'claim_token no puede ser nulo para completar la notificación.';
    END IF;

    -- Actualizar únicamente si el token coincide y el estado sigue siendo 'processing'
    UPDATE public.review_notification_logs
    SET status = p_status,
        sent_count = p_sent_count,
        error_message = p_error_message,
        updated_at = now()
    WHERE review_id = p_review_id
      AND claim_token = p_claim_token
      AND status = 'processing';

    IF FOUND THEN
        v_completed := true;
    END IF;

    RETURN v_completed;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.complete_review_notification(UUID, UUID, TEXT, INTEGER, TEXT) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_review_notification(UUID, UUID, TEXT, INTEGER, TEXT) TO service_role;
