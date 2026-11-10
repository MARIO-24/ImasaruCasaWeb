import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Booking, Review } from '../../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://tu-proyecto.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

/**
 * Fetch availability bookings from Supabase
 * Strict: Never returns fake/mock data.
 */
export async function fetchBookings(startDate?: string, endDate?: string): Promise<{ data: Booking[] | null; error: Error | null }> {
  if (!supabase) {
    return {
      data: null,
      error: new Error('Supabase no está configurado aún. Por favor configure las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
    };
  }

  try {
    let query = supabase
      .from('bookings')
      .select('id, start_date, end_date, status, created_at, updated_at')
      .order('start_date', { ascending: true });

    if (startDate) {
      query = query.gte('end_date', startDate);
    }
    if (endDate) {
      query = query.lte('start_date', endDate);
    }

    const { data, error } = await query;
    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Booking[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error de conexión con Supabase') };
  }
}

/**
 * Fetch approved reviews for public display
 */
export async function fetchApprovedReviews(): Promise<{ data: Review[] | null; error: Error | null }> {
  if (!supabase) {
    return {
      data: null,
      error: new Error('Supabase no está configurado.')
    };
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, author_name, rating, comment, stay_date, approved, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Review[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al consultar valoraciones') };
  }
}

/**
 * Submit a new guest review
 * Always submitted with approved = false for owner moderation.
 * 
 * NOTE: We generate the UUID client-side and do NOT chain .select()
 * because PostgreSQL RLS evaluates the SELECT policy on RETURNING clauses.
 * Since pending reviews (approved = false) are hidden from anonymous visitors,
 * asking PostgreSQL to return the inserted row raises:
 * "new row violates row-level security policy for table 'reviews'".
 */
export async function submitReview(review: { author_name: string; rating: number; comment: string; stay_date?: string }): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return {
      success: false,
      error: new Error('Supabase no está configurado para registrar valoraciones.')
    };
  }

  try {
    const reviewId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

    const newRecord = {
      id: reviewId,
      author_name: review.author_name.trim(),
      rating: review.rating,
      comment: review.comment.trim(),
      stay_date: review.stay_date?.trim() || null,
      approved: false // Moderation required
    };

    // Insert row with minimal response (no RETURNING clause, avoiding RLS SELECT evaluation on pending reviews)
    const { error } = await supabase
      .from('reviews')
      .insert([newRecord]);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    // Trigger Edge Function in background to notify admins via Web Push
    supabase.functions.invoke('send-review-notification', {
      body: { type: 'INSERT', record: newRecord }
    }).catch((fnErr) => {
      console.warn('Aviso: El envío de la notificación push a los administradores ha fallado:', fnErr);
    });

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Error al enviar valoración') };
  }
}

// ==============================================================================
// CASA VACACIONAL IMASARU GESTIÓN (ADMIN API)
// ==============================================================================

/**
 * Sign in admin user with email and password
 */
export async function signInAdmin(email: string, password: string) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }
  return supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  });
}

/**
 * Sign out current admin user
 */
export async function signOutAdmin() {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}

/**
 * Send password reset email for an admin
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase no está configurado.') };
  }

  try {
    const redirectUrl = `${window.location.origin}/admin/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error('Error al solicitar recuperación de contraseña')
    };
  }
}

/**
 * Update password for current authenticated user (used during password recovery flow)
 */
export async function updateAdminPassword(newPassword: string): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.trim(),
    });

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error('Error al actualizar contraseña')
    };
  }
}


/**
 * Check if the given user is authorized in app_admins table
 */
export async function checkAdminAuthorization(userId: string): Promise<{
  isAuthorized: boolean;
  email?: string;
  error?: Error | null;
}> {
  if (!supabase) {
    return { isAuthorized: false, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { data, error } = await supabase
      .from('app_admins')
      .select('user_id, email')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { isAuthorized: false, error: new Error(error.message) };
    }

    if (data && data.user_id) {
      return { isAuthorized: true, email: data.email, error: null };
    }

    return { isAuthorized: false, error: null };
  } catch (err) {
    return { isAuthorized: false, error: err instanceof Error ? err : new Error('Error al comprobar permisos.') };
  }
}

/**
 * Fetch all bookings for management (sorted by start_date DESC)
 */
export async function fetchAllBookingsAdmin(): Promise<{ data: Booking[] | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, start_date, end_date, status, notes, created_at, updated_at')
      .order('start_date', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Booking[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al consultar reservas.') };
  }
}

/**
 * Create a new booking
 */
export async function createBookingAdmin(booking: {
  start_date: string;
  end_date: string;
  status: 'booked' | 'blocked' | 'maintenance';
  notes?: string;
}): Promise<{ data: Booking | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          start_date: booking.start_date,
          end_date: booking.end_date,
          status: booking.status,
          notes: booking.notes?.trim() || null,
        }
      ])
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Booking, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al crear reserva.') };
  }
}

/**
 * Update an existing booking
 */
export async function updateBookingAdmin(
  id: string,
  booking: {
    start_date?: string;
    end_date?: string;
    status?: 'booked' | 'blocked' | 'maintenance';
    notes?: string;
  }
): Promise<{ data: Booking | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  try {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (booking.start_date !== undefined) updatePayload.start_date = booking.start_date;
    if (booking.end_date !== undefined) updatePayload.end_date = booking.end_date;
    if (booking.status !== undefined) updatePayload.status = booking.status;
    if (booking.notes !== undefined) updatePayload.notes = booking.notes?.trim() || null;

    const { data, error } = await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Booking, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al actualizar reserva.') };
  }
}

/**
 * Delete a booking
 */
export async function deleteBookingAdmin(id: string): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Error al eliminar reserva.') };
  }
}

/**
 * Fetch all reviews for admin moderation (both approved and pending)
 */
export async function fetchAllReviewsAdmin(): Promise<{ data: Review[] | null; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, author_name, rating, comment, stay_date, approved, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Review[], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Error al consultar opiniones.') };
  }
}

/**
 * Approve a review for public display
 */
export async function approveReviewAdmin(id: string): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { error } = await supabase
      .from('reviews')
      .update({ approved: true })
      .eq('id', id);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Error al aprobar opinión.') };
  }
}

/**
 * Delete a review
 */
export async function deleteReviewAdmin(id: string): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Error al eliminar opinión.') };
  }
}

// ==============================================================================
// NOTIFICACIONES Y WEB PUSH API
// ==============================================================================

export interface AdminNotificationPreferences {
  userId: string;
  notifyNewReviews: boolean;
}

export interface AdminPushSubscriptionItem {
  id: string;
  userId: string;
  endpoint: string;
  deviceName?: string;
  createdAt: string;
  lastUsedAt?: string;
}

/**
 * Utility to convert VAPID base64 string to Uint8Array required by pushManager.subscribe
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Get notification preferences for the specified admin user.
 * Defaults to notifyNewReviews = true if no row exists.
 */
export async function getAdminNotificationPreferences(userId: string): Promise<{
  preferences: AdminNotificationPreferences;
  error: Error | null;
}> {
  if (!supabase) {
    return {
      preferences: { userId, notifyNewReviews: true },
      error: new Error('Supabase no está configurado.')
    };
  }

  try {
    const { data, error } = await supabase
      .from('admin_notification_preferences')
      .select('user_id, notify_new_reviews')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return {
        preferences: { userId, notifyNewReviews: true },
        error: new Error(error.message)
      };
    }

    if (data) {
      return {
        preferences: {
          userId: data.user_id,
          notifyNewReviews: Boolean(data.notify_new_reviews)
        },
        error: null
      };
    }

    return {
      preferences: { userId, notifyNewReviews: true },
      error: null
    };
  } catch (err) {
    return {
      preferences: { userId, notifyNewReviews: true },
      error: err instanceof Error ? err : new Error('Error al consultar preferencias.')
    };
  }
}

/**
 * Save notification preferences for an admin user (UPSERT).
 */
export async function saveAdminNotificationPreferences(
  userId: string,
  notifyNewReviews: boolean
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { error } = await supabase
      .from('admin_notification_preferences')
      .upsert({
        user_id: userId,
        notify_new_reviews: notifyNewReviews,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error('Error al guardar preferencias.')
    };
  }
}

/**
 * Save a Web Push subscription in Supabase
 */
export async function saveAdminPushSubscription(
  userId: string,
  subscription: PushSubscription,
  deviceName?: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase no está configurado.') };
  }

  try {
    const subJson = subscription.toJSON();
    const endpoint = subJson.endpoint;
    const p256dh = subJson.keys?.p256dh;
    const auth = subJson.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return { success: false, error: new Error('La suscripción push no contiene las claves requeridas.') };
    }

    const { error } = await supabase
      .from('admin_push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint,
        p256dh,
        auth,
        device_name: deviceName || (typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 100) : null),
        last_used_at: new Date().toISOString()
      }, { onConflict: 'endpoint' });

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error('Error al registrar suscripción push.')
    };
  }
}

/**
 * Delete a Web Push subscription from Supabase by endpoint
 */
export async function deleteAdminPushSubscription(
  endpoint: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { error } = await supabase
      .from('admin_push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error('Error al cancelar suscripción push.')
    };
  }
}

/**
 * List all active subscriptions registered for this admin user
 */
export async function getAdminPushSubscriptions(
  userId: string
): Promise<{ subscriptions: AdminPushSubscriptionItem[]; error: Error | null }> {
  if (!supabase) {
    return { subscriptions: [], error: new Error('Supabase no está configurado.') };
  }

  try {
    const { data, error } = await supabase
      .from('admin_push_subscriptions')
      .select('id, user_id, endpoint, device_name, created_at, last_used_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { subscriptions: [], error: new Error(error.message) };
    }

    const mapped = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      endpoint: row.endpoint,
      deviceName: row.device_name,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at
    }));

    return { subscriptions: mapped, error: null };
  } catch (err) {
    return {
      subscriptions: [],
      error: err instanceof Error ? err : new Error('Error al consultar dispositivos.')
    };
  }
}

/**
 * Trigger a test push notification via Edge Function
 */
export async function triggerTestPushNotification(
  userId: string
): Promise<{ success: boolean; message?: string; error: Error | null }> {
  if (!supabase) {
    return { success: false, error: new Error('Supabase no está configurado.') };
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-review-notification', {
      body: { action: 'test', userId }
    });

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return {
      success: data?.success ?? true,
      message: data?.message || 'Prueba enviada con éxito',
      error: null
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error('Error al enviar notificación de prueba.')
    };
  }
}
