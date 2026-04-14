'use client';

import { useState } from 'react';
import {
  useMyPrayerProducts,
  useMasterPrayerOrders,
  useUpdateMasterPrayerOrderStatus,
} from '@/hooks/queries';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import {
  PrayerOrderStatus,
  PRAYER_ORDER_STATUS_LABELS,
  PRAYER_ORDER_STATUS_COLORS,
  getRemainingDays,
  getProgressPercent,
  getDurationLabel,
} from '@/types/prayer.types';
import { Flame, Plus, Check, X } from 'lucide-react';
import { ManualPrayerModal } from './ManualPrayerModal';

export function OrdersTab() {
  const [statusFilter, setStatusFilter] = useState<PrayerOrderStatus | ''>('');
  const { data: orders = [], isLoading } = useMasterPrayerOrders(statusFilter || undefined);
  const { data: products = [] } = useMyPrayerProducts();
  const statusMutation = useUpdateMasterPrayerOrderStatus();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleStatusChange = async (id: string, status: PrayerOrderStatus) => {
    setUpdatingId(id);
    try {
      await statusMutation.mutateAsync({ id, status });
    } catch {
      // silent
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const activeCount = orders.filter((o) => o.status === 'active').length;

  return (
    <div>
      {/* 요약 + 필터 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-3">
          {pendingCount > 0 && (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-yellow-600">{pendingCount}</span>
                <span className="text-xs text-gray-400">대기</span>
              </div>
              <span className="text-gray-300">|</span>
            </>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-orange-600">{activeCount}</span>
            <span className="text-xs text-gray-400">진행 중</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          {[
            { value: '' as const, label: '전체' },
            { value: 'pending' as const, label: '대기' },
            { value: 'active' as const, label: '진행' },
            { value: 'completed' as const, label: '완료' },
            { value: 'cancelled' as const, label: '취소' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 주문 목록 */}
      {isLoading ? (
        <ListSkeleton count={3} variant="row" />
      ) : orders.length === 0 ? (
        <EmptyState icon={Flame} title="기원 내역이 없습니다" />
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const remaining = getRemainingDays(order.endDate);
            const progress = getProgressPercent(order.startDate, order.endDate);
            const customerName = order.source === 'manual'
              ? order.manualCustomerName || '고객'
              : order.user?.fullName || '회원';

            return (
              <div key={order.id} className="rounded-2xl border border-gray-100 p-4">
                {/* 상품명 + 상태 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[15px] font-bold text-gray-900">{order.productName}</p>
                    <span className="text-xs text-gray-400">{getDurationLabel(order.durationDays)}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    PRAYER_ORDER_STATUS_COLORS[order.status]
                  }`}>
                    {PRAYER_ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* 고객 정보 */}
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                  <span>{customerName}</span>
                  {order.beneficiaryName && order.beneficiaryName !== customerName && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-400">수혜자 {order.beneficiaryName}</span>
                    </>
                  )}
                  {order.source === 'manual' && order.manualCustomerPhone && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-400">{order.manualCustomerPhone}</span>
                    </>
                  )}
                </div>

                {/* 기간 + 가격 */}
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                  <span>{order.startDate} ~ {order.endDate}</span>
                  {order.price > 0 && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-orange-500 font-medium">{order.price.toLocaleString()}원</span>
                    </>
                  )}
                </div>

                {order.wishText && (
                  <p className="text-xs text-gray-400 mt-1 truncate">&quot;{order.wishText}&quot;</p>
                )}

                {/* 진행률 바 (active만) */}
                {order.status === 'active' && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          remaining <= 7 ? 'bg-red-400' : 'bg-orange-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>{progress}%</span>
                      <span>{remaining > 0 ? `${remaining}일 남음` : '만료'}</span>
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                {order.status === 'pending' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => handleStatusChange(order.id, 'active')}
                      disabled={updatingId === order.id}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-medium hover:bg-orange-100 transition-colors disabled:opacity-50"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      기원 시작
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      disabled={updatingId === order.id}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      취소
                    </button>
                  </div>
                )}

                {order.status === 'active' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => handleStatusChange(order.id, 'completed')}
                      disabled={updatingId === order.id}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      기원 완료
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      disabled={updatingId === order.id}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      취소
                    </button>
                  </div>
                )}

                {(order.status === 'completed' || order.status === 'cancelled') && (
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => handleStatusChange(order.id, 'active')}
                      disabled={updatingId === order.id}
                      className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      다시 진행
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 수동 등록 FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* 수동 기원 등록 모달 */}
      {modalOpen && (
        <ManualPrayerModal
          products={products.filter((p) => p.isActive)}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
