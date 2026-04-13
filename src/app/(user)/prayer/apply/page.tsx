'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAvailablePrayerProducts, applyPrayerOrder } from '@/services/prayer.service';
import {
  PrayerProduct,
  getDurationLabel,
} from '@/types/prayer.types';
import { Flame, ChevronLeft, Loader2, Check } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function PrayerApplyPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<PrayerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [wishText, setWishText] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    getAvailablePrayerProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (authLoading || !user) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedOption = selectedProduct?.options.find((o) => o.id === selectedOptionId);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setSelectedOptionId('');
  };

  const handleSubmit = async () => {
    setError('');
    if (!selectedProductId || !selectedOptionId) { setError('상품과 기간을 선택해주세요'); return; }
    if (!beneficiaryName.trim()) { setError('수혜자명을 입력해주세요'); return; }

    setIsSubmitting(true);
    try {
      await applyPrayerOrder({
        productId: selectedProductId,
        optionId: selectedOptionId,
        beneficiaryName: beneficiaryName.trim(),
        wishText: wishText.trim() || undefined,
        startDate,
      });
      router.push(ROUTES.USER_PRAYER);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '신청에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <button
          onClick={() => router.push(ROUTES.USER_PRAYER)}
          className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
          돌아가기
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">기원 신청</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">원하는 기원 상품을 선택하여 신청하세요</p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Flame className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">현재 등록된 기원 상품이 없습니다</p>
          </div>
        ) : (
          <>
            {/* Product Selection */}
            <div className="space-y-3 mb-6">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProduct(p.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-colors ${
                    selectedProductId === p.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700">
                      {p.category}
                    </span>
                    <p className="text-sm font-bold text-gray-900">{p.name}</p>
                  </div>
                  {p.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {p.options
                      .filter((o) => o.isActive)
                      .sort((a, b) => a.durationDays - b.durationDays)
                      .map((opt) => (
                        <span key={opt.id} className="px-2 py-0.5 rounded-md bg-white/80 text-xs text-gray-600">
                          {getDurationLabel(opt.durationDays)} ₩{opt.price.toLocaleString()}
                        </span>
                      ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Option Selection */}
            {selectedProduct && selectedProduct.options.filter((o) => o.isActive).length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">기간 선택</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProduct.options
                    .filter((o) => o.isActive)
                    .sort((a, b) => a.durationDays - b.durationDays)
                    .map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`p-3 rounded-xl border text-center transition-colors ${
                          selectedOptionId === opt.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <p className="text-xs text-gray-400">{getDurationLabel(opt.durationDays)}</p>
                        <p className="text-sm font-bold text-orange-600 mt-0.5">
                          ₩{opt.price.toLocaleString()}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Application Form */}
            {selectedOption && (
              <div className="space-y-4 border-t border-gray-100 pt-5">
                <div className="bg-orange-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-orange-600">선택한 기원</p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedProduct?.name} ({getDurationLabel(selectedOption.durationDays)})
                  </p>
                  <p className="text-sm font-semibold text-orange-600">₩{selectedOption.price.toLocaleString()}</p>
                </div>

                {error && (
                  <div className="px-3 py-2 rounded-lg bg-red-50 text-sm text-red-600">{error}</div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    수혜자명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    placeholder="기원을 받을 분의 이름"
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">소원/기원 내용</label>
                  <textarea
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="소원을 적어주세요 (선택)"
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">시작일</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !beneficiaryName.trim()}
                  className="w-full h-12 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      신청 중...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      기원 신청하기
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
