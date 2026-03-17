'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Specialty } from '@/types/master.types';
import { MasterProfile } from '@/types/master.types';
import {
  ALL_TIME_SLOTS,
  PARTY_SIZE_OPTIONS,
  TimeSlot,
  CreateReservationData,
} from '@/types/reservation.types';
import { getAvailableSlots, createReservation } from '@/services/reservation.service';
import CalendarPicker from '@/components/booking/CalendarPicker';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const SPECIALTIES: Specialty[] = ['굿', '점술', '사주', '타로', '궁합', '작명', '풍수', '해몽'];

export default function ReservePage() {
  const { user, masterId, isLoading: authLoading, isAuthenticated, hasMembership } = useAuth();
  const router = useRouter();

  const [masterInfo, setMasterInfo] = useState<MasterProfile | null>(null);
  const [masterLoading, setMasterLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [partySize, setPartySize] = useState(1);
  const [consultationType, setConsultationType] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  // Fetch master info
  useEffect(() => {
    if (!masterId) return;

    async function fetchMaster() {
      try {
        setMasterLoading(true);
        const response = await fetch(`/api/masters/me`);
        if (response.ok) {
          const data = await response.json();
          setMasterInfo(data.master);
        }
      } catch (err) {
        console.error('Failed to fetch master info:', err);
      } finally {
        setMasterLoading(false);
      }
    }

    fetchMaster();
  }, [masterId]);

  // Fetch available slots when date changes
  const fetchSlots = useCallback(async (date: string) => {
    if (!masterId) return;
    try {
      setSlotsLoading(true);
      setSelectedTime(null);
      const result = await getAvailableSlots(masterId, date);
      setSlots(result);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [masterId]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, fetchSlots]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedDate) {
      setError('날짜를 선택해주세요');
      return;
    }
    if (!selectedTime) {
      setError('시간을 선택해주세요');
      return;
    }
    if (!consultationType) {
      setError('상담 유형을 선택해주세요');
      return;
    }

    try {
      setSubmitting(true);
      const data: CreateReservationData = {
        date: selectedDate,
        timeSlot: selectedTime,
        partySize,
        consultationType,
        notes: notes.trim() || undefined,
      };

      await createReservation(data);
      setSuccess(true);
      setTimeout(() => {
        router.push(ROUTES.USER_RESERVATIONS);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '예약에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (authLoading || (!isAuthenticated && !hasMembership)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">예약이 접수되었습니다</h2>
            <p className="text-sm text-gray-500">
              예약 확정 후 알려드리겠습니다.
              <br />
              예약 내역 페이지로 이동합니다...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.available);
  const basePrice = masterInfo?.basePrice ?? 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">예약하기</h1>
          {masterInfo && (
            <p className="text-sm text-gray-500">
              {masterInfo.businessName}에 예약합니다
            </p>
          )}
          {masterLoading && (
            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mt-1" />
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Date Selection */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-gray-900">날짜 선택</h2>
            </div>
            <CalendarPicker
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
            />
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-gray-900">시간 선택</h2>
              </div>

              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  선택하신 날짜에 예약 가능한 시간이 없습니다
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => { setSelectedTime(slot.time as TimeSlot); setPartySize(1); }}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedTime === slot.time
                          ? 'bg-primary text-white'
                          : slot.available
                            ? 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-primary hover:text-primary'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Consultation Type */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-gray-900">상담 유형</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => setConsultationType(specialty)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                    consultationType === specialty
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          {/* Party Size - 시간 선택 후에만 표시 */}
          {selectedTime && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-gray-900">인원 수</h2>
              </div>
              <p className="text-xs text-gray-500 mb-4 ml-7">1명당 1시간씩 소요됩니다</p>
              <div className="grid grid-cols-4 gap-2">
                {PARTY_SIZE_OPTIONS.map((option) => {
                  const startIdx = ALL_TIME_SLOTS.indexOf(selectedTime);
                  let maxConsecutive = 0;
                  for (let i = startIdx; i < ALL_TIME_SLOTS.length; i++) {
                    const s = slots.find((sl) => sl.time === ALL_TIME_SLOTS[i]);
                    if (s && s.available) maxConsecutive++;
                    else break;
                  }
                  const disabled = option.value > maxConsecutive;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && setPartySize(option.value)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                        partySize === option.value
                          ? 'bg-primary text-white'
                          : disabled
                            ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {partySize > 1 && (
                <p className="text-xs text-indigo-500 mt-3 ml-7">
                  {partySize}명 = {partySize}시간 소요 ({selectedTime} ~ {ALL_TIME_SLOTS[ALL_TIME_SLOTS.indexOf(selectedTime) + partySize - 1] || '종료'})
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">요청 사항</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="추가 요청사항이 있으시면 작성해주세요 (선택)"
              rows={3}
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Price Summary */}
          {basePrice > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">요금 안내</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">기본 상담 요금</span>
                  <span className="text-gray-900 font-medium">{basePrice.toLocaleString()}원</span>
                </div>
                {partySize > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">인원</span>
                    <span className="text-gray-900 font-medium">{partySize}명</span>
                  </div>
                )}
                <div className="h-px bg-gray-100 my-2" />
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-gray-900">예상 금액</span>
                  <span className="text-lg font-bold text-primary">
                    {(basePrice * partySize).toLocaleString()}원
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                * 최종 금액은 상담 내용에 따라 변동될 수 있습니다
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !selectedDate || !selectedTime || !consultationType}
            className="w-full py-4 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                예약 접수 중...
              </>
            ) : (
              '예약하기'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
