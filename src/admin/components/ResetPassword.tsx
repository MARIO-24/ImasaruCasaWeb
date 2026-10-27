import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { updateAdminPassword } from '../../lib/supabase/client';
import { supabase } from '../../lib/supabase/client';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isRecoverySession, setIsRecoverySession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if there is an active session or recovery token in URL
    const checkSession = async () => {
      if (!supabase) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      const hash = window.location.hash;
      const isRecovery = Boolean(session || hash.includes('type=recovery') || hash.includes('access_token'));
      setIsRecoverySession(isRecovery);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor compruébalas.');
      return;
    }

    setIsSubmitting(true);

    const { success: ok, error: updateError } = await updateAdminPassword(password);
    setIsSubmitting(false);

    if (!ok || updateError) {
      setError(updateError?.message || 'Error al actualizar la contraseña.');
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/admin';
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-sand-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <a
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-timber-600 hover:text-terracotta-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio de sesión de gestión</span>
        </a>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-timber-900 text-sand-50 shadow-md mb-3">
            <KeyRound className="w-7 h-7 text-terracotta-400" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-timber-950 tracking-tight">
            Restablecer Contraseña
          </h1>
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600 mt-1 inline-block">
            Casa Vacacional Imasaru Gestión
          </span>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-sand-200">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-xl font-bold text-timber-950 mb-2">
                ¡Contraseña Actualizada!
              </h2>
              <p className="text-sm text-timber-700 leading-relaxed mb-6">
                Tu nueva contraseña se ha guardado correctamente. Redirigiéndote al panel de gestión en unos segundos...
              </p>
              <a
                href="/admin"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-timber-900 hover:bg-terracotta-600 text-white font-medium text-sm transition-colors shadow-md"
              >
                <span>Ir al panel ahora</span>
              </a>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {isRecoverySession === false && (
                <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Asegúrate de haber accedido mediante el enlace que has recibido en tu correo electrónico para verificar tu identidad.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-semibold text-timber-800 mb-1.5"
                  >
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-timber-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-sand-300 text-sm text-timber-900 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-timber-400 hover:text-timber-700"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-timber-800 mb-1.5"
                  >
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-timber-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-sand-300 text-sm text-timber-900 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-timber-900 hover:bg-terracotta-600 text-white font-medium text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <span>Guardar Nueva Contraseña</span>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 pt-5 border-t border-sand-200 text-center">
            <p className="text-xs text-timber-500">
              Casa Vacacional Imasaru • Conil de la Frontera, Cádiz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

