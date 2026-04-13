/**
 * 기원 서비스 관리 페이지 (마스터 전용)
 *
 * 상품 설정 탭 + 기원 현황 탭 2개 구성.
 * React Query 훅(useMyPrayerProducts, useMasterPrayerOrders 등) +
 * useMasterAuth + useBodyLock + ListSkeleton + EmptyState + BaseModal 적용.
 */
'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import {
  useMyPrayerProducts,
  useCreatePrayerProduct,
  useUpdatePrayerProduct,
  useDeletePrayerProduct,
  useMasterPrayerOrders,
  useCreateManualPrayerOrder,
  useUpdateMasterPrayerOrderStatus,
} from '@/hooks/queries';
import { useMembersList } from '@/hooks/queries';
import { useBodyLock } from '@/hooks/useBodyLock';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { BaseModal } from '@/components/common/BaseModal';
import { MembershipWithUser } from '@/types/membership.types';
import {
  PrayerProduct,
  PrayerOrderStatus,
  PRAYER_DURATION_PRESETS,
  PRAYER_CATEGORY_PRESETS,
  PRAYER_ORDER_STATUS_LABELS,
  PRAYER_ORDER_STATUS_COLORS,
  getRemainingDays,
  getProgressPercent,
  getDurationLabel,
  CreateManualPrayerOrderData,
} from '@/types/prayer.types';
import {
  Flame,
  Plus,
  X,
  Check,
  Loader2,
  User,
  ChevronLeft,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

type Tab = 'products' | 'orders';

export default function PrayerManagePage() {
  const router = useRouter();
  const { isReady } = useMasterAuth();
  const [activeTab, setActiveTab] = useState<Tab>('products');

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <button
          onClick={() => router.push(ROUTES.MASTER_MYPAGE)}
          className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
          내 점집
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">기원 서비스 관리</h1>
        </div>
        <p className="text-sm text-gray-500 mb-5">기원 상품 설정 및 주문을 관리하세요</p>

        {/* 탭 전환 */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'products'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            상품 설정
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'orders'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            기원 현황
          </button>
        </div>

        {activeTab === 'products' ? <ProductsTab /> : <OrdersTab />}
      </div>
    </div>
  );
}

// ============ 상품 설정 탭 ============

function ProductsTab() {
  /** React Query: 상품 목록 + CRUD mutations */
  const { data: products = [], isLoading } = useMyPrayerProducts();
  const updateMutation = useUpdatePrayerProduct();
  const deleteMutation = useDeletePrayerProduct();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PrayerProduct | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /** 메시지 자동 해제 */
  if (message) {
    setTimeout(() => setMessage(null), 3000);
  }

  /** 활성/비활성 토글 */
  const handleToggleActive = async (product: PrayerProduct) => {
    try {
      await updateMutation.mutateAsync({ id: product.id, isActive: !product.isActive });
      setMessage({ type: 'success', text: product.isActive ? '비활성화되었습니다' : '활성화되었습니다' });
    } catch {
      setMessage({ type: 'error', text: '변경에 실패했습니다' });
    }
  };

  /** 상품 삭제 */
  const handleDelete = async (product: PrayerProduct) => {
    if (!confirm(`"${product.name}" 상품을 삭제하시겠습니까?`)) return;
    try {
      await deleteMutation.mutateAsync(product.id);
      setMessage({ type: 'success', text: '삭제되었습니다' });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '삭제에 실패했습니다' });
    }
  };

  if (isLoading) {
    return <ListSkeleton count={3} variant="row" />;
  }

  return (
    <div>
      {products.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="등록된 기원 상품이 없습니다"
          action={{ label: '상품 등록하기', onClick: () => { setEditingProduct(null); setModalOpen(true); } }}
        />
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`rounded-2xl border p-4 transition-colors ${
                product.isActive ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-[15px] font-bold text-gray-900">{product.name}</p>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => handleToggleActive(product)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title={product.isActive ? '비활성화' : '활성화'}
                  >
                    {product.isActive ? (
                      <ToggleRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => { setEditingProduct(product); setModalOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              {product.description && (
                <p className="text-xs text-gray-400 mb-2">{product.description}</p>
              )}
              {product.options.filter((o) => o.isActive).length > 0 ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  {product.options
                    .filter((o) => o.isActive)
                    .sort((a, b) => a.durationDays - b.durationDays)
                    .map((opt) => (
                      <div key={opt.id} className="flex items-baseline gap-1.5 text-xs">
                        <span className="text-gray-500">{getDurationLabel(opt.durationDays)}</span>
                        <span className="text-orange-600 font-semibold">{opt.price.toLocaleString()}원</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">옵션 없음</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 상품 추가 FAB */}
      {products.length > 0 && (
        <button
          onClick={() => { setEditingProduct(null); setModalOpen(true); }}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center z-50"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* 상품 등록/수정 모달 */}
      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setModalOpen(false); setEditingProduct(null); }}
          onSaved={() => {
            setMessage({ type: 'success', text: editingProduct ? '수정되었습니다' : '등록되었습니다' });
          }}
        />
      )}

      {/* 스낵바 토스트 */}
      {message && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {message.text}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ 상품 등록/수정 모달 ============

function ProductFormModal({
  product,
  onClose,
  onSaved,
}: {
  product: PrayerProduct | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!product;
  const createMutation = useCreatePrayerProduct();
  const updateMutation = useUpdatePrayerProduct();

  const [category, setCategory] = useState(product?.category || '등');
  const [customCategory, setCustomCategory] = useState(() => {
    if (product?.category && !PRAYER_CATEGORY_PRESETS.includes(product.category as typeof PRAYER_CATEGORY_PRESETS[number])) {
      return product.category;
    }
    return '';
  });
  const [isCustomCategory, setIsCustomCategory] = useState(() => {
    return !!product?.category && !PRAYER_CATEGORY_PRESETS.includes(product.category as typeof PRAYER_CATEGORY_PRESETS[number]);
  });
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [options, setOptions] = useState<{ durationDays: string; price: string }[]>(() => {
    if (product && product.options.length > 0) {
      return product.options
        .sort((a, b) => a.durationDays - b.durationDays)
        .map((o) => ({ durationDays: String(o.durationDays), price: String(o.price) }));
    }
    return PRAYER_DURATION_PRESETS.map((d) => ({ durationDays: String(d.days), price: '' }));
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateOption = (idx: number, field: 'durationDays' | 'price', value: string) => {
    setOptions((prev) => prev.map((o, i) => i === idx ? { ...o, [field]: value } : o));
  };

  const addOption = () => {
    setOptions((prev) => [...prev, { durationDays: '', price: '' }]);
  };

  const removeOption = (idx: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const addPreset = (days: number) => {
    if (options.some((o) => o.durationDays === String(days))) return;
    setOptions((prev) => [...prev, { durationDays: String(days), price: '' }]
      .sort((a, b) => Number(a.durationDays) - Number(b.durationDays)));
  };

  /** 폼 제출 — create/update mutation 사용 */
  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) { setError('상품명을 입력해주세요'); return; }

    const validOptions = options.filter((o) => o.durationDays && o.price);
    if (validOptions.length === 0) { setError('최소 1개의 기간/가격 옵션을 설정해주세요'); return; }

    for (const opt of validOptions) {
      const days = parseInt(opt.durationDays, 10);
      const price = parseInt(opt.price, 10);
      if (isNaN(days) || days <= 0) { setError('기간을 올바르게 입력해주세요'); return; }
      if (isNaN(price) || price < 0) { setError('가격을 올바르게 입력해주세요'); return; }
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) { setError('상품 유형을 입력해주세요'); return; }

    setIsSubmitting(true);
    try {
      const optionData = validOptions.map((o) => ({
        durationDays: parseInt(o.durationDays, 10),
        price: parseInt(o.price, 10),
      }));

      if (isEdit && product) {
        await updateMutation.mutateAsync({
          id: product.id,
          category: finalCategory,
          name: name.trim(),
          description: description.trim(),
          options: optionData,
        });
      } else {
        await createMutation.mutateAsync({
          category: finalCategory,
          name: name.trim(),
          description: description.trim() || undefined,
          options: optionData,
        });
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title={isEdit ? '상품 수정' : '상품 등록'}
      footer={
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !name.trim()}
          className="w-full h-12 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              저장 중...
            </>
          ) : (
            isEdit ? '수정하기' : '등록하기'
          )}
        </button>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-50 text-sm text-red-600">{error}</div>
        )}

        {/* 상품 유형 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            상품 유형 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {PRAYER_CATEGORY_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => { setCategory(preset); setIsCustomCategory(false); setCustomCategory(''); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  !isCustomCategory && category === preset
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {preset}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsCustomCategory(true)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isCustomCategory
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              직접입력
            </button>
          </div>
          {isCustomCategory && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="유형명 입력"
              className="w-full h-11 px-3 mt-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              autoFocus
            />
          )}
        </div>

        {/* 상품명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            상품명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 합격기원, 건강기원"
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="상품에 대한 설명 (선택)"
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* 기간별 가격 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기간별 가격 <span className="text-red-500">*</span>
          </label>

          {/* 프리셋 빠른 추가 */}
          <div className="flex gap-2 mb-3">
            {PRAYER_DURATION_PRESETS.map((preset) => {
              const exists = options.some((o) => o.durationDays === String(preset.days));
              return (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => addPreset(preset.days)}
                  disabled={exists}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    exists
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}{!exists && ' +'}
                </button>
              );
            })}
            <button
              type="button"
              onClick={addOption}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              직접입력 +
            </button>
          </div>

          {/* 옵션 행 */}
          <div className="space-y-2">
            {options.map((opt, idx) => {
              const presetLabel = PRAYER_DURATION_PRESETS.find((d) => String(d.days) === opt.durationDays)?.label;
              const isPresetDuration = !!presetLabel;
              return (
                <div key={idx} className="flex items-center gap-2">
                  {isPresetDuration ? (
                    <div className="w-20 h-10 flex items-center justify-center rounded-lg bg-orange-50 text-xs font-medium text-orange-700">
                      {presetLabel}
                    </div>
                  ) : (
                    <div className="w-20 relative">
                      <input
                        type="number"
                        value={opt.durationDays}
                        onChange={(e) => updateOption(idx, 'durationDays', e.target.value)}
                        placeholder="일수"
                        className="w-full h-10 px-2 pr-6 text-center text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">일</span>
                    </div>
                  )}
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={opt.price}
                      onChange={(e) => updateOption(idx, 'price', e.target.value)}
                      placeholder="가격"
                      className="w-full h-10 px-3 pr-8 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">원</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              );
            })}
          </div>
          {options.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">위 버튼을 눌러 기간 옵션을 추가하세요</p>
          )}
        </div>
      </div>
    </BaseModal>
  );
}

// ============ 기원 현황 탭 ============

function OrdersTab() {
  /** React Query: 주문 목록 + 상태 변경 + 상품 목록 (수동 등록용) */
  const [statusFilter, setStatusFilter] = useState<PrayerOrderStatus | ''>('');
  const { data: orders = [], isLoading } = useMasterPrayerOrders(statusFilter || undefined);
  const { data: products = [] } = useMyPrayerProducts();
  const statusMutation = useUpdateMasterPrayerOrderStatus();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  /** 주문 상태 변경 */
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
        <EmptyState
          icon={Flame}
          title="기원 내역이 없습니다"
        />
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

// ============ 수동 기원 등록 모달 ============

function ManualPrayerModal({
  products,
  onClose,
}: {
  products: PrayerProduct[];
  onClose: () => void;
}) {
  const customerInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateManualPrayerOrder();
  const { data: members = [] } = useMembersList();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMemberList, setShowMemberList] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [wishText, setWishText] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  /** 회원 검색 필터 */
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter((m) =>
      m.user.fullName.toLowerCase().includes(q) ||
      m.user.phone?.includes(q) ||
      m.user.email.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const handleSelectMember = (member: MembershipWithUser) => {
    setSelectedUserId(member.user.id);
    setCustomerName(member.user.fullName);
    setCustomerPhone(member.user.phone || '');
    setSearchQuery('');
    setShowMemberList(false);
  };

  const handleClearMember = () => {
    setSelectedUserId(null);
    setCustomerName('');
    setCustomerPhone('');
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedOption = selectedProduct?.options.find((o) => o.id === selectedOptionId);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setSelectedOptionId('');
  };

  /** 폼 제출 — createManualPrayerOrder mutation 사용 */
  const handleSubmit = async () => {
    setError('');
    if (!customerName.trim()) { setError('고객명을 입력해주세요'); return; }
    if (!selectedProductId) { setError('상품을 선택해주세요'); return; }
    if (!selectedOptionId) { setError('기간을 선택해주세요'); return; }

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        productId: selectedProductId,
        optionId: selectedOptionId,
        beneficiaryName: beneficiaryName.trim() || customerName.trim(),
        wishText: wishText.trim() || undefined,
        startDate,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        userId: selectedUserId || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="수동 기원 등록"
      icon={
        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
          <Flame className="w-4 h-4 text-orange-500" />
        </div>
      }
      footer={
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !customerName.trim() || !selectedProductId || !selectedOptionId}
          className="w-full h-12 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              등록 중...
            </>
          ) : (
            '기원 등록'
          )}
        </button>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-50 text-sm text-red-600">{error}</div>
        )}

        {/* 고객 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            고객 <span className="text-red-500">*</span>
          </label>

          {selectedUserId ? (
            <div className="flex items-center justify-between h-11 px-3 rounded-xl border border-orange-300 bg-orange-50">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-gray-900">{customerName}</span>
                {customerPhone && <span className="text-gray-400">{customerPhone}</span>}
              </div>
              <button type="button" onClick={handleClearMember} className="p-1 rounded hover:bg-orange-100">
                <X className="w-3.5 h-3.5 text-orange-400" />
              </button>
            </div>
          ) : (
            <div className="relative" onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setShowMemberList(false);
                if (showMemberList && !customerName) {
                  setCustomerName(searchQuery);
                }
                setSearchQuery('');
              }
            }}>
              <input
                ref={customerInputRef}
                type="text"
                value={showMemberList ? searchQuery : customerName}
                onChange={(e) => {
                  if (showMemberList) {
                    setSearchQuery(e.target.value);
                  } else {
                    setCustomerName(e.target.value);
                  }
                }}
                onFocus={() => { setShowMemberList(true); setSearchQuery(''); }}
                placeholder={showMemberList ? '이름 또는 연락처로 검색' : '고객 이름'}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                autoFocus
              />

              {showMemberList && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectMember(m)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-orange-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{m.user.fullName}</p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {m.user.phone || m.user.email}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-xs text-gray-400 text-center">
                      {searchQuery ? '검색 결과가 없습니다' : '가입된 회원이 없습니다'}
                    </div>
                  )}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setShowMemberList(false);
                      setCustomerName(searchQuery);
                      setSearchQuery('');
                      setTimeout(() => customerInputRef.current?.focus(), 0);
                    }}
                    className="w-full px-3 py-2.5 text-xs text-orange-500 font-medium text-center border-t border-gray-100 hover:bg-gray-50 transition-colors rounded-b-xl"
                  >
                    직접 입력하기
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 비회원 직접 입력 시 연락처 */}
          {!selectedUserId && !showMemberList && customerName && (
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="연락처 (선택)"
              className="w-full h-11 px-3 mt-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          )}
        </div>

        {/* 상품 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            상품 선택 <span className="text-red-500">*</span>
          </label>
          {products.length === 0 ? (
            <p className="text-sm text-gray-400">등록된 상품이 없습니다. 상품 설정 탭에서 먼저 등록하세요.</p>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProduct(p.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-colors ${
                    selectedProductId === p.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  {p.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 기간 선택 */}
        {selectedProduct && selectedProduct.options.filter((o) => o.isActive).length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              기간 선택 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {selectedProduct.options
                .filter((o) => o.isActive)
                .sort((a, b) => a.durationDays - b.durationDays)
                .map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-3 rounded-xl border text-center transition-colors ${
                      selectedOptionId === opt.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <p className="text-xs text-gray-500">{getDurationLabel(opt.durationDays)}</p>
                    <p className="text-sm font-bold text-orange-600 mt-0.5">
                      ₩{opt.price.toLocaleString()}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* 수혜자명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">수혜자명</label>
          <input
            type="text"
            value={beneficiaryName}
            onChange={(e) => setBeneficiaryName(e.target.value)}
            placeholder="비워두면 고객명과 동일"
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* 시작일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">시작일</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* 소원/기원 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">소원/기원 내용</label>
          <textarea
            value={wishText}
            onChange={(e) => setWishText(e.target.value)}
            placeholder="소원을 적어주세요"
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* 선택 요약 */}
        {selectedOption && (
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-xs text-orange-600 font-medium">선택된 상품</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {selectedProduct?.name} ({getDurationLabel(selectedOption.durationDays)})
            </p>
            <p className="text-sm font-semibold text-orange-600">₩{selectedOption.price.toLocaleString()}</p>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
