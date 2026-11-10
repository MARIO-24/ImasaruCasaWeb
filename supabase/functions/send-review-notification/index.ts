// Supabase Edge Function: send-review-notification
// Envía notificaciones Web Push a los administradores de Casa Vacacional Imasaru
// cuando un visitante publica una nueva reseña o cuando un administrador solicita una prueba.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReviewRecord {
  id?: string;
  author_name: string;
  rating: number;
  comment: string;
  stay_date?: string | null;
  approved?: boolean;
}

Deno.serve(async (req) => {
  // Manejo de preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let activeClaimedReviewId: string | null = null;
  let activeClaimToken: string | null = null;
  let supabaseAdminClient: any = null;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas en el entorno.");
    }

    // Validación estricta sin fallbacks silenciosos: los tres Secrets deben estar presentes
    const missingSecrets = [
      !vapidPublicKey && "VAPID_PUBLIC_KEY",
      !vapidPrivateKey && "VAPID_PRIVATE_KEY",
      !vapidSubject && "VAPID_SUBJECT"
    ].filter(Boolean);

    if (missingSecrets.length > 0) {
      throw new Error(`Configuración VAPID incompleta: faltan las variables [${missingSecrets.join(", ")}] en Edge Functions Secrets.`);
    }

    // Validación del formato RFC 8292 de VAPID_SUBJECT
    if (!vapidSubject!.startsWith("mailto:") && !vapidSubject!.startsWith("https://")) {
      throw new Error("VAPID_SUBJECT no es válido. Debe comenzar por 'mailto:' o 'https://' según RFC 8292.");
    }

    // Configurar VAPID en web-push
    webpush.setVapidDetails(vapidSubject!, vapidPublicKey!, vapidPrivateKey!);

    // Cliente de Supabase con privilegios de servicio (solo en el servidor)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    supabaseAdminClient = supabaseAdmin;

    const body = await req.json().catch(() => ({}));

    // ==========================================================================
    // CASO 1: Notificación de prueba solicitada por un administrador
    // ==========================================================================
    if (body.action === "test") {
      // 1. Exigir token de autorización Bearer obligatorio
      const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "No autorizado. Se requiere un token Bearer válido para solicitar pruebas de notificación." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

      if (userError || !userData?.user) {
        return new Response(
          JSON.stringify({ error: "Token de autenticación inválido o expirado." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const authenticatedUserId = userData.user.id;

      // 2. Comprobar que el usuario autenticado pertenece a app_admins
      const { data: adminRecord, error: adminErr } = await supabaseAdmin
        .from("app_admins")
        .select("user_id, email")
        .eq("user_id", authenticatedUserId)
        .maybeSingle();

      if (adminErr || !adminRecord) {
        return new Response(
          JSON.stringify({ error: "Acceso denegado: tu cuenta no está autorizada en app_admins." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 3. Seguridad estricta: Únicamente enviar la prueba a la propia cuenta del administrador autenticado.
      // Nunca confiar en ningún targetUserId o userId suministrado por el cliente.
      const targetUserId = authenticatedUserId;

      // 4. Obtener las suscripciones activas del administrador
      const { data: subs, error: subsError } = await supabaseAdmin
        .from("admin_push_subscriptions")
        .select("id, endpoint, p256dh, auth, device_name")
        .eq("user_id", targetUserId);

      if (subsError) {
        throw new Error(`Error al consultar suscripciones: ${subsError.message}`);
      }

      if (!subs || subs.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "No se encontraron dispositivos suscritos para tu cuenta de administrador." 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const testPayload = JSON.stringify({
        title: "Casa Vacacional Imasaru",
        body: `¡Notificación de prueba recibida con éxito (${adminRecord.email})! Tu dispositivo está correctamente conectado.`,
        icon: "/pwa-192.png",
        badge: "/favicon-96x96.png",
        tag: "test-notification-" + Date.now(),
        data: { url: "/admin/ajustes" }
      });

      let sentCount = 0;
      let failedCount = 0;
      const expiredSubIds: string[] = [];

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth }
            },
            testPayload
          );
          sentCount++;
        } catch (err: any) {
          failedCount++;
          console.error(`[WebPush Test Error] Fallo al enviar a ${sub.device_name || sub.endpoint.slice(0, 30)}: Status ${err.statusCode || 'N/A'} - ${err.message || err}`);
          if (err.statusCode === 404 || err.statusCode === 410) {
            expiredSubIds.push(sub.id);
          }
        }
      }

      // Poda de suscripciones caducadas
      if (expiredSubIds.length > 0) {
        await supabaseAdmin
          .from("admin_push_subscriptions")
          .delete()
          .in("id", expiredSubIds);
      }

      return new Response(
        JSON.stringify({
          success: true,
          sentCount,
          failedCount,
          prunedCount: expiredSubIds.length,
          message: `Notificación de prueba enviada a ${sentCount} dispositivo(s).`
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================================================
    // CASO 2: Nueva reseña recibida (Llamada del cliente o Database Webhook)
    // ==========================================================================
    // Extraer datos iniciales de la reseña
    const rawRecord: ReviewRecord | undefined = 
      body.record || 
      (body.type === "INSERT" ? body.record : undefined) || 
      body.review;

    if (!rawRecord || !rawRecord.id) {
      return new Response(
        JSON.stringify({ message: "No se proporcionó un ID de reseña válido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ignorar si se trata de un update donde la reseña ya existía (solo alertar en nuevas inserciones)
    if (body.type && body.type !== "INSERT") {
      return new Response(
        JSON.stringify({ message: "Evento omitido (solo se notifican inserciones nuevas)." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Validar autenticidad de la reseña directamente en la base de datos para impedir envíos arbitrarios
    const { data: dbReview, error: dbErr } = await supabaseAdmin
      .from("reviews")
      .select("id, author_name, rating, comment, stay_date, approved, created_at")
      .eq("id", rawRecord.id)
      .maybeSingle();

    if (dbErr || !dbReview) {
      return new Response(
        JSON.stringify({ error: "La reseña no existe en la base de datos o no es válida." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const review: ReviewRecord = dbReview;
    const reviewId = review.id!;

    // 2. DEDUPLICACIÓN PERSISTENTE ATÓMICA EN BASE DE DATOS CON FENCING TOKEN
    // Intenta adquirir el cerrojo de notificación para esta reseña
    const { data: claimToken, error: claimError } = await supabaseAdmin
      .rpc("claim_review_notification", { p_review_id: reviewId });

    if (claimError) {
      console.error(`[Deduplication Error] Fallo al reclamar cerrojo para reseña ${reviewId}:`, claimError.message);
      return new Response(
        JSON.stringify({ error: `Error de concurrencia al reclamar notificación: ${claimError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!claimToken) {
      // claim_review_notification devolvió NULL: ya fue enviada o está en proceso por otra instancia
      return new Response(
        JSON.stringify({
          success: true,
          skipped: true,
          message: `Notificación para la reseña ${reviewId} ya procesada o en curso por otra instancia (omitida por deduplicación persistente).`
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cerrojo adquirido con éxito
    activeClaimedReviewId = reviewId;
    activeClaimToken = claimToken;

    // 3. Obtener los administradores autorizados que tienen notificaciones activas
    const { data: recipients, error: recipientsError } = await supabaseAdmin
      .rpc("get_active_push_recipients");

    if (recipientsError) {
      if (activeClaimToken) {
        await supabaseAdmin.rpc("complete_review_notification", {
          p_review_id: reviewId,
          p_claim_token: activeClaimToken,
          p_status: "failed",
          p_sent_count: 0,
          p_error_message: `Error consultando destinatarios: ${recipientsError.message}`
        }).catch((err: any) => console.error("[Fencing Token Error] Fallo al marcar failed:", err));
        activeClaimedReviewId = null;
        activeClaimToken = null;
      }
      throw new Error(`Error al consultar destinatarios: ${recipientsError.message}`);
    }

    if (!recipients || recipients.length === 0) {
      if (activeClaimToken) {
        await supabaseAdmin.rpc("complete_review_notification", {
          p_review_id: reviewId,
          p_claim_token: activeClaimToken,
          p_status: "sent",
          p_sent_count: 0,
          p_error_message: "Sin destinatarios activos con notificaciones habilitadas"
        }).catch((err: any) => console.error("[Fencing Token Error] Fallo al marcar sent vacío:", err));
        activeClaimedReviewId = null;
        activeClaimToken = null;
      }
      return new Response(
        JSON.stringify({ message: "No hay administradores suscritos o tienen las notificaciones desactivadas." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Construir contenido de la notificación con los datos auténticos de la BD
    const stars = "★".repeat(Math.max(1, Math.min(5, review.rating || 5)));
    const cleanComment = (review.comment || "").trim();
    const commentPreview = cleanComment.length > 75 
      ? cleanComment.slice(0, 72) + "..." 
      : cleanComment;

    const notificationPayload = JSON.stringify({
      title: "Nueva opinión recibida",
      body: `Casa Vacacional Imasaru · ${stars} de ${review.author_name}: "${commentPreview}"`,
      icon: "/pwa-192.png",
      badge: "/favicon-96x96.png",
      tag: "review-" + reviewId,
      data: {
        url: "/admin/resenas",
        reviewId: reviewId
      }
    });

    let sent = 0;
    let failed = 0;
    const expiredIds: string[] = [];

    // 5. Enviar a cada dispositivo destinatario
    for (const recipient of recipients) {
      try {
        await webpush.sendNotification(
          {
            endpoint: recipient.endpoint,
            keys: { p256dh: recipient.p256dh, auth: recipient.auth }
          },
          notificationPayload
        );
        sent++;
      } catch (err: any) {
        failed++;
        console.error(`[WebPush Error] Fallo al enviar a ${recipient.email} (${recipient.device_name || recipient.endpoint.slice(0, 30)}): Status ${err.statusCode || 'N/A'} - ${err.message || err}`);
        // 404 o 410 indica suscripción caducada o cancelada en el navegador
        if (err.statusCode === 404 || err.statusCode === 410) {
          expiredIds.push(recipient.subscription_id);
        }
      }
    }

    // 6. Poda automática de suscripciones caducadas en la base de datos
    if (expiredIds.length > 0) {
      await supabaseAdmin
        .from("admin_push_subscriptions")
        .delete()
        .in("id", expiredIds);
    }

    // 7. Finalizar el estado en el registro de deduplicación persistente con Fencing Token
    if (activeClaimToken) {
      const finalStatus = sent > 0 || recipients.length === 0 ? "sent" : "failed";
      const { data: completed, error: completeErr } = await supabaseAdmin.rpc("complete_review_notification", {
        p_review_id: reviewId,
        p_claim_token: activeClaimToken,
        p_status: finalStatus,
        p_sent_count: sent,
        p_error_message: failed > 0 ? `${failed} envío(s) con error` : null
      });

      if (completeErr) {
        console.error(`[Fencing Token Error] Error al invocar complete_review_notification para ${reviewId}:`, completeErr.message);
      } else if (!completed) {
        console.warn(`[Fencing Token Warning] No se pudo completar la notificación para ${reviewId}. Es posible que el cerrojo expirara (>5m) y fuera reclamado por otra instancia.`);
      }

      activeClaimedReviewId = null;
      activeClaimToken = null;
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentCount: sent,
        failedCount: failed,
        prunedCount: expiredIds.length,
        message: `Notificaciones push enviadas a ${sent} dispositivo(s).`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error en Edge Function send-review-notification:", error);

    // Si falló de manera crítica después de haber adquirido el cerrojo, marcar como 'failed' para permitir reintento
    if (activeClaimedReviewId && activeClaimToken && supabaseAdminClient) {
      try {
        await supabaseAdminClient.rpc("complete_review_notification", {
          p_review_id: activeClaimedReviewId,
          p_claim_token: activeClaimToken,
          p_status: "failed",
          p_sent_count: 0,
          p_error_message: error.message || "Excepción crítica no controlada"
        });
      } catch (cleanupErr) {
        console.error("[Fencing Token Cleanup Error]:", cleanupErr);
      }
    }

    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
