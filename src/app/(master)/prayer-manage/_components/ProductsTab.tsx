'use client';

import { useState } from 'react';
import {
  useMyPrayerProducts,
  useUpdatePrayerProduct,
  useDeletePrayerProduct,
} from '@/hooks/queries';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { PrayerProduct, getDurationLabel } from '@/types/prayer.types';
import {
  Flame,
  Plus,
  Check,
  X,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { ProductFormModal } from './ProductFormModal';

export function ProductsTab() {
  const { data: products = [], isLoading } = useMyPrayerProducts();
  const updateMutation = useUpdatePrayerProduct();
  const deleteMutation = useDeletePrayerProduct();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PrayerProduct | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (message) {
    setTimeout(() => setMessage(null), 3000);
  }

  const handleToggleActive = async (product: PrayerProduct) => {
    try {
      await updateMutation.mutateAsync({ id: product.id, isActive: !product.isActive });
      setMessage({ type: 'success', text: product.isActive ? '비활성화되었습니다' : '활성화되었습니다' });
    } catch {
      setMessage({ type: 'error', text: '변경에 실패했습니다' });
    }
  };

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
