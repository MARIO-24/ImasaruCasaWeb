import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, LogOut, ArrowLeft, Home, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { requestPasswordReset } from '../../lib/supabase/client';

interface AdminLoginProps {
  onGoHome?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onGoHome }) => {
  const { user, isAdmin, loading, authError, signIn, signOut } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Forgot Password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLocalError('Por favor introduce tu correo electrónico y contraseña.');
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);

    const { success, error } = await signIn(email, password, rememberMe);
    setIsSubmitting(false);

    if (!success && error) {
      setLocalError(error);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Por favor introduce tu correo electrónico.');
      return;
    }

    setForgotError(null);
    setForgotSubmitting(true);

    const { success, error } = await requestPasswordReset(forgotEmail);
    setForgotSubmitting(false);

    if (!success || error) {
      setForgotError(error?.message || 'Error al solicitar el enlace de recuperación.');
    } else {
      setForgotSuccess(true);
    }
  };

  // State: Logged in but not in app_admins
  if (user && !isAdmin && !loading) {
    return (
      <div className="min-h-screen bg-sand-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-sand-200 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-timber-950 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-sm text-timber-700 leading-relaxed mb-4">
              Has iniciado sesión como <strong className="text-timber-900">{user.email}</strong>, pero esta cuenta no está autorizada para administrar el panel de <strong>Casa Vacacional Imasaru Gestión</strong>.
            </p>
            <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200 text-xs text-timber-600 mb-6 text-left">
              Para obtener acceso administrativo, solicita a uno de los propietarios autorizados que incluya tu identificador de usuario en la tabla de administradores de Supabase.
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => signOut()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-timber-900 hover:bg-terracotta-600 text-white font-medium text-sm transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión / Usar otra cuenta</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onGoHome) onGoHome();
                  else window.location.href = '/';
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-sand-300 text-timber-700 text-sm font-medium hover:bg-sand-100 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Volver a la web pública</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      {/* Return link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <button
          type="button"
          onClick={() => {
            if (onGoHome) onGoHome();
            else window.location.href = '/';
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-timber-600 hover:text-terracotta-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la web pública de Casa Imasaru</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-timber-900 text-sand-50 shadow-md mb-3">
            <Lock className="w-7 h-7 text-terracotta-400" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-timber-950 tracking-tight">
            Casa Vacacional Imasaru
          </h1>
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600 mt-1 inline-block">
            Panel Privado de Gestión
          </span>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-sand-200">
          {showForgotPassword ? (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-sand-100 text-terracotta-600 flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-xl font-bold text-timber-950">
                  Recuperar Contraseña
                </h2>
                <p className="text-xs text-timber-600 mt-1 leading-relaxed">
                  Introduce tu correo electrónico y recibirás un enlace seguro para crear una nueva contraseña.
                </p>
              </div>

              {forgotError && (
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-timber-900 text-sm mb-1">
                    Enlace de recuperación enviado
                  </h3>
                  <p className="text-xs text-timber-600 leading-relaxed mb-5">
                    Hemos enviado un enlace a <strong>{forgotEmail}</strong>. Revisa tu bandeja de entrada o spam para restablecer tu contraseña.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotSuccess(false);
                      setForgotError(null);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-timber-900 hover:bg-terracotta-600 text-white font-medium text-xs transition-colors"
                  >
                    <span>Volver al inicio de sesión</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="forgotEmailInput" className="block text-xs font-semibold text-timber-800 mb-1.5">
                      Correo Electrónico de Administración
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-timber-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="forgotEmailInput"
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="pilirufinofer@gmail.com"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-sand-300 text-sm text-timber-900 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-timber-900 hover:bg-terracotta-600 text-white font-medium text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {forgotSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Enviando enlace...</span>
                      </>
                    ) : (
                      <span>Enviar enlace de recuperación</span>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="text-xs font-medium text-timber-600 hover:text-terracotta-600"
                    >
                      ← Volver a iniciar sesión
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {(localError || authError) && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{localError || authError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="adminEmail" className="block text-xs font-semibold text-timber-800 mb-1.5">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-timber-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="adminEmail"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="pilirufinofer@gmail.com"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-sand-300 text-sm text-timber-900 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="adminPassword" className="block text-xs font-semibold text-timber-800 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-timber-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="adminPassword"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
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

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-timber-700 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-sand-300 text-terracotta-600 focus:ring-terracotta-500/20"
                    />
                    <span>Mantener sesión iniciada</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email || 'pilirufinofer@gmail.com');
                      setShowForgotPassword(true);
                      setForgotError(null);
                      setForgotSuccess(false);
                    }}
                    className="font-medium text-terracotta-600 hover:text-terracotta-700 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-timber-900 hover:bg-terracotta-600 text-white font-medium text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Iniciando sesión...</span>
                      </>
                    ) : (
                      <span>Iniciar Sesión</span>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 pt-5 border-t border-sand-200 text-center">
            <p className="text-xs text-timber-500 leading-relaxed">
              Sistema protegido por Supabase Auth & RLS. Solo tienen acceso las cuentas individuales autorizadas en <code className="text-timber-700 font-mono">app_admins</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

