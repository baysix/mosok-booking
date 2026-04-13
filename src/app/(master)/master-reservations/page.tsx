/**
 * 마스터 예약 관리 페이지
 *
 * 고객 예약 목록 조회, 상태 필터, 승인/거절/완료 처리.
 * React Query + StatusTabs + ListSkeleton + EmptyState 적용.
 */
'use client';

import { useState, useEffect } from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterReservations, useUpdateReservationStatus, useCreateManualReservation } from '@/hooks/queries';
import { StatusTabs } from '@/components/common/StatusTabs';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { BaseModal } from '@/components/common/BaseModal';
import { formatDate } from '@/lib/utils/format';
import {
  ReservationStatus,
  CreateManualReservationData,
  TimeSlot,
  ALL_TIME_SLOTS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
  RESERVATION_SOURCE_LABELS,
  DURATION_OPTIONS,
  getDurationLabel,
} from '@/types/reservation.types';
import { Specialty } from '@/types/master.types';
import {
  Calendar,
  Phone,
  X,
  Loader2,
  Tag,
  CreditCard,
  Users,
} from 'lucide-react';

const CONSULTATION_TYPES: Specialty[] = ['굿', '점술', '사주', '타로', '궁합', '작명', '풍수', '해몽'];

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

// ============ 수동 예약 등록 모달 ============

interface ManualReservationModalProps {
  onClose: () => void;
  onSubmit: (data: CreateManualReservationData) => Promise<void>;
}

function ManualReservationModal({ onClose, onSubmit }: ManualReservationModalProps) {
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const [date, setDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('09:00');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [consultationType, setConsultationType] = useState<Specialty>('사주');
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('고객명을 입력해주세요');
      return;
    }
    if (!date) {
      setError('날짜를 선택해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        date,
        timeSlot,
        duration,
        consultationType,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        totalPrice: totalPrice ? Number(totalPrice) : undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '예약 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="수동 예약 등록"
      icon={
        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
          <Phone className="w-4 h-4 text-orange-500" />
        </div>
      }
      footer={
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !customerName.trim()}
          className="w-full h-12 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              등록 중...
            </>
          ) : (
            '예약 등록'
          )}
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-50 text-sm text-red-600">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            날짜 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            시간 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {ALL_TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTimeSlot(slot)}
                className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                  timeSlot === slot
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            고객명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="고객 이름"
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">연락처</label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            소요 시간 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDuration(opt.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  duration === opt.value
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            상담 유형 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CONSULTATION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setConsultationType(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  consultationType === type
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">상담료</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₩</span>
            <input
              type="number"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              placeholder="0"
              className="w-full h-11 pl-8 pr-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">메모</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="예약 관련 메모"
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>
      </form>
    </BaseModal>
  );
}
