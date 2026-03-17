'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  getCalendarData,
  getDayReservations,
  updateReservationStatus,
  createManualReservation,
} from '@/services/reservation.service';
import {
  ReservationWithUser,
  ReservationStatus,
  CalendarDayData,
  DashboardSummary,
  CreateManualReservationData,
  TimeSlot,
  ALL_TIME_SLOTS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
  getOccupiedSlots,
  getDurationLabel,
  DURATION_OPTIONS,
} from '@/types/reservation.types';
import { Specialty } from '@/types/master.types';
import { DAY_LABELS } from '@/types/schedule.types';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Phone,
  Check,
  X,
  CheckCircle,
  Loader2,
} from 'lucide-react';

const CONSULTATION_TYPES: Specialty[] = ['굿', '점술', '사주', '타로', '궁합', '작명', '풍수', '해몽'];

export default function MasterDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Calendar state
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [dayData, setDayData] = useState<CalendarDayData[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    todayReservations: 0,
    pendingTotal: 0,
    thisWeekReservations: 0,
    thisMonthRevenue: 0,
  });

  // Day detail state
  const [dayReservations, setDayReservations] = useState<ReservationWithUser[]>([]);
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [dayLoading, setDayLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Manual reservation modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTimeSlot, setModalTimeSlot] = useState<TimeSlot>('09:00');

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'master')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Fetch calendar data
  const fetchCalendar = useCallback(async () => {
    setCalendarLoading(true);
    try {
      const data = await getCalendarData(year, month);
      setDayData(data.days);
      setSummary(data.summary);
    } catch {
      // silent
    } finally {
      setCalendarLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    if (user?.role === 'master') {
      fetchCalendar();
    }
  }, [user, fetchCalendar]);

  // Fetch day reservations
  const fetchDay = useCallback(async (date: string) => {
    setDayLoading(true);
    try {
      const data = await getDayReservations(date);
      setDayReservations(data.reservations);
      setAvailableSlots(data.availableSlots);
    } catch {
      // silent
    } finally {
      setDayLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchDay(selectedDate);
    }
  }, [selectedDate, fetchDay]);

  // Handlers
  const handleMonthChange = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setSelectedDate(null);
    setDayReservations([]);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleStatusChange = async (reservationId: string, status: ReservationStatus) => {
    setUpdatingId(reservationId);
    try {
      await updateReservationStatus(reservationId, { status });
      await Promise.all([fetchCalendar(), selectedDate ? fetchDay(selectedDate) : Promise.resolve()]);
    } catch {
      // silent
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddManual = (timeSlot: TimeSlot) => {
    setModalTimeSlot(timeSlot);
    setModalOpen(true);
  };

  const handleManualSubmit = async (data: CreateManualReservationData) => {
    await createManualReservation(data);
    await Promise.all([fetchCalendar(), selectedDate ? fetchDay(selectedDate) : Promise.resolve()]);
  };

  if (authLoading || !user) return null;

  // Stat cards
  const statCards = [
    {
      label: '오늘 예약',
      value: summary.todayReservations,
      icon: Calendar,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
    },
    {
      label: '대기 중',
      value: summary.pendingTotal,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: '이번 주',
      value: summary.thisWeekReservations,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: '이번 달 수익',
      value: `₩${summary.thisMonthRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ];

  // Calendar rendering
  const dataMap = new Map(dayData.map((d) => [d.date, d]));
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const prevMonth = () => {
    if (month === 1) handleMonthChange(year - 1, 12);
    else handleMonthChange(year, month - 1);
  };

  const nextMonth = () => {
    if (month === 12) handleMonthChange(year + 1, 1);
    else handleMonthChange(year, month + 1);
  };

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
        onClick={() => handleSelectDate(dateStr)}
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

  // Day reservation slot rendering
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">대시보드</h1>
        <p className="text-sm text-gray-500 mb-5">예약 현황을 한눈에 확인하세요</p>

        {/* Stat Cards */}
        {calendarLoading ? (
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="h-4 w-16 bg-gray-100 rounded mb-3" />
                <div className="h-7 w-10 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-5">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
                  </div>
                  <span className="text-xs text-gray-500">{card.label}</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Calendar */}
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

          <div className="grid grid-cols-7 gap-1">{calendarCells}</div>

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

        {/* Day Reservations */}
        {selectedDate && (
          dayLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
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

                  // Empty slot
                  return (
                    <button
                      key={slot}
                      onClick={() => handleAddManual(slot)}
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

        {/* Manual Reservation Modal */}
        {selectedDate && modalOpen && (
          <ManualReservationModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            date={selectedDate}
            timeSlot={modalTimeSlot}
            onSubmit={handleManualSubmit}
          />
        )}
      </div>
    </div>
  );
}

// ============ Manual Reservation Modal ============

interface ManualReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  timeSlot: TimeSlot;
  onSubmit: (data: CreateManualReservationData) => Promise<void>;
}

function ManualReservationModal({
  isOpen,
  onClose,
  date,
  timeSlot,
  onSubmit,
}: ManualReservationModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [consultationType, setConsultationType] = useState<Specialty>('사주');
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const formattedDate = (() => {
    const [, m, d] = date.split('-');
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][new Date(date).getDay()];
    return `${Number(m)}월 ${Number(d)}일 (${dayOfWeek})`;
  })();

  const isFullDay = duration === 0;
  const displayTimeSlot = isFullDay ? '종일 (09:00~23:00)' : timeSlot;
  const startSlot = isFullDay ? ALL_TIME_SLOTS[0] : timeSlot;
  const occupiedSlots = getOccupiedSlots(startSlot, isFullDay ? ALL_TIME_SLOTS.length : duration);
  const startIdx = ALL_TIME_SLOTS.indexOf(timeSlot);
  const maxFromStart = ALL_TIME_SLOTS.length - startIdx;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        totalPrice: totalPrice ? Number(totalPrice) : undefined,
      });
      setCustomerName('');
      setCustomerPhone('');
      setConsultationType('사주');
      setDuration(1);
      setNotes('');
      setTotalPrice('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '예약 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="sm:hidden flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Phone className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">수동 예약 등록</h3>
              <p className="text-xs text-gray-500">{formattedDate} {displayTimeSlot}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 pt-2 space-y-4">
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
                const disabled = opt.value !== 0 && opt.value > maxFromStart;
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

          <button
            type="submit"
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
        </form>
      </div>
    </div>
  );
}
