/**
 * 마스터 대시보드 페이지
 *
 * 예약 현황 요약(통계 카드), 캘린더 바로가기, 오늘 예약 목록을 표시.
 * React Query로 캘린더/일별 데이터를 병렬 조회.
 */
'use client';

import Link from 'next/link';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useCalendarData, useDayReservations } from '@/hooks/queries';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { getTodayStr } from '@/lib/utils/format';
import {
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
} from '@/types/reservation.types';
import { ROUTES } from '@/constants/routes';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  ChevronRight,
  Phone,
} from 'lucide-react';

export default function MasterDashboardPage() {
  const { isReady } = useMasterAuth();

  const now = new Date();
  const todayStr = getTodayStr();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // 캘린더 요약 + 오늘 예약 병렬 조회
  const { data: calData, isLoading: calLoading } = useCalendarData(year, month, isReady);
  const { data: dayData, isLoading: dayLoading } = useDayReservations(todayStr, isReady);

  if (!isReady) return null;

  const loading = calLoading || dayLoading;
  const summary = calData?.summary ?? {
    todayReservations: 0,
    pendingTotal: 0,
    thisWeekReservations: 0,
    thisMonthRevenue: 0,
  };
  const todayReservations = dayData?.reservations ?? [];

  const statCards = [
    { label: '오늘 예약', value: summary.todayReservations, icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: '대기 중', value: summary.pendingTotal, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: '이번 주', value: summary.thisWeekReservations, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '이번 달 수익', value: `₩${summary.thisMonthRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  const todayDayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">대시보드</h1>
        <p className="text-sm text-gray-500 mb-5">예약 현황을 한눈에 확인하세요</p>

        {/* 통계 카드 */}
        {loading ? (
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

        {/* 캘린더 바로가기 */}
        <Link
          href={ROUTES.MASTER_CALENDAR}
          className="flex items-center justify-between bg-indigo-50 rounded-2xl px-4 py-3.5 mb-5 group hover:bg-indigo-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-900">예약 캘린더</p>
              <p className="text-xs text-indigo-500">날짜별 예약 확인 및 수동 등록</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* 오늘 예약 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">
              오늘 예약 ({now.getMonth() + 1}/{now.getDate()} {todayDayOfWeek})
            </h3>
            <span className="text-xs text-gray-400">{todayReservations.length}건</span>
          </div>

          {loading ? (
            <ListSkeleton count={3} variant="simple" />
          ) : todayReservations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">오늘 예약이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayReservations.map((r) => {
                const isManual = r.source === 'manual';
                const name = isManual ? r.manualCustomerName || '고객' : r.user?.fullName || '고객';
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-indigo-600 w-12 flex-shrink-0">{r.timeSlot}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">{name}</span>
                        {isManual && (
                          <Phone className="w-3 h-3 text-orange-400 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{r.consultationType}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${RESERVATION_STATUS_COLORS[r.status]}`}>
                      {RESERVATION_STATUS_LABELS[r.status]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
