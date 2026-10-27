import React from 'react';
import { Home, Calendar, MessageSquare, LogOut, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export interface AdminLayoutProps {
  activeTab: 'dashboard' | 'reservas' | 'resenas';
  onTabChange: (tab: 'dashboard' | 'reservas' | 'resenas') => void;
  pendingReviewsCount?: number;
  notification?: { type: 'success' | 'error'; message: string } | null;
  onClearNotification?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onTabChange,
  pendingReviewsCount = 0,
  notification,
  onClearNotification,
  children,
}) => {
  const { adminEmail, signOut } = useAdminAuth();

  return (
    <div className="min-h-screen bg-sand-100 flex flex-col text-timber-900 pb-24 md:pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sand-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onTabChange('dashboard')}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-timber-900 text-terracotta-400 flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                  I
                </div>
                <div>
                  <span className="font-serif text-base sm:text-lg font-bold text-timber-950 group-hover:text-terracotta-600 transition-colors block leading-tight">
                    Imasaru Gestión
                  </span>
                  <span className="text-[10px] text-timber-500 font-semibold tracking-wider uppercase block">
                    Panel Propietario
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 bg-sand-100/80 p-1.5 rounded-2xl border border-sand-200">
              <button
                type="button"
                onClick={() => onTabChange('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-timber-950 shadow-sm'
                    : 'text-timber-700 hover:text-timber-950 hover:bg-white/50'
                }`}
              >
                <Home className="w-4 h-4 text-terracotta-600" />
                <span>Panel Principal</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('reservas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'reservas'
                    ? 'bg-white text-timber-950 shadow-sm'
                    : 'text-timber-700 hover:text-timber-950 hover:bg-white/50'
                }`}
              >
                <Calendar className="w-4 h-4 text-terracotta-600" />
                <span>Reservas & Calendario</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('resenas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold relative transition-all ${
                  activeTab === 'resenas'
                    ? 'bg-white text-timber-950 shadow-sm'
                    : 'text-timber-700 hover:text-timber-950 hover:bg-white/50'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-terracotta-600" />
                <span>Reseñas</span>
                {pendingReviewsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {pendingReviewsCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Right Action Icons & Admin Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Admin Identity pill */}
              {adminEmail && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand-100 text-timber-800 text-xs font-medium border border-sand-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="max-w-[150px] truncate">{adminEmail}</span>
                </div>
              )}

              {/* View Public Web button */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-sand-300 text-timber-700 hover:bg-sand-100 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                title="Ver web pública en una pestaña nueva"
              >
                <span className="hidden sm:inline">Ver Web</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Logout button */}
              <button
                type="button"
                onClick={() => signOut()}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-timber-900 hover:bg-terracotta-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Floating Notification Banner */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div
            className={`p-4 rounded-2xl flex items-center justify-between shadow-md text-xs sm:text-sm font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                : 'bg-rose-50 text-rose-900 border border-rose-300'
            }`}
          >
            <span>{notification.message}</span>
            {onClearNotification && (
              <button
                type="button"
                onClick={onClearNotification}
                className="p-1 rounded-lg hover:bg-black/5 text-current transition-colors ml-3"
                aria-label="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-1 w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (PWA Thumb-friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sand-200 py-2 px-6 flex items-center justify-around md:hidden shadow-lg safe-area-pb">
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[64px] min-h-[48px] ${
            activeTab === 'dashboard'
              ? 'text-terracotta-600 font-bold'
              : 'text-timber-600 hover:text-timber-900 font-medium'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Inicio</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('reservas')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[64px] min-h-[48px] ${
            activeTab === 'reservas'
              ? 'text-terracotta-600 font-bold'
              : 'text-timber-600 hover:text-timber-900 font-medium'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Reservas</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('resenas')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl relative transition-all min-w-[64px] min-h-[48px] ${
            activeTab === 'resenas'
              ? 'text-terracotta-600 font-bold'
              : 'text-timber-600 hover:text-timber-900 font-medium'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 mb-0.5" />
            {pendingReviewsCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                {pendingReviewsCount}
              </span>
            )}
          </div>
          <span className="text-[11px]">Reseñas</span>
        </button>
      </nav>
    </div>
  );
};
