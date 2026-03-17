'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import {
  Reservation,
  ReservationStatus,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
} from '@/types/reservation.types';
import { getMyReservations, updateReservationStatus } from '@/services/reservation.service';
import {
  Calendar,
  Clock,
  FileText,
  Loader2,
  CalendarX,
  AlertCircle,
  X,
} from 'lucide-react';

type FilterStatus = ReservationStatus | 'all';

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '예약 요청' },
  { value: 'confirmed', label: '예약 확정' },
  { value: 'completed', label: '상담 완료' },
  { value: 'cancelled', label: '취소됨' },
];

export default function ReservationsPage() {
  const { user, isLoading: authLoading, isAuthenticated, hasMembership } = useAuth();
  const router = useRouter();

  const [filter, setFilter] = useState<FilterStatus>('all');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push(ROUTES.LOGIN);
      } else if (!hasMembership) {
        router.push(ROUTES.JOIN);
      }
    }
  }, [authLoading, isAuthenticated, hasMembership, router]);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const status = filter === 'all' ? undefined : filter;
      const data = await getMyReservations(status);
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '예약 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isAuthenticated && hasMembership) {
      fetchReservations();
    }
  }, [isAuthenticated, hasMembership, fetchReservations]);

  const handleCancel = async (reservationId: string) => {
    if (!confirm('예약을 취소하시겠습니까?')) return;

    try {
      setCancellingId(reservationId);
      await updateReservationStatus(reservationId, { status: 'cancelled' });
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationId ? { ...r, status: 'cancelled' as ReservationStatus } : r
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : '취소에 실패했습니다');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}. ${month}. ${day}. (${dayOfWeek})`;
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">예약 내역</h1>
          <p className="text-sm text-gray-500">나의 예약 내역을 확인하세요</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 w-32 bg-gray-100 rounded" />
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-4 w-40 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <CalendarX className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">예약 내역이 없습니다</h3>
            <p className="text-sm text-gray-500 mb-6">
              {filter === 'all'
                ? '아직 예약하신 내역이 없습니다'
                : `${STATUS_FILTERS.find((f) => f.value === filter)?.label} 상태의 예약이 없습니다`}
            </p>
            <button
              onClick={() => router.push(ROUTES.USER_RESERVE)}
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              예약하기
            </button>
          </div>
        ) : (
          /* Reservation Cards */
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const canCancel =
                reservation.status === 'pending' || reservation.status === 'confirmed';
              const isCancelling = cancellingId === reservation.id;

              return (
                <div
                  key={reservation.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 transition-all hover:shadow-md"
                >
                  {/* Header: Date + Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">
                      {formatDate(reservation.date)}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        RESERVATION_STATUS_COLORS[reservation.status]
                      }`}
                    >
                      {RESERVATION_STATUS_LABELS[reservation.status]}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{reservation.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{reservation.consultationType}</span>
                    </div>
                    {reservation.totalPrice > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{reservation.totalPrice.toLocaleString()}원</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {reservation.notes && (
                    <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                      {reservation.notes}
                    </p>
                  )}

                  {/* Rejection Reason */}
                  {reservation.status === 'rejected' && reservation.rejectionReason && (
                    <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg p-3">
                      거절 사유: {reservation.rejectionReason}
                    </p>
                  )}

                  {/* Cancel Button */}
                  {canCancel && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleCancel(reservation.id)}
                        disabled={isCancelling}
                        className="flex items-center gap-1.5 text-sm text-red-500 font-medium hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        {isCancelling ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        {isCancelling ? '취소 중...' : '예약 취소'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
