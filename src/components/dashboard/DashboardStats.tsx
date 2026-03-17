'use client';

import { Calendar, Clock, Users, TrendingUp } from 'lucide-react';
import { DashboardSummary } from '@/types/reservation.types';

interface DashboardStatsProps {
  summary: DashboardSummary;
  loading?: boolean;
}

export default function DashboardStats({ summary, loading }: DashboardStatsProps) {
  const cards = [
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

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
            <div className="h-4 w-16 bg-gray-100 rounded mb-3" />
            <div className="h-7 w-10 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 mb-5">
      {cards.map((card) => (
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
  );
}
