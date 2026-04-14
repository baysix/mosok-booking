'use client';

import { useState } from 'react';
import { useBodyLock } from '@/hooks/useBodyLock';
import { BaseModal } from '@/components/common/BaseModal';
import {
  ReservationWithUser,
  CreateManualReservationData,
  TimeSlot,
  ALL_TIME_SLOTS,
  getOccupiedSlots,
  DURATION_OPTIONS,
} from '@/types/reservation.types';
import { Specialty } from '@/types/master.types';
import { Phone, Loader2 } from 'lucide-react';

interface ManualReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  timeSlot: TimeSlot;
  consultationTypes: Specialty[];
  existingReservations: ReservationWithUser[];
  onSubmit: (data: CreateManualReservationData) => Promise<void>;
}

export function ManualReservationModal({
  isOpen,
  onClose,
  date,
  timeSlot,
  consultationTypes,
  existingReservations,
  onSubmit,
}: ManualReservationModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [consultationType, setConsultationType] = useState<Specialty>(consultationTypes[0] || '사주');
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useBodyLock(isOpen);

  if (!isOpen) return null;

  const formattedDate = (() => {
    const [, m, d] = date.split('-');
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][new Date(date).getDay()];
    return `${Number(m)}월 ${Number(d)}일 (${dayOfWeek})`;
  })();

  // 기존 활성 예약의 점유 슬롯 계산
  const activeReservations = existingReservations.filter(
    r => r.status !== 'cancelled' && r.status !== 'rejected'
  );
  const occupiedSlotSet = new Set<string>();
  for (const r of activeReservations) {
    const slots = getOccupiedSlots(r.timeSlot, r.duration || 1);
    slots.forEach(s => occupiedSlotSet.add(s));
  }

  const startIdx = ALL_TIME_SLOTS.indexOf(timeSlot);

  // 선택한 시간부터 연속 비어있는 슬롯 수
  let maxFreeSlots = 0;
  for (let i = startIdx; i < ALL_TIME_SLOTS.length; i++) {
    if (occupiedSlotSet.has(ALL_TIME_SLOTS[i])) break;
    maxFreeSlots++;
  }

  const maxDuration = maxFreeSlots;
  const hasAnyReservation = activeReservations.length > 0;

  const isFullDay = duration === 0;
  const displayTimeSlot = isFullDay ? '종일 (09:00~23:00)' : timeSlot;
  const startSlot = isFullDay ? ALL_TIME_SLOTS[0] : timeSlot;
  const occupiedSlots = getOccupiedSlots(startSlot, isFullDay ? ALL_TIME_SLOTS.length : duration);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('고객명을 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        date,
        timeSlot: isFullDay ? ALL_TIME_SLOTS[0] : timeSlot,
        duration,
        consultationType,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        notes: notes.trim() || undefined,
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
      isOpen={isOpen}
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
        <p className="text-xs text-gray-500">{formattedDate} {displayTimeSlot}</p>

        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-50 text-sm text-red-600">{error}</div>
        )}

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
            autoFocus
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
            {DURATION_OPTIONS.map((opt) => {
              const disabled = opt.value === 0
                ? hasAnyReservation
                : opt.value > maxDuration;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => !disabled && setDuration(opt.value)}
                  disabled={disabled}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    duration === opt.value
                      ? 'bg-indigo-500 text-white'
                      : disabled
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {occupiedSlots.length > 1 && (
            <p className="text-xs text-gray-400 mt-1.5">
              {occupiedSlots[0]} ~ {occupiedSlots[occupiedSlots.length - 1]} ({occupiedSlots.length}시간)
            </p>
          )}
          {maxDuration < ALL_TIME_SLOTS.length - startIdx && maxDuration > 0 && (
            <p className="text-xs text-amber-500 mt-1">
              다음 예약까지 최대 {maxDuration}시간 가능
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            상담 유형 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {consultationTypes.map((type) => (
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
