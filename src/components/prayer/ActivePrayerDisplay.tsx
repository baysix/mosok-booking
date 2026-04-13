'use client';

import { LanternVisual } from './LanternVisual';
import { CandleVisual } from './CandleVisual';
import { PrayerOrder, getRemainingDays, getProgressPercent } from '@/types/prayer.types';

function isBeforeStart(startDate: string): boolean {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime() < start.getTime();
}

function getElapsedDays(startDate: string): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function formatStartDate(startDate: string): string {
  return startDate.replace(/-/g, '.');
}

function getThematicText(category: string, startDate: string, remaining: number): string {
  if (isBeforeStart(startDate)) {
    return `시작일 ${formatStartDate(startDate)}`;
  }

  const elapsed = getElapsedDays(startDate);
  const isLastDay = remaining === 1;
  const isComplete = remaining <= 0;

  if (category === '등') {
    if (isComplete) return '등불이 다하였습니다';
    if (isLastDay) return '등이 밝히는 마지막 날';
    return `등이 밝히는 ${elapsed}일째`;
  }
  if (category === '초') {
    if (isComplete) return '촛불이 다하였습니다';
    if (isLastDay) return '초가 타오르는 마지막 날';
    return `초가 타오르는 ${elapsed}일째`;
  }
  return `기원 ${elapsed}일째`;
}

export function ActivePrayerDisplay({ order }: { order: PrayerOrder }) {
  const remaining = getRemainingDays(order.endDate);
  const progress = getProgressPercent(order.startDate, order.endDate);
  const thematicText = getThematicText(order.category, order.startDate, remaining);
  const isLantern = order.category === '등';

  return (
    <div className="rounded-3xl bg-gradient-to-b from-amber-950/80 to-gray-900/90 p-5 overflow-hidden relative">
      {/* Background ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 left-6 w-1 h-1 rounded-full bg-amber-400/30 animate-pulse" />
        <div className="absolute top-16 right-10 w-0.5 h-0.5 rounded-full bg-amber-300/20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-24 left-16 w-0.5 h-0.5 rounded-full bg-amber-300/20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Visual */}
      <div className="flex justify-center mb-3">
        {isLantern ? (
          <LanternVisual className="h-28 w-auto" />
        ) : (
          <CandleVisual className="h-28 w-auto" />
        )}
      </div>

      {/* Thematic text */}
      <p className="text-center text-amber-200/90 text-sm font-medium tracking-wide mb-1">
        {thematicText}
      </p>

      {/* Product info */}
      <p className="text-center text-white font-bold text-base mb-0.5">
        {order.productName}
      </p>

      {order.beneficiaryName && (
        <p className="text-center text-amber-300/50 text-xs">
          수혜자: {order.beneficiaryName}
        </p>
      )}

      {order.wishText && (
        <p className="text-center text-gray-400/60 text-xs italic mt-0.5 truncate px-4">
          &quot;{order.wishText}&quot;
        </p>
      )}

      {/* Progress */}
      <div className="mt-4">
        <div className="flex justify-between text-[10px] mb-1.5">
          <span className="text-amber-300/60">진행률 {progress}%</span>
          <span className="text-amber-300/60">
            {remaining > 0 ? `${remaining}일 남음` : '만료'}
          </span>
        </div>
        <div className="h-1.5 bg-amber-900/30 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
