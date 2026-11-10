import React, { useState, useEffect, useCallback } from 'react';
import { 
  BellRing, 
  BellOff, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Loader2, 
  Send, 
  Trash2, 
  RefreshCw,
  Info,
  Check
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { 
  getAdminNotificationPreferences, 
  saveAdminNotificationPreferences,
  saveAdminPushSubscription,
  deleteAdminPushSubscription,
  getAdminPushSubscriptions,
  triggerTestPushNotification,
  urlBase64ToUint8Array,
  AdminPushSubscriptionItem
} from '../../lib/supabase/client';

export const AdminSettings: React.FC = () => {
  const { user, adminEmail } = useAdminAuth();

  // 1. Notification Preference State (Per-Admin in Supabase)
  const [notifyNewReviews, setNotifyNewReviews] = useState<boolean>(true);
  const [loadingPrefs, setLoadingPrefs] = useState<boolean>(true);

  // 2. Web Push Device Capability and Permission State
  const [isPushSupported, setIsPushSupported] = useState<boolean>(false);
  const [isStandalonePwa, setIsStandalonePwa] = useState<boolean>(false);
  const [isIosDevice, setIsIosDevice] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [currentSubscription, setCurrentSubscription] = useState<PushSubscription | null>(null);
  const [togglingPush, setTogglingPush] = useState<boolean>(false);

  // 3. Registered Devices List
  const [devices, setDevices] = useState<AdminPushSubscriptionItem[]>([]);
  const [loadingDevices, setLoadingDevices] = useState<boolean>(false);

  // 4. Test Notification State
  const [sendingTest, setSendingTest] = useState<boolean>(false);

  // Default production VAPID public key (Application Server Key)
  const DEFAULT_VAPID_PUBLIC_KEY = 'BBGyVQorNwuDHbnP-MUvlB1lVrEqMIkwSgLOfRqWYJEDwP4SlgIqt3ff1FaJtB48wuZK5wYG91HzYM3P9Ubmc5U';

  // 5. Feedback Notice State
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // VAPID configuration check
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;
  const isVapidConfigured = Boolean(vapidPublicKey);

  const showFeedback = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((curr) => (curr?.text === text ? null : curr));
    }, 5000);
  }, []);

  // Check browser capabilities & platform
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent || '';
    const isIos = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIosDevice(isIos);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalonePwa(isStandalone);

    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsPushSupported(supported);

    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Load preferences from Supabase
  const loadPreferences = useCallback(async () => {
    if (!user) return;
    setLoadingPrefs(true);
    const { preferences, error } = await getAdminNotificationPreferences(user.id);
    if (!error) {
      setNotifyNewReviews(preferences.notifyNewReviews);
    }
    setLoadingPrefs(false);
  }, [user]);

  // Load registered devices list
  const loadDevices = useCallback(async () => {
    if (!user) return;
    setLoadingDevices(true);
    const { subscriptions } = await getAdminPushSubscriptions(user.id);
    setDevices(subscriptions);
    setLoadingDevices(false);
  }, [user]);

  // Check current device local PushSubscription
  const checkCurrentSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setCurrentSubscription(sub);
    } catch (err) {
      console.warn('Error comprobando suscripción local:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadPreferences();
      loadDevices();
      checkCurrentSubscription();
    }
  }, [user, loadPreferences, loadDevices, checkCurrentSubscription]);

  // Push notifications active state on this device
  const isPushActive = Boolean(currentSubscription && permissionStatus === 'granted' && notifyNewReviews);

  // Modern Toggle Push Notifications Handler (Subscribe / Unsubscribe & Sync Preference)
  const handleTogglePush = async () => {
    if (!user || togglingPush || loadingPrefs) return;

    if (isPushActive) {
      // DESACTIVAR: Dar de baja este dispositivo y pausar preferencias en Supabase
      setTogglingPush(true);
      try {
        if (currentSubscription) {
          const endpoint = currentSubscription.endpoint;
          try {
            await currentSubscription.unsubscribe();
          } catch (unsubErr) {
            console.warn('Aviso al desuscribir del navegador:', unsubErr);
          }
          await deleteAdminPushSubscription(endpoint);
          setCurrentSubscription(null);
        }

        // Guardar preferencia desactivada en Supabase
        const { success: prefSuccess, error: prefError } = await saveAdminNotificationPreferences(user.id, false);
        if (prefSuccess) {
          setNotifyNewReviews(false);
        } else if (prefError) {
          console.warn('Aviso guardando preferencia desactivada:', prefError);
        }

        await loadDevices();
        showFeedback('info', 'Notificaciones desactivadas en este dispositivo.');
      } catch (err: any) {
        showFeedback('error', `Error al desactivar notificaciones: ${err.message || 'Error desconocido'}`);
      } finally {
        setTogglingPush(false);
      }
    } else {
      // ACTIVAR: Validar compatibilidad, solicitar permiso al navegador y registrar suscripción
      if (!isPushSupported) {
        showFeedback('error', 'Tu navegador o dispositivo actual no admite notificaciones Web Push.');
        return;
      }

      if (permissionStatus === 'denied') {
        showFeedback(
          'error',
          'Permiso de notificaciones bloqueado en tu navegador. Debes habilitarlo en los ajustes del navegador o en el candado de la barra de direcciones.'
        );
        return;
      }

      if (!vapidPublicKey) {
        showFeedback(
          'error',
          'La clave pública VAPID no está configurada.'
        );
        return;
      }

      setTogglingPush(true);

      try {
        // 1. Solicitar permiso al navegador
        const perm = await Notification.requestPermission();
        setPermissionStatus(perm);

        if (perm !== 'granted') {
          showFeedback(
            'error',
            perm === 'denied'
              ? 'Permiso de notificaciones bloqueado. Debes habilitarlo en los ajustes de tu navegador.'
              : 'No se concedió permiso para enviar notificaciones.'
          );
          return;
        }

        // 2. Obtener registration del Service Worker
        const registration = await navigator.serviceWorker.ready;
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        // 3. Suscribir en PushManager del navegador
        let sub = await registration.pushManager.getSubscription();
        if (!sub) {
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey as unknown as BufferSource
          });
        }

        // 4. Determinar nombre amigable del dispositivo
        let deviceName = 'Navegador Web';
        const ua = navigator.userAgent;
        if (/iPhone/.test(ua)) deviceName = 'iPhone (PWA Safari)';
        else if (/iPad/.test(ua)) deviceName = 'iPad (PWA Safari)';
        else if (/Android/.test(ua)) deviceName = 'Móvil Android (Chrome)';
        else if (/Macintosh/.test(ua)) deviceName = 'Mac (Navegador)';
        else if (/Windows/.test(ua)) deviceName = 'PC Windows (Navegador)';

        // 5. Guardar suscripción en Supabase
        const { success, error } = await saveAdminPushSubscription(user.id, sub, deviceName);

        if (success) {
          setCurrentSubscription(sub);

          // 6. Activar la preferencia en Supabase si estaba desactivada
          if (!notifyNewReviews) {
            const { success: prefSuccess } = await saveAdminNotificationPreferences(user.id, true);
            if (prefSuccess) {
              setNotifyNewReviews(true);
            }
          }

          await loadDevices();
          showFeedback('success', `¡Notificaciones activadas en este dispositivo (${deviceName})!`);
        } else {
          showFeedback('error', `Error al registrar dispositivo en Supabase: ${error?.message || 'Error desconocido'}`);
        }
      } catch (err: any) {
        console.error('Error al suscribir dispositivo a Web Push:', err);
        showFeedback('error', `No se pudo activar el servicio push: ${err.message || 'Error desconocido'}`);
      } finally {
        setTogglingPush(false);
      }
    }
  };

  // Delete a specific remote device
  const handleDeleteRemoteDevice = async (endpoint: string) => {
    const { success, error } = await deleteAdminPushSubscription(endpoint);
    if (success) {
      if (currentSubscription && currentSubscription.endpoint === endpoint) {
        try {
          await currentSubscription.unsubscribe();
        } catch {}
        setCurrentSubscription(null);
      }
      await loadDevices();
      showFeedback('success', 'Dispositivo eliminado correctamente.');
    } else {
      showFeedback('error', `Error al eliminar dispositivo: ${error?.message || 'Error desconocido'}`);
    }
  };

  // Send test push notification
  const handleSendTestPush = async () => {
    if (!user) return;
    setSendingTest(true);

    try {
      const { success, message, error } = await triggerTestPushNotification(user.id);
      if (success) {
        showFeedback('success', message || 'Notificación de prueba enviada a tus dispositivos.');
      } else {
        showFeedback('error', error?.message || 'No se pudo enviar la prueba.');
      }
    } catch (err: any) {
      showFeedback('error', `Error al enviar prueba: ${err.message}`);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-sand-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-timber-950">
              Ajustes y Configuración
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-sand-100 text-timber-700 text-xs font-semibold border border-sand-200">
              Gestión
            </span>
          </div>
          <p className="text-xs sm:text-sm text-timber-500 mt-1">
            Configura las preferencias de notificación y vincula tus dispositivos para recibir avisos de nuevas reseñas
          </p>
        </div>

        {adminEmail && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-sand-50 border border-sand-200 text-timber-800 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate max-w-[200px]">{adminEmail}</span>
          </div>
        )}
      </div>

      {/* Floating feedback alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium border shadow-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
              : feedback.type === 'error'
              ? 'bg-rose-50 text-rose-950 border-rose-300'
              : 'bg-atlantic-950/10 text-atlantic-950 border-atlantic-800/20'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-timber-600 flex-shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:opacity-80"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* TARJETA PRINCIPAL: Notificaciones push con interruptor toggle moderno */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm transition-all space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Título y descripción */}
          <div className="space-y-1.5 flex-1 pr-0 sm:pr-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
                isPushActive 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                  : 'bg-sand-100 text-timber-600 border border-sand-200'
              }`}>
                {isPushActive ? <BellRing className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-timber-950">
                Notificaciones push
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-timber-600 leading-relaxed max-w-xl">
              Recibe avisos cuando un visitante envíe una nueva opinión
            </p>
          </div>

          {/* Interruptor toggle switch */}
          <div className="flex flex-col sm:items-end gap-1.5 flex-shrink-0">
            <button
              type="button"
              role="switch"
              aria-checked={isPushActive}
              aria-label="Activar o desactivar notificaciones push"
              disabled={togglingPush || loadingPrefs || (!isPushActive && !isPushSupported)}
              onClick={handleTogglePush}
              className={`group relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:ring-offset-2 ${
                isPushActive 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-sand-300 hover:bg-sand-400'
              } ${(togglingPush || loadingPrefs) ? 'opacity-70 cursor-wait' : ''} ${(!isPushActive && !isPushSupported) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${
                  isPushActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {togglingPush ? (
                  <Loader2 className={`w-3.5 h-3.5 animate-spin ${isPushActive ? 'text-emerald-600' : 'text-timber-700'}`} />
                ) : isPushActive ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                ) : null}
              </span>
            </button>
          </div>
        </div>

        {/* Estado textual debajo y botón de prueba */}
        <div className="pt-4 border-t border-sand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              togglingPush 
                ? 'bg-amber-500 animate-pulse' 
                : isPushActive 
                ? 'bg-emerald-500' 
                : 'bg-timber-300'
            }`} />
            <span className="text-xs sm:text-sm font-medium text-timber-800">
              {togglingPush ? (
                <span className="text-timber-600 italic">
                  {isPushActive ? 'Desactivando notificaciones...' : 'Activando notificaciones...'}
                </span>
              ) : isPushActive ? (
                'Notificaciones activadas en este dispositivo'
              ) : (
                'Notificaciones desactivadas'
              )}
            </span>
          </div>

          {/* Botón de prueba */}
          <button
            type="button"
            disabled={sendingTest || (!isPushActive && devices.length === 0)}
            onClick={handleSendTestPush}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-sand-300 hover:bg-sand-100 text-timber-800 font-medium text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-sm"
            title="Envía una notificación push de prueba a tus dispositivos"
          >
            {sendingTest ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-terracotta-600" />
            ) : (
              <Send className="w-3.5 h-3.5 text-terracotta-600" />
            )}
            <span>Enviar notificación de prueba</span>
          </button>
        </div>

        {/* Mensajes de error o advertencia claros si el navegador no permite activar notificaciones */}
        {permissionStatus === 'denied' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <p className="font-bold">Permiso de notificaciones bloqueado</p>
              <p className="text-xs text-rose-900 leading-relaxed">
                Has bloqueado las notificaciones en este navegador. Para poder activarlas, haz clic en el icono del candado o ajustes del sitio junto a la barra de direcciones de tu navegador y cambia el permiso de Notificaciones a «Permitir».
              </p>
            </div>
          </div>
        )}

        {!isPushSupported && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <p className="font-bold">Navegador no compatible</p>
              {isIosDevice ? (
                <p className="text-xs text-amber-900 leading-relaxed">
                  En iPhone / iPad (iOS 16.4 o superior), Apple exige que la web esté añadida a la pantalla de inicio como aplicación:
                  pulsa el botón de <strong>Compartir de Safari (icono con flecha hacia arriba)</strong> y selecciona <strong>«Añadir a pantalla de inicio»</strong>. Luego abre Imasaru Gestión desde tu pantalla de inicio y vuelve a Ajustes.
                </p>
              ) : (
                <p className="text-xs text-amber-900 leading-relaxed">
                  Este navegador no admite notificaciones Web Push de forma nativa. Te recomendamos utilizar Google Chrome o Microsoft Edge.
                </p>
              )}
            </div>
          </div>
        )}

        {isPushSupported && isIosDevice && !isStandalonePwa && (
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 flex items-start gap-3 animate-fadeIn">
            <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <p className="font-bold">Instrucciones para iPhone / iPad</p>
              <p className="text-xs text-sky-900 leading-relaxed">
                Para recibir notificaciones push en iOS, pulsa el botón <strong>Compartir de Safari</strong> y elige <strong>«Añadir a pantalla de inicio»</strong>. A continuación, abre la app desde tu pantalla de inicio para activar las notificaciones.
              </p>
            </div>
          </div>
        )}

        {!isVapidConfigured && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <p className="font-bold">Clave pública VAPID no configurada</p>
              <p className="text-xs text-amber-900 leading-relaxed">
                No se ha encontrado la variable de entorno <code className="px-1.5 py-0.5 rounded bg-amber-100 font-mono text-[11px] font-semibold">VITE_VAPID_PUBLIC_KEY</code>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Registered Devices List */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-sand-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-timber-950">
              Dispositivos registrados ({devices.length})
            </h3>
            <p className="text-xs sm:text-sm text-timber-500 mt-0.5">
              Teléfonos y ordenadores autorizados para recibir notificaciones con tu cuenta
            </p>
          </div>
          <button
            type="button"
            onClick={loadDevices}
            disabled={loadingDevices}
            className="p-2 rounded-xl text-timber-500 hover:text-timber-900 hover:bg-sand-100 transition-colors"
            title="Refrescar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loadingDevices ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {devices.length === 0 ? (
          <div className="p-8 text-center bg-sand-50/60 rounded-2xl border border-dashed border-sand-300">
            <Smartphone className="w-8 h-8 text-sand-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-semibold text-timber-800">
              Aún no tienes dispositivos registrados
            </p>
            <p className="text-xs text-timber-500 max-w-sm mx-auto mt-1">
              Pulsa en «Activar notificaciones en este dispositivo» para vincular tu teléfono u ordenador.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-sand-200 border border-sand-200 rounded-2xl overflow-hidden">
            {devices.map((device, index) => {
              const isCurrent = currentSubscription && currentSubscription.endpoint === device.endpoint;
              return (
                <div
                  key={device.id || index}
                  className="p-4 flex items-center justify-between gap-3 bg-white hover:bg-sand-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-sand-100 text-timber-700 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-4 h-4 text-terracotta-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-timber-950 truncate block">
                          {device.deviceName || 'Navegador Web'}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex-shrink-0">
                            Este equipo
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-timber-500 block">
                        Registrado el {new Date(device.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteRemoteDevice(device.endpoint)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
                    title="Eliminar este dispositivo"
                    aria-label="Eliminar dispositivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
