'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarDayData } from '@/types/reservation.types';
import { DAY_LABELS } from '@/types/schedule.types';

interface DashboardCalendarProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  dayData: CalendarDayData[];
}

export default function DashboardCalendar({
  year,
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  dayData,
}: DashboardCalendarProps) {
  const dataMap = new Map(dayData.map((d) => [d.date, d]));
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const prevMonth = () => {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  };

  const nextMonth = () => {
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  };

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`e-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const data = dataMap.get(dateStr);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const isOffDay = data?.isOffDay;
    const total = data?.totalCount || 0;

    cells.push(
      <button
        key={day}
        onClick={() => onSelectDate(dateStr)}
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

        {/* 예약 수 뱃지 */}
        {total > 0 && (
          <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
            {total}건
          </span>
        )}

        {/* 상태 점 표시 */}
        {total > 0 && !isSelected && (
          <div className="flex gap-0.5 mt-0.5">
            {data!.pendingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            {data!.confirmedCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
            {data!.completedCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
          </div>
        )}

        {/* 휴무일 표시 */}
        {isOffDay && total === 0 && !isSelected && (
          <span className="text-[9px] text-red-300 mt-0.5">휴무</span>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
      {/* Month navigation */}
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

      {/* Day headers */}
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

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">{cells}</div>

      {/* Legend */}
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
  );
}
