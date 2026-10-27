import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminLogin } from '../components/AdminLogin';
import { ResetPassword } from '../components/ResetPassword';
import { AdminLayout } from '../components/AdminLayout';
import { AdminDashboard } from '../components/AdminDashboard';
import { AdminBookings } from '../components/AdminBookings';
import { AdminReviews } from '../components/AdminReviews';
import { BookingModal } from '../components/BookingModal';
import { 
  fetchAllBookingsAdmin, 
  createBookingAdmin, 
  updateBookingAdmin, 
  deleteBookingAdmin, 
  fetchAllReviewsAdmin, 
  approveReviewAdmin, 
  deleteReviewAdmin 
} from '../../lib/supabase/client';
import { Booking, BookingInput, Review } from '../../types';
import { Loader2 } from 'lucide-react';

export const AdminRouter: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAdminAuth();

  // Tab State: parsed from window.location.pathname
  const getTabFromPath = (): 'dashboard' | 'reservas' | 'resenas' => {
    const path = window.location.pathname;
    if (path.includes('/admin/reservas')) return 'reservas';
    if (path.includes('/admin/resenas')) return 'resenas';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'reservas' | 'resenas'>(getTabFromPath);

  // Sync tab with browser history
  const handleTabChange = (tab: 'dashboard' | 'reservas' | 'resenas') => {
    setActiveTab(tab);
    const newPath = tab === 'dashboard' ? '/admin' : `/admin/${tab}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  }, []);

  // Global Quick Modal for Dashboard
  const [isQuickBookingModalOpen, setIsQuickBookingModalOpen] = useState(false);
  const [quickEditingBooking, setQuickEditingBooking] = useState<Booking | null>(null);

  // Load Bookings & Reviews
  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    setDataLoading(true);

    try {
      const [bookingsRes, reviewsRes] = await Promise.all([
        fetchAllBookingsAdmin(),
        fetchAllReviewsAdmin(),
      ]);

      if (bookingsRes.data) {
        setBookings(bookingsRes.data);
      }
      if (reviewsRes.data) {
        setReviews(reviewsRes.data);
      }
    } catch {
      showNotification('error', 'Error al sincronizar datos con el servidor.');
    } finally {
      setDataLoading(false);
    }
  }, [isAdmin, showNotification]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, loadData]);

  // Handlers for Bookings
  const handleSaveBooking = async (
    bookingInput: BookingInput,
    existingId?: string
  ): Promise<{ success: boolean; error: Error | null }> => {
    if (existingId) {
      const { error } = await updateBookingAdmin(existingId, bookingInput);
      if (error) {
        showNotification('error', `Error al actualizar: ${error.message}`);
        return { success: false, error };
      }
      showNotification('success', 'Reserva actualizada correctamente.');
      await loadData();
      return { success: true, error: null };
    } else {
      const { error } = await createBookingAdmin(bookingInput);
      if (error) {
        showNotification('error', `Error al crear: ${error.message}`);
        return { success: false, error };
      }
      showNotification('success', 'Reserva creada correctamente.');
      await loadData();
      return { success: true, error: null };
    }
  };

  const handleDeleteBooking = async (id: string): Promise<{ success: boolean; error: Error | null }> => {
    const { success, error } = await deleteBookingAdmin(id);
    if (!success || error) {
      showNotification('error', `Error al eliminar reserva: ${error?.message || 'Error desconocido'}`);
      return { success: false, error };
    }
    showNotification('success', 'Reserva eliminada con éxito.');
    await loadData();
    return { success: true, error: null };
  };

  // Handlers for Reviews
  const handleApproveReview = async (id: string): Promise<{ success: boolean; error: Error | null }> => {
    const { success, error } = await approveReviewAdmin(id);
    if (!success || error) {
      showNotification('error', `Error al aprobar opinión: ${error?.message || 'Error desconocido'}`);
      return { success: false, error };
    }
    showNotification('success', 'Opinión aprobada y publicada en la web pública.');
    await loadData();
    return { success: true, error: null };
  };

  const handleDeleteReview = async (id: string): Promise<{ success: boolean; error: Error | null }> => {
    const { success, error } = await deleteReviewAdmin(id);
    if (!success || error) {
      showNotification('error', `Error al eliminar opinión: ${error?.message || 'Error desconocido'}`);
      return { success: false, error };
    }
    showNotification('success', 'Opinión eliminada correctamente.');
    await loadData();
    return { success: true, error: null };
  };

  // Check if current path is password recovery
  if (window.location.pathname.startsWith('/admin/reset-password')) {
    return <ResetPassword />;
  }

  // 1. Initial Authentication Check State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-sand-100 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-terracotta-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-timber-800">
          Cargando Imasaru Gestión...
        </p>
      </div>
    );
  }

  // 2. Not logged in or not authorized
  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  // 3. Authorized Admin Panel
  const pendingReviewsCount = reviews.filter((r) => !r.approved).length;

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      pendingReviewsCount={pendingReviewsCount}
      notification={notification}
      onClearNotification={() => setNotification(null)}
    >
      {activeTab === 'dashboard' && (
        <AdminDashboard
          bookings={bookings}
          reviews={reviews}
          onNewBooking={() => {
            setQuickEditingBooking(null);
            setIsQuickBookingModalOpen(true);
          }}
          onEditBooking={(booking: Booking) => {
            setQuickEditingBooking(booking);
            setIsQuickBookingModalOpen(true);
          }}
          onNavigate={handleTabChange}
          loading={dataLoading}
        />
      )}

      {activeTab === 'reservas' && (
        <AdminBookings
          bookings={bookings}
          onSaveBooking={handleSaveBooking}
          onDeleteBooking={handleDeleteBooking}
          loading={dataLoading}
        />
      )}

      {activeTab === 'resenas' && (
        <AdminReviews
          reviews={reviews}
          onApproveReview={handleApproveReview}
          onDeleteReview={handleDeleteReview}
          loading={dataLoading}
        />
      )}

      {/* Global Quick Booking Modal for Dashboard triggers */}
      <BookingModal
        isOpen={isQuickBookingModalOpen}
        onClose={() => {
          setIsQuickBookingModalOpen(false);
          setQuickEditingBooking(null);
        }}
        initialBooking={quickEditingBooking}
        existingBookings={bookings}
        onSave={async (bookingInput: BookingInput) => {
          const res = await handleSaveBooking(bookingInput, quickEditingBooking?.id);
          if (res.success) {
            setIsQuickBookingModalOpen(false);
            setQuickEditingBooking(null);
          }
          return res.success;
        }}
      />
    </AdminLayout>
  );
};

