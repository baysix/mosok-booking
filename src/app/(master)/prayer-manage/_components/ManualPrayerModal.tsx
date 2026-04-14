'use client';

import { useState, useMemo, useRef } from 'react';
import { useCreateManualPrayerOrder, useMembersList } from '@/hooks/queries';
import { BaseModal } from '@/components/common/BaseModal';
import { MembershipWithUser } from '@/types/membership.types';
import { PrayerProduct, getDurationLabel } from '@/types/prayer.types';
import { Flame, X, Loader2, User } from 'lucide-react';

interface ManualPrayerModalProps {
  products: PrayerProduct[];
  onClose: () => void;
}

export function ManualPrayerModal({ products, onClose }: ManualPrayerModalProps) {
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
