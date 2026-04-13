/**
 * 사용자 예약 내역 페이지
 *
 * 사용자 본인의 예약 내역 조회 및 취소 기능.
 * React Query + StatusTabs + ListSkeleton + EmptyState 적용.
 */
'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMyReservations, useUpdateReservationStatus } from '@/hooks/queries';
import { StatusTabs } from '@/components/common/StatusTabs';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';
import {
  ReservationStatus,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
} from '@/types/reservation.types';
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
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // 인증 가드
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push(ROUTES.LOGIN);
      } else if (!hasMembership) {
        router.push(ROUTES.JOIN);
      }
    }
  }, [authLoading, isAuthenticated, hasMembership, router]);

  const isReady = !authLoading && isAuthenticated && hasMembership;
  const queryStatus = filter === 'all' ? undefined : filter;
  const { data: reservations = [], isLoading, error } = useMyReservations(queryStatus, isReady);
  const updateMutation = useUpdateReservationStatus();

  /** 예약 취소 핸들러 */
  const handleCancel = async (reservationId: string) => {
    if (!confirm('예약을 취소하시겠습니까?')) return;
    try {
      setCancellingId(reservationId);
      await updateMutation.mutateAsync({ id: reservationId, status: 'cancelled' });
    } catch (err) {
      alert(err instanceof Error ? err.message : '취소에 실패했습니다');
    } finally {
      setCancellingId(null);
    }
  };

  /** 날짜 포맷 (요일 포함) */
  const formatDateWithDay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}. ${month}. ${day}. (${dayOfWeek})`;
  };

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
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">예약 내역</h1>
          <p className="text-sm text-gray-500">나의 예약 내역을 확인하세요</p>
        </div>

        {/* 상태 필터 탭 */}
        <div className="mb-4">
          <StatusTabs
            tabs={STATUS_FILTERS}
            active={filter}
            onChange={setFilter}
            activeColor="bg-primary"
          />
        </div>

        {/* 에러 상태 */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error instanceof Error ? error.message : '예약 목록을 불러오는데 실패했습니다'}
          </div>
        )}

        {/* 예약 목록 */}
        {isLoading ? (
          <ListSkeleton count={3} variant="card" />
        ) : reservations.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="예약 내역이 없습니다"
            description={
              filter === 'all'
                ? '아직 예약하신 내역이 없습니다'
                : `${STATUS_FILTERS.find((f) => f.value === filter)?.label} 상태의 예약이 없습니다`
            }
            action={{ label: '예약하기', onClick: () => router.push(ROUTES.USER_RESERVE) }}
          />
        ) : (
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
                  {/* 헤더: 날짜 + 상태 뱃지 */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">
                      {formatDateWithDay(reservation.date)}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${RESERVATION_STATUS_COLORS[reservation.status]}`}
                    >
                      {RESERVATION_STATUS_LABELS[reservation.status]}
                    </span>
                  </div>

                  {/* 상세 정보 */}
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

                  {/* 메모 */}
                  {reservation.notes && (
                    <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                      {reservation.notes}
                    </p>
                  )}

                  {/* 거절 사유 */}
                  {reservation.status === 'rejected' && reservation.rejectionReason && (
                    <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg p-3">
                      거절 사유: {reservation.rejectionReason}
                    </p>
                  )}

                  {/* 취소 버튼 */}
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
