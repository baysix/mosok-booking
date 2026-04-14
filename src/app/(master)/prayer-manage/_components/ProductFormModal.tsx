'use client';

import { useState } from 'react';
import { useCreatePrayerProduct, useUpdatePrayerProduct } from '@/hooks/queries';
import { BaseModal } from '@/components/common/BaseModal';
import {
  PrayerProduct,
  PRAYER_DURATION_PRESETS,
  PRAYER_CATEGORY_PRESETS,
} from '@/types/prayer.types';
import { X, Loader2 } from 'lucide-react';

interface ProductFormModalProps {
  product: PrayerProduct | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
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
