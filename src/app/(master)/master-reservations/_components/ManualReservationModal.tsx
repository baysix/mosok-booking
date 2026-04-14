'use client';

import { useState } from 'react';
import { BaseModal } from '@/components/common/BaseModal';
import {
  CreateManualReservationData,
  TimeSlot,
  ALL_TIME_SLOTS,
  DURATION_OPTIONS,
} from '@/types/reservation.types';
import { Specialty } from '@/types/master.types';
import { Phone, Loader2 } from 'lucide-react';

const CONSULTATION_TYPES: Specialty[] = ['굿', '점술', '사주', '타로', '궁합', '작명', '풍수', '해몽'];

interface ManualReservationModalProps {
  onClose: () => void;
  onSubmit: (data: CreateManualReservationData) => Promise<void>;
}

export function ManualReservationModal({ onClose, onSubmit }: ManualReservationModalProps) {
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
