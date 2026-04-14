/**
 * 마스터 예약 관리 페이지
 *
 * 고객 예약 목록 조회, 상태 필터, 승인/거절/완료 처리.
 * React Query + StatusTabs + ListSkeleton + EmptyState 적용.
 */
'use client';

import { useState } from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterReservations, useUpdateReservationStatus, useCreateManualReservation } from '@/hooks/queries';
import { StatusTabs } from '@/components/common/StatusTabs';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils/format';
import {
  ReservationStatus,
  CreateManualReservationData,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
  RESERVATION_SOURCE_LABELS,
  getDurationLabel,
} from '@/types/reservation.types';
import {
  Calendar,
  Phone,
  Tag,
  CreditCard,
  Users,
} from 'lucide-react';
import { ManualReservationModal } from './_components/ManualReservationModal';

const STATUS_TABS: { value: ReservationStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '대기' },
  { value: 'confirmed', label: '확정' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소/거절' },
];

export default function MasterReservationsPage() {
  const { isReady } = useMasterAuth();
  const [activeStatus, setActiveStatus] = useState<ReservationStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // '취소/거절' 탭은 전체를 가져와서 클라이언트에서 필터링
  const queryStatus = activeStatus === 'all' || activeStatus === 'cancelled' ? undefined : activeStatus;
  const { data: reservations = [], isLoading } = useMasterReservations(queryStatus, isReady);
  const updateMutation = useUpdateReservationStatus();
  const createManualMutation = useCreateManualReservation();

  if (!isReady) return null;

  /** 클라이언트 필터링 (취소/거절 탭) */
  const filteredReservations =
    activeStatus === 'cancelled'
      ? reservations.filter((r) => r.status === 'cancelled' || r.status === 'rejected')
      : reservations;

  const pendingCount = reservations.filter((r) => r.status === 'pending').length;

  /** 예약 승인 */
  const handleApprove = async (reservationId: string) => {
    if (!confirm('이 예약을 승인하시겠습니까?')) return;
    try {
      await updateMutation.mutateAsync({ id: reservationId, status: 'confirmed' });
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '예약 승인에 실패했습니다');
    }
  };

  /** 예약 거절 */
  const handleReject = async (reservationId: string) => {
    const reason = prompt('거절 사유를 입력해주세요:');
    if (reason === null) return;
    try {
      await updateMutation.mutateAsync({ id: reservationId, status: 'rejected', rejectionReason: reason });
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '예약 거절에 실패했습니다');
    }
  };

  /** 상담 완료 처리 */
  const handleComplete = async (reservationId: string) => {
    if (!confirm('상담 완료 처리하시겠습니까?')) return;
    try {
      await updateMutation.mutateAsync({ id: reservationId, status: 'completed' });
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '완료 처리에 실패했습니다');
    }
  };

  /** 수동 예약 생성 */
  const handleManualSubmit = async (data: CreateManualReservationData) => {
    await createManualMutation.mutateAsync(data);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">예약 관리</h1>
            <p className="text-sm text-gray-500">고객 예약을 확인하고 관리하세요</p>
          </div>
        </div>

        {/* 상태 필터 탭 */}
        <StatusTabs
          tabs={STATUS_TABS.map((tab) => ({
            ...tab,
            count: tab.value === 'pending' ? pendingCount : undefined,
          }))}
          active={activeStatus}
          onChange={setActiveStatus}
        />

        {/* 예약 목록 */}
        {isLoading ? (
          <ListSkeleton count={3} variant="card" />
        ) : filteredReservations.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="예약이 없습니다"
            description="아직 들어온 예약이 없습니다"
          />
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => {
              const isManual = reservation.source === 'manual';
              const displayName = isManual
                ? reservation.manualCustomerName || '고객'
                : reservation.user?.fullName || '알 수 없음';
              const displayContact = isManual
                ? reservation.manualCustomerPhone
                : reservation.user?.phone || reservation.user?.email;

              return (
                <div key={reservation.id} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                  {/* 상태 + 날짜 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${RESERVATION_STATUS_COLORS[reservation.status]}`}>
                        {RESERVATION_STATUS_LABELS[reservation.status]}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        isManual ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                      } flex items-center gap-0.5`}>
                        {isManual && <Phone className="w-3 h-3" />}
                        {RESERVATION_SOURCE_LABELS[reservation.source]}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(reservation.createdAt)}</span>
                  </div>

                  {/* 고객 정보 */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      isManual ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {isManual ? <Phone className="w-4 h-4" /> : displayName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{displayName}</h3>
                      {displayContact && <p className="text-xs text-gray-500">{displayContact}</p>}
                    </div>
                  </div>

                  {/* 예약 상세 */}
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">상담일시</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {formatDate(reservation.date + 'T00:00:00')} {reservation.timeSlot}
                        {reservation.duration > 1 && (
                          <span className="text-xs text-indigo-500 ml-1">({getDurationLabel(reservation.duration)})</span>
                        )}
                      </span>
                    </div>
                    {reservation.partySize > 1 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">인원</span>
                        </div>
                        <span className="font-medium text-gray-900">{reservation.partySize}명</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">상담유형</span>
                      </div>
                      <span className="font-medium text-gray-900">{reservation.consultationType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">상담료</span>
                      </div>
                      <span className="font-bold text-gray-900">{reservation.totalPrice.toLocaleString()}원</span>
                    </div>
                  </div>

                  {/* 고객 메모 */}
                  {reservation.notes && (
                    <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-800">
                      <span className="font-medium">고객 요청사항: </span>
                      {reservation.notes}
                    </div>
                  )}

                  {/* 대기 중 액션 */}
                  {reservation.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleApprove(reservation.id)}
                        className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleReject(reservation.id)}
                        className="flex-1 py-2.5 text-sm font-semibold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        거절
                      </button>
                    </div>
                  )}

                  {/* 완료 처리 */}
                  {reservation.status === 'confirmed' && (
                    <button
                      onClick={() => handleComplete(reservation.id)}
                      className="w-full py-2.5 text-sm font-semibold text-green-700 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                    >
                      상담 완료 처리
                    </button>
                  )}

                  {/* 거절 사유 */}
                  {reservation.status === 'rejected' && reservation.rejectionReason && (
                    <div className="bg-red-50 rounded-xl p-3 text-sm text-red-600">
                      <span className="font-medium">거절 사유: </span>
                      {reservation.rejectionReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 수동 예약 모달 */}
        {modalOpen && (
          <ManualReservationModal
            onClose={() => setModalOpen(false)}
            onSubmit={handleManualSubmit}
          />
        )}
      </div>
    </div>
  );
}
