/**
 * 마스터 예약 캘린더 페이지
 *
 * 월별 캘린더 뷰 + 일별 예약 현황 + 수동 예약 등록.
 * React Query(useCalendarData, useDayReservations, useMyMasterProfile,
 * useUpdateReservationStatus, useCreateManualReservation) + useMasterAuth 적용.
 */
'use client';

import { useState } from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import {
  useCalendarData,
  useDayReservations,
  useUpdateReservationStatus,
  useCreateManualReservation,
  useMyMasterProfile,
} from '@/hooks/queries';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { getTodayStr } from '@/lib/utils/format';
import {
  ReservationWithUser,
  ReservationStatus,
  CreateManualReservationData,
  TimeSlot,
  ALL_TIME_SLOTS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
  getOccupiedSlots,
  getDurationLabel,
} from '@/types/reservation.types';
import { Specialty } from '@/types/master.types';
import { DAY_LABELS } from '@/types/schedule.types';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Phone,
  Check,
  X,
  CheckCircle,
} from 'lucide-react';
import { ManualReservationModal } from './_components/ManualReservationModal';

/** 마스터 전문분야 없을 때 기본 상담 유형 */
const DEFAULT_CONSULTATION_TYPES: Specialty[] = ['굿', '점술', '사주', '타로', '궁합', '작명', '풍수', '해몽'];

export default function MasterCalendarPage() {
  const { isReady } = useMasterAuth();

  const todayStr = getTodayStr();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);

  /** React Query: 월별 캘린더 데이터 */
  const { data: calendarResult, isLoading: calendarLoading } = useCalendarData(year, month, isReady);
  const dayData = calendarResult?.days ?? [];

  /** React Query: 선택된 날짜의 예약 + 슬롯 */
  const { data: dayResult, isLoading: dayLoading } = useDayReservations(
    selectedDate ?? '',
    isReady && !!selectedDate,
  );
  const dayReservations = dayResult?.reservations ?? [];
  const availableSlots = dayResult?.availableSlots ?? [];

  /** React Query: 마스터 프로필 (상담 유형 추출용) */
  const { data: masterProfile } = useMyMasterProfile(isReady);
  const masterSpecialties = masterProfile?.specialties ?? [];

  /** Mutations */
  const statusMutation = useUpdateReservationStatus();
  const manualMutation = useCreateManualReservation();

  /** 수동 예약 모달 상태 */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTimeSlot, setModalTimeSlot] = useState<TimeSlot>('09:00');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!isReady) return null;

  // ── 캘린더 렌더링 데이터 ──
  const dataMap = new Map(dayData.map((d) => [d.date, d]));
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const handleMonthChange = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setSelectedDate(null);
  };

  const prevMonth = () => {
    if (month === 1) handleMonthChange(year - 1, 12);
    else handleMonthChange(year, month - 1);
  };

  const nextMonth = () => {
    if (month === 12) handleMonthChange(year + 1, 1);
    else handleMonthChange(year, month + 1);
  };

  /** 예약 상태 변경 */
  const handleStatusChange = async (reservationId: string, status: ReservationStatus) => {
    setUpdatingId(reservationId);
    try {
      await statusMutation.mutateAsync({ id: reservationId, status });
    } catch {
      // silent — React Query가 캐시를 자동 무효화
    } finally {
      setUpdatingId(null);
    }
  };

  /** 수동 예약 등록 */
  const handleManualSubmit = async (data: CreateManualReservationData) => {
    await manualMutation.mutateAsync(data);
  };

  // ── 캘린더 셀 생성 ──
  const calendarCells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`e-${i}`} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const data = dataMap.get(dateStr);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const isOffDay = data?.isOffDay;
    const total = data?.totalCount || 0;

    calendarCells.push(
      <button
        key={day}
        onClick={() => setSelectedDate(dateStr)}
        className={`
          relative flex flex-col items-center justify-center rounded-xl min-h-[52px] transition-all active:scale-95
          ${isSelected ? 'bg-indigo-500 text-white shadow-md' : ''}
          ${!isSelected && isToday ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}
          ${!isSelected && isOffDay ? 'bg-red-50' : ''}
          ${!isSelected && !isOffDay ? 'hover:bg-gray-50' : ''}
        `}
      >
        <span className={`text-sm font-medium ${isSelected ? 'text-white' : isOffDay ? 'text-red-400' : ''}`}>
          {day}
        </span>
        {total > 0 && (
          <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
            {total}건
          </span>
        )}
        {total > 0 && !isSelected && (
          <div className="flex gap-0.5 mt-0.5">
            {data!.pendingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            {data!.confirmedCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
            {data!.completedCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
          </div>
        )}
        {isOffDay && total === 0 && !isSelected && (
          <span className="text-[9px] text-red-300 mt-0.5">휴무</span>
        )}
      </button>
    );
  }

  // ── 일별 예약 슬롯 맵 ──
  const availMap = new Map(availableSlots.map((s) => [s.time, s.available]));
  const slotOwner = new Map<string, ReservationWithUser>();
  const slotRole = new Map<string, 'start' | 'continuation'>();
  for (const reservation of dayReservations) {
    const dur = reservation.duration || 1;
    const occupied = getOccupiedSlots(reservation.timeSlot, dur);
    occupied.forEach((s, i) => {
      slotOwner.set(s, reservation);
      slotRole.set(s, i === 0 ? 'start' : 'continuation');
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">예약 캘린더</h1>
        <p className="text-sm text-gray-500 mb-5">날짜별 예약 현황을 확인하고 관리하세요</p>

        {/* 캘린더 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-base font-bold text-gray-900">
              {year}년 {month}월
            </span>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={`text-center text-xs font-semibold py-1.5 ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {calendarLoading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => (
                <div key={i} className="min-h-[52px] rounded-xl bg-gray-50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">{calendarCells}</div>
          )}

          {/* 범례 */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[10px] text-gray-400">대기</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-[10px] text-gray-400">확정</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[10px] text-gray-400">완료</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-200" />
              <span className="text-[10px] text-gray-400">휴무</span>
            </div>
          </div>
        </div>

        {/* 일별 예약 현황 */}
        {selectedDate && (
          dayLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <ListSkeleton count={3} variant="row" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                {(() => {
                  const [, m, d] = selectedDate.split('-');
                  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][new Date(selectedDate).getDay()];
                  return `${Number(m)}월 ${Number(d)}일 (${dayOfWeek}) 예약 현황`;
                })()}
              </h3>

              <div className="space-y-2">
                {ALL_TIME_SLOTS.map((slot) => {
                  const reservation = slotOwner.get(slot);
                  const role = slotRole.get(slot);
                  const isAvailable = availMap.get(slot) ?? false;

                  /* 연속 슬롯 (continuation) */
                  if (reservation && role === 'continuation') {
                    return (
                      <div
                        key={slot}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-50/40 border-l-4 border-indigo-200"
                      >
                        <span className="text-sm font-medium text-indigo-300 w-12">{slot}</span>
                        <span className="text-xs text-indigo-400">
                          &#8593; {reservation.manualCustomerName || reservation.user?.fullName || '고객'} 계속
                        </span>
                      </div>
                    );
                  }

                  /* 예약 시작 슬롯 */
                  if (reservation && role === 'start') {
                    const isManual = reservation.source === 'manual';
                    const customerName = isManual
                      ? reservation.manualCustomerName || '고객'
                      : reservation.user?.fullName || '고객';
                    const customerPhone = isManual
                      ? reservation.manualCustomerPhone
                      : reservation.user?.phone;
                    const dur = reservation.duration || 1;
                    const isMultiSlot = dur > 1;

                    return (
                      <div key={slot} className={`border rounded-xl p-3 ${isMultiSlot ? 'border-indigo-200 bg-indigo-50/20' : 'border-gray-100'}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-12 pt-0.5 flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-900">{slot}</span>
                            {isMultiSlot && (
                              <div className="flex items-center gap-0.5 mt-0.5">
                                <Clock className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] text-indigo-500 font-medium">{getDurationLabel(dur)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 truncate">{customerName}</span>
                              {isManual && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-medium">
                                  <Phone className="w-2.5 h-2.5" />
                                  전화
                                </span>
                              )}
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${RESERVATION_STATUS_COLORS[reservation.status]}`}>
                                {RESERVATION_STATUS_LABELS[reservation.status]}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{reservation.consultationType}</span>
                              {reservation.partySize > 1 && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <span>{reservation.partySize}명</span>
                                </>
                              )}
                              {customerPhone && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <span>{customerPhone}</span>
                                </>
                              )}
                              {reservation.totalPrice > 0 && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <span>₩{reservation.totalPrice.toLocaleString()}</span>
                                </>
                              )}
                            </div>
                            {reservation.notes && (
                              <p className="text-xs text-gray-400 mt-1 truncate">{reservation.notes}</p>
                            )}
                          </div>
                        </div>

                        {/* 상태 변경 버튼 */}
                        {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                          <div className="flex gap-2 mt-2 ml-[60px]">
                            {reservation.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                                  disabled={updatingId === reservation.id}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                                >
                                  <Check className="w-3 h-3" />
                                  승인
                                </button>
                                <button
                                  onClick={() => handleStatusChange(reservation.id, 'rejected')}
                                  disabled={updatingId === reservation.id}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                  <X className="w-3 h-3" />
                                  거절
                                </button>
                              </>
                            )}
                            {reservation.status === 'confirmed' && (
                              <button
                                onClick={() => handleStatusChange(reservation.id, 'completed')}
                                disabled={updatingId === reservation.id}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-3 h-3" />
                                상담 완료
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  /* 빈 슬롯 — 수동 예약 추가 버튼 */
                  return (
                    <button
                      key={slot}
                      onClick={() => { setModalTimeSlot(slot); setModalOpen(true); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 border-dashed transition-colors group ${
                        isAvailable
                          ? 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                          : 'border-gray-100 bg-gray-50/50 hover:border-indigo-200 hover:bg-indigo-50/20'
                      }`}
                    >
                      <span className={`text-sm font-medium w-12 ${isAvailable ? 'text-gray-400' : 'text-gray-300'}`}>{slot}</span>
                      <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-indigo-500 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">수동 예약 추가</span>
                      </div>
                      {!isAvailable && (
                        <span className="ml-auto text-[10px] text-gray-300">근무시간 외</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {dayReservations.length === 0 && (
                <p className="text-center text-sm text-gray-400 mt-3">예약이 없습니다</p>
              )}
            </div>
          )
        )}

        {/* 수동 예약 등록 모달 */}
        {selectedDate && modalOpen && (
          <ManualReservationModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            date={selectedDate}
            timeSlot={modalTimeSlot}
            consultationTypes={masterSpecialties.length > 0 ? masterSpecialties : DEFAULT_CONSULTATION_TYPES}
            existingReservations={dayReservations}
            onSubmit={handleManualSubmit}
          />
        )}
      </div>
    </div>
  );
}
