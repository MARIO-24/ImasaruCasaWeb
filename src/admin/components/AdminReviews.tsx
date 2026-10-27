import React, { useState, useMemo } from 'react';
import { 
  Star, 
  CheckCircle, 
  Trash2, 
  Clock, 
  AlertCircle, 
  Search,
  MessageSquare,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { Review } from '../../types';
import { ConfirmModal } from './ConfirmModal';

interface AdminReviewsProps {
  reviews: Review[];
  onApproveReview: (id: string) => Promise<{ success: boolean; error: Error | null }>;
  onDeleteReview: (id: string) => Promise<{ success: boolean; error: Error | null }>;
  loading?: boolean;
}

export const AdminReviews: React.FC<AdminReviewsProps> = ({
  reviews,
  onApproveReview,
  onDeleteReview,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for actions
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Counts
  const pendingCount = useMemo(() => reviews.filter((r) => !r.approved).length, [reviews]);
  const approvedCount = useMemo(() => reviews.filter((r) => r.approved).length, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (activeTab === 'pending' && r.approved) return false;
      if (activeTab === 'approved' && !r.approved) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesAuthor = r.author_name.toLowerCase().includes(query);
        const matchesComment = r.comment.toLowerCase().includes(query);
        const matchesStay = r.stay_date?.toLowerCase().includes(query) ?? false;
        return matchesAuthor || matchesComment || matchesStay;
      }

      return true;
    });
  }, [reviews, activeTab, searchTerm]);

  // Handle Approve
  const handleApprove = async (id: string) => {
    setApprovingId(id);
    await onApproveReview(id);
    setApprovingId(null);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    await onDeleteReview(reviewToDelete.id);
    setIsDeleting(false);
    setReviewToDelete(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-sand-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-timber-950">
            Moderación de Opiniones
          </h2>
          <p className="text-xs sm:text-sm text-timber-500 mt-0.5">
            Revisa y aprueba testimonios de huéspedes antes de que aparezcan en la web pública
          </p>
        </div>

        {/* Status notice */}
        {pendingCount > 0 ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>{pendingCount} {pendingCount === 1 ? 'opinión pendiente' : 'opiniones pendientes'}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Todas las opiniones moderadas</span>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-sand-200 shadow-sm p-6 space-y-6">
        {/* Navigation Tabs and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200">
          <div className="flex items-center gap-1.5 bg-sand-100 p-1 rounded-2xl border border-sand-200">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'pending'
                  ? 'bg-white text-timber-950 shadow-sm'
                  : 'text-timber-600 hover:text-timber-950'
              }`}
            >
              <span>Pendientes</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('approved')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'approved'
                  ? 'bg-white text-timber-950 shadow-sm'
                  : 'text-timber-600 hover:text-timber-950'
              }`}
            >
              <span>Publicadas ({approvedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-timber-950 shadow-sm'
                  : 'text-timber-600 hover:text-timber-950'
              }`}
            >
              <span>Todas ({reviews.length})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-timber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por autor o texto..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-sand-50 border border-sand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-500"
            />
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="py-12 text-center text-timber-500 text-sm">
            Cargando opiniones...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="w-10 h-10 text-sand-300 mx-auto mb-3" />
            <p className="text-timber-700 font-medium text-sm">
              {activeTab === 'pending'
                ? 'No hay opiniones pendientes de moderación.'
                : 'No se encontraron opiniones.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-3 text-xs text-terracotta-600 font-bold hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const isApproving = approvingId === review.id;

              return (
                <div
                  key={review.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    !review.approved
                      ? 'border-amber-300 bg-amber-50/30 ring-1 ring-amber-300/40'
                      : 'border-sand-200 bg-white hover:border-sand-300 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Review Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {/* Status Badge */}
                        {!review.approved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3.5 h-3.5" />
                            Pendiente de moderación
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Publicada en la web
                          </span>
                        )}

                        {/* Star Rating */}
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-sand-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-amber-700 ml-1">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      {/* Author & Stay info */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-timber-600">
                        <span className="font-bold text-sm text-timber-950">
                          {review.author_name}
                        </span>
                        {review.stay_date && (
                          <span className="flex items-center gap-1 text-timber-500">
                            <Calendar className="w-3 h-3" />
                            Estancia: {review.stay_date}
                          </span>
                        )}
                        {review.created_at && (
                          <span className="text-[11px] text-timber-400">
                            • Recibida el {review.created_at.split('T')[0]}
                          </span>
                        )}
                      </div>

                      {/* Comment text */}
                      <p className="text-xs sm:text-sm text-timber-800 italic bg-sand-50/80 p-3.5 rounded-xl border border-sand-200/80 leading-relaxed whitespace-pre-wrap">
                        "{review.comment}"
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-sand-100">
                      {!review.approved && (
                        <button
                          type="button"
                          disabled={isApproving}
                          onClick={() => handleApprove(review.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{isApproving ? 'Publicando...' : 'Aprobar y publicar'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setReviewToDelete(review)}
                        className="px-3 py-2 rounded-xl border border-sand-200 hover:border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
                        title="Eliminar opinión permanentemente"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={reviewToDelete !== null}
        title="Eliminar Opinión"
        message={
          reviewToDelete
            ? `¿Estás seguro de que deseas eliminar permanentemente la opinión de "${reviewToDelete.author_name}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setReviewToDelete(null)}
      />
    </div>
  );
};

