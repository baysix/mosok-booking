/**
 * 사용자 기원 서비스 페이지
 *
 * 내 기원 주문 목록 조회 (대기/진행 중/완료/취소 필터).
 * React Query + StatusTabs + ListSkeleton 적용.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMyPrayerOrders } from '@/hooks/queries';
import { StatusTabs } from '@/components/common/StatusTabs';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import {
  PrayerOrderStatus,
  PRAYER_ORDER_STATUS_LABELS,
  PRAYER_ORDER_STATUS_COLORS,
  getDurationLabel,
} from '@/types/prayer.types';
import { Flame, Plus, Clock } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { ActivePrayerDisplay } from '@/components/prayer/ActivePrayerDisplay';
import { PrayerOrderCard } from '@/components/prayer/PrayerOrderCard';

/** 필터 탭 옵션 */
const FILTER_TABS: { value: PrayerOrderStatus | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'pending', label: '대기' },
  { value: 'active', label: '진행 중' },
  { value: 'completed', label: '기원 완료' },
  { value: 'cancelled', label: '취소' },
];

export default function UserPrayerPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<PrayerOrderStatus | ''>('');

  // 인증 가드
  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  const isReady = !authLoading && !!user;
  const { data: orders = [], isLoading } = useMyPrayerOrders(statusFilter || undefined, isReady);

  if (!isReady) return null;

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

        {/* 상태 필터 */}
        <div className="mb-4">
          <StatusTabs
            tabs={FILTER_TABS}
            active={statusFilter}
            onChange={setStatusFilter}
            activeColor="bg-orange-500"
          />
        </div>

        {isLoading ? (
          <ListSkeleton count={2} variant="row" />
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
            {/* 대기 중 주문 */}
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

            {/* 진행 중 기원 — 애니메이션 비주얼 */}
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

            {/* 이전 기원 — 카드 리스트 */}
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
