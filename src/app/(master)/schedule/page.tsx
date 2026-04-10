'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { WeeklyHour, OffDay, DAY_LABELS } from '@/types/schedule.types';
import { ALL_TIME_SLOTS, TimeSlot } from '@/types/reservation.types';
import {
  getMySchedule,
  saveWeeklyHours,
  addOffDay,
  deleteOffDay,
} from '@/services/schedule.service';
import {
  Clock,
  CalendarOff,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';

const DEFAULT_WEEKLY: WeeklyHour[] = Array.from({ length: 7 }, (_, i) => ({
  dayOfWeek: i,
  isWorking: i >= 1 && i <= 5,
  timeSlots: i >= 1 && i <= 5 ? [...ALL_TIME_SLOTS] : [],
}));

function formatSlotLabel(slot: string) {
  const hour = parseInt(slot.split(':')[0], 10);
  return `${hour >= 12 ? '오후' : '오전'} ${hour > 12 ? hour - 12 : hour}시`;
}

type TabType = 'weekly' | 'offdays';

export default function MasterSchedulePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHour[]>(DEFAULT_WEEKLY);
  const [offDays, setOffDays] = useState<OffDay[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('weekly');

  // Accordion
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // Calendar state
  const today = new Date();
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());

  // Off-day modal
  const [offDayModal, setOffDayModal] = useState<{ date: string } | null>(null);
  const [offDayReason, setOffDayReason] = useState('');
  const [addingOffDay, setAddingOffDay] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'master')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchSchedule = useCallback(async () => {
    try {
      const data = await getMySchedule();
      if (data.weeklyHours.length > 0) {
        setWeeklyHours(data.weeklyHours);
      }
      setOffDays(data.offDays);
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'master') {
      fetchSchedule();
    }
  }, [user, fetchSchedule]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const toggleDayWorking = (dayOfWeek: number) => {
    setWeeklyHours((prev) =>
      prev.map((wh) =>
        wh.dayOfWeek === dayOfWeek
          ? {
              ...wh,
              isWorking: !wh.isWorking,
              timeSlots: !wh.isWorking ? [...ALL_TIME_SLOTS] : [],
            }
          : wh
      )
    );
    setHasChanges(true);
  };

  const toggleTimeSlot = (dayOfWeek: number, slot: TimeSlot) => {
    setWeeklyHours((prev) =>
      prev.map((wh) => {
        if (wh.dayOfWeek !== dayOfWeek) return wh;
        const has = wh.timeSlots.includes(slot);
        const newSlots = has
          ? wh.timeSlots.filter((s) => s !== slot)
          : [...wh.timeSlots, slot].sort();
        return { ...wh, timeSlots: newSlots as TimeSlot[] };
      })
    );
    setHasChanges(true);
  };

  const handleSaveWeekly = async () => {
    setSaving(true);
    try {
      const saved = await saveWeeklyHours(weeklyHours);
      setWeeklyHours(saved);
      setHasChanges(false);
      setMessage({ type: 'success', text: '주간 일정이 저장되었습니다' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '저장에 실패했습니다' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddOffDay = async () => {
    if (!offDayModal) return;
    setAddingOffDay(true);
    try {
      const newOffDay = await addOffDay(offDayModal.date, offDayReason || undefined);
      setOffDays((prev) => [...prev, newOffDay].sort((a, b) => a.offDate.localeCompare(b.offDate)));
      setOffDayModal(null);
      setOffDayReason('');
      setMessage({ type: 'success', text: '휴무일이 등록되었습니다' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '등록에 실패했습니다' });
    } finally {
      setAddingOffDay(false);
    }
  };

  const handleDeleteOffDay = async (id: string) => {
    try {
      await deleteOffDay(id);
      setOffDays((prev) => prev.filter((d) => d.id !== id));
      setMessage({ type: 'success', text: '휴무일이 삭제되었습니다' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '삭제에 실패했습니다' });
    }
  };

  // Calendar helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (year: number, month: number) => new Date(year, month, 1).getDay();

  const offDayDates = new Set(offDays.map((d) => d.offDate));
  const isDateOff = (dateStr: string) => offDayDates.has(dateStr);

  const isPastDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const handleCalendarClick = (dateStr: string) => {
    if (isPastDate(dateStr)) return;
    if (isDateOff(dateStr)) {
      const offDay = offDays.find((d) => d.offDate === dateStr);
      if (offDay) handleDeleteOffDay(offDay.id);
    } else {
      setOffDayModal({ date: dateStr });
      setOffDayReason('');
    }
  };

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarYear((y) => y - 1);
      setCalendarMonth(11);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarYear((y) => y + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfWeek(calendarYear, calendarMonth);
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isOff = isDateOff(dateStr);
      const isPast = isPastDate(dateStr);
      const isToday =
        today.getFullYear() === calendarYear &&
        today.getMonth() === calendarMonth &&
        today.getDate() === day;

      cells.push(
        <button
          key={day}
          onClick={() => handleCalendarClick(dateStr)}
          disabled={isPast}
          className={`
            aspect-square rounded-xl text-sm font-medium transition-all flex items-center justify-center
            min-h-[44px]
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
            ${!isPast && !isOff ? 'hover:bg-gray-50' : ''}
            ${isOff ? 'bg-red-100 text-red-600 hover:bg-red-200' : ''}
            ${isToday && !isOff ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return cells;
  };

  if (isLoading || !user) return null;

  const orderedDays = [1, 2, 3, 4, 5, 6, 0];
  const futureOffDays = offDays.filter((d) => !isPastDate(d.offDate));

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">영업시간 설정</h1>
        <p className="text-sm text-gray-500 mb-5">상담 가능 시간과 휴무일을 설정하세요</p>

        {/* Message toast */}
        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'weekly'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <Clock className="w-4 h-4" />
            주간 스케줄
          </button>
          <button
            onClick={() => setActiveTab('offdays')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'offdays'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <CalendarOff className="w-4 h-4" />
            휴무일
            {futureOffDays.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {futureOffDays.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
              >
                <div className="h-5 w-24 bg-gray-100 rounded mb-3" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-10 w-16 bg-gray-50 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ========== Weekly Schedule Tab ========== */}
            {activeTab === 'weekly' && (
              <div>
                <div className="space-y-2">
                  {orderedDays.map((dayIdx) => {
                    const wh = weeklyHours.find((w) => w.dayOfWeek === dayIdx) || {
                      dayOfWeek: dayIdx,
                      isWorking: false,
                      timeSlots: [],
                    };
                    const isWeekend = dayIdx === 0 || dayIdx === 6;
                    const isExpanded = expandedDay === dayIdx;

                    return (
                      <div
                        key={dayIdx}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedDay(isExpanded ? null : dayIdx)}
                          className="w-full flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                isWeekend
                                  ? wh.isWorking
                                    ? 'bg-red-100 text-red-500'
                                    : 'bg-red-50 text-red-300'
                                  : wh.isWorking
                                    ? 'bg-indigo-100 text-indigo-600'
                                    : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {DAY_LABELS[dayIdx]}
                            </span>
                            <div className="text-left">
                              <span className="text-sm font-semibold text-gray-900">
                                {DAY_LABELS[dayIdx]}요일
                              </span>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {wh.isWorking
                                  ? `${wh.timeSlots.length}개 시간대 근무`
                                  : '휴무'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                wh.isWorking
                                  ? 'bg-green-50 text-green-600'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {wh.isWorking ? '근무' : '휴무'}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-400 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-gray-50">
                            <div className="flex items-center justify-between py-3">
                              <span className="text-sm text-gray-700">근무 여부</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDayWorking(dayIdx);
                                }}
                                className={`relative w-12 h-7 rounded-full transition-colors ${
                                  wh.isWorking ? 'bg-indigo-500' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                                    wh.isWorking ? 'translate-x-5' : ''
                                  }`}
                                />
                              </button>
                            </div>

                            {wh.isWorking && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                                {ALL_TIME_SLOTS.map((slot) => {
                                  const active = wh.timeSlots.includes(slot);
                                  return (
                                    <button
                                      key={slot}
                                      onClick={() => toggleTimeSlot(dayIdx, slot)}
                                      className={`py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                                        active
                                          ? 'bg-indigo-500 text-white shadow-sm'
                                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                      }`}
                                    >
                                      {formatSlotLabel(slot)}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Sticky save button */}
                <div className="sticky bottom-4 mt-4 z-10">
                  <button
                    onClick={handleSaveWeekly}
                    disabled={!hasChanges || saving}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                      hasChanges && !saving
                        ? 'bg-indigo-500 text-white hover:bg-indigo-600 active:scale-[0.98]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? '저장 중...' : '주간 일정 저장'}
                  </button>
                </div>
              </div>
            )}

            {/* ========== Off Days Tab ========== */}
            {activeTab === 'offdays' && (
              <div>
                {/* Calendar */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={prevMonth}
                      className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="text-base font-bold text-gray-900">
                      {calendarYear}년 {calendarMonth + 1}월
                    </span>
                    <button
                      onClick={nextMonth}
                      className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {DAY_LABELS.map((label, i) => (
                      <div
                        key={label}
                        className={`text-center text-xs font-semibold py-2 ${
                          i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                        }`}
                      >
                        {label}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

                  <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200" />
                      <span className="text-xs text-gray-500">휴무일</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full ring-2 ring-indigo-500" />
                      <span className="text-xs text-gray-500">오늘</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center mb-4">
                  날짜를 터치하여 휴무일 추가 / 휴무일을 다시 터치하면 삭제
                </p>

                {/* Off-days list */}
                {futureOffDays.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-2">
                      등록된 휴무일
                    </h3>
                    <div className="space-y-2">
                      {futureOffDays.map((day) => {
                        const date = new Date(day.offDate + 'T00:00:00');
                        const dayOfWeek = DAY_LABELS[date.getDay()];
                        return (
                          <div
                            key={day.id}
                            className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-xs font-bold">
                                {dayOfWeek}
                              </span>
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {day.offDate.replace(/-/g, '.')}
                                </span>
                                {day.reason && (
                                  <p className="text-xs text-gray-400 mt-0.5">{day.reason}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteOffDay(day.id)}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {futureOffDays.length === 0 && (
                  <div className="text-center py-8">
                    <CalendarOff className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">등록된 휴무일이 없습니다</p>
                    <p className="text-xs text-gray-300 mt-1">달력에서 날짜를 선택하세요</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Off-day Modal */}
        {offDayModal && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
            onClick={() => setOffDayModal(null)}
          >
            <div
              className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 pb-8 sm:pb-5 animate-in slide-in-from-bottom duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex sm:hidden justify-center mb-3">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">휴무일 등록</h3>
                <button
                  onClick={() => setOffDayModal(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mb-4 bg-indigo-50 rounded-xl px-4 py-3">
                <p className="text-sm text-indigo-700 font-medium">
                  {offDayModal.date.replace(/-/g, '.')}
                </p>
                <p className="text-xs text-indigo-500 mt-0.5">
                  해당 날짜를 휴무일로 등록합니다
                </p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  사유 (선택)
                </label>
                <input
                  type="text"
                  value={offDayReason}
                  onChange={(e) => setOffDayReason(e.target.value)}
                  placeholder="예: 개인 사정, 휴가 등"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setOffDayModal(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                >
                  취소
                </button>
                <button
                  onClick={handleAddOffDay}
                  disabled={addingOffDay}
                  className="flex-1 py-3 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 active:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {addingOffDay ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {addingOffDay ? '등록 중...' : '등록'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
