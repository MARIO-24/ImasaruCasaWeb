-- ==============================================================================
-- SCHEMA SUPABASE: CASA VACACIONAL IMASARU (CONIL DE LA FRONTERA)
-- Diseñado para Web Pública (React) + Futura App Propietaria (Flutter)
-- ==============================================================================

-- 1. TABLA DE ADMINISTRADORES AUTORIZADOS
-- Solo los usuarios incluidos en esta tabla tienen privilegios para crear/modificar
-- reservas y moderar las valoraciones.
CREATE TABLE IF NOT EXISTS public.app_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo administradores pueden consultar el registro de admins"
    ON public.app_admins FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Función auxiliar para verificar si el usuario actual es administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.app_admins WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. TABLA DE RESERVAS / PERIODOS DE DISPONIBILIDAD
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'blocked', 'maintenance')),
    notes TEXT, -- Notas privadas solo para la propietaria
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings (start_date, end_date);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Política 1: Lectura pública (Cualquier visitante de la web puede ver fechas ocupadas)
CREATE POLICY "Disponibilidad visible para cualquier visitante"
    ON public.bookings FOR SELECT
    USING (true);

-- Política 2: Solo administradores autorizados pueden insertar reservas (futura app Flutter)
CREATE POLICY "Solo administradores autorizados pueden crear reservas"
    ON public.bookings FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Política 3: Solo administradores autorizados pueden modificar reservas
CREATE POLICY "Solo administradores autorizados pueden actualizar reservas"
    ON public.bookings FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Política 4: Solo administradores autorizados pueden eliminar reservas
CREATE POLICY "Solo administradores autorizados pueden eliminar reservas"
    ON public.bookings FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- 3. TABLA DE VALORACIONES / RESEÑAS PROPIAS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    stay_date TEXT,
    approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews (approved, created_at DESC);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Política 1: Lectura pública exclusiva de reseñas aprobadas
CREATE POLICY "Visitantes solo pueden ver reseñas aprobadas"
    ON public.reviews FOR SELECT
    USING (approved = true OR public.is_admin());

-- Política 2: Visitantes pueden enviar nuevas reseñas, siempre con approved = false
CREATE POLICY "Visitantes pueden enviar reseñas pendientes de aprobación"
    ON public.reviews FOR INSERT
    WITH CHECK (approved = false);

-- Política 3: Solo administradores pueden moderar (aprobar/editar)
CREATE POLICY "Solo administradores pueden moderar reseñas"
    ON public.reviews FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Política 4: Solo administradores pueden eliminar reseñas
CREATE POLICY "Solo administradores pueden eliminar reseñas"
    ON public.reviews FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- ==============================================================================
-- INSTRUCCIONES PARA ACTIVAR A LA PROPIETARIA COMO ADMINISTRADORA:
-- 1. Regístrate en Supabase Auth con el email de la propietaria (pilirufinofer@gmail.com).
-- 2. Ejecuta en el SQL Editor de Supabase:
--    INSERT INTO public.app_admins (user_id, email)
--    SELECT id, email FROM auth.users WHERE email = 'pilirufinofer@gmail.com';
-- ==============================================================================

