'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getMyPrayerOrders } from '@/services/prayer.service';
import {
  PrayerOrder,
  PrayerOrderStatus,
  PRAYER_ORDER_STATUS_LABELS,
  PRAYER_ORDER_STATUS_COLORS,
  getDurationLabel,
} from '@/types/prayer.types';
import { Flame, Plus, Clock } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { ActivePrayerDisplay } from '@/components/prayer/ActivePrayerDisplay';
import { PrayerOrderCard } from '@/components/prayer/PrayerOrderCard';

export default function UserPrayerPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<PrayerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PrayerOrderStatus | ''>('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyPrayerOrders(statusFilter || undefined);
      setOrders(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (authLoading || !user) return null;

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const activeOrders = orders.filter((o) => o.status === 'active');
  const otherOrders = orders.filter((o) => o.status !== 'active' && o.status !== 'pending');

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">기원 서비스</h1>
        </div>
        <p className="text-sm text-gray-500 mb-5">기원 현황을 확인하세요</p>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {[
            { value: '' as const, label: '전체' },
            { value: 'pending' as const, label: '대기' },
            { value: 'active' as const, label: '진행 중' },
            { value: 'completed' as const, label: '기원 완료' },
            { value: 'cancelled' as const, label: '취소' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Flame className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-4">
              {statusFilter ? '해당 상태의 기원이 없습니다' : '아직 신청한 기원이 없습니다'}
            </p>
            <button
              onClick={() => router.push(ROUTES.USER_PRAYER_APPLY)}
              className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              기원 신청하기
            </button>
          </div>
        ) : (
          <>
            {/* Pending Orders */}
            {pendingOrders.length > 0 && statusFilter !== 'active' && statusFilter !== 'completed' && statusFilter !== 'cancelled' && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">승인 대기 중</p>
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-yellow-200 bg-yellow-50/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-700">무속인 승인 대기 중</span>
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{order.productName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {getDurationLabel(order.durationDays)}
                            {order.price > 0 && ` · ₩${order.price.toLocaleString()}`}
                          </p>
                          {order.beneficiaryName && (
                            <p className="text-xs text-gray-400 mt-0.5">수혜자: {order.beneficiaryName}</p>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${PRAYER_ORDER_STATUS_COLORS[order.status]}`}>
                          {PRAYER_ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Orders — Animated Visuals */}
            {activeOrders.length > 0 && statusFilter !== 'pending' && statusFilter !== 'completed' && statusFilter !== 'cancelled' && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">진행 중인 기원</p>
                {activeOrders.length <= 2 ? (
                  <div className="space-y-4">
                    {activeOrders.map((order) => (
                      <ActivePrayerDisplay key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
                    {activeOrders.map((order) => (
                      <div key={order.id} className="min-w-[280px] snap-center flex-shrink-0">
                        <ActivePrayerDisplay order={order} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other Orders — Card List */}
            {otherOrders.length > 0 && statusFilter !== 'pending' && statusFilter !== 'active' && (
              <div>
                {(activeOrders.length > 0 || pendingOrders.length > 0) && !statusFilter && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">이전 기원</p>
                )}
                <div className="space-y-3">
                  {otherOrders.map((order) => (
                    <PrayerOrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* FAB */}
        {orders.length > 0 && (
          <button
            onClick={() => router.push(ROUTES.USER_PRAYER_APPLY)}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center z-50"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
