/**
 * 마스터 프로필 수정 페이지
 *
 * 점집 정보(상호명, 소개, 전문분야, 주소, 계좌 등) 조회·수정.
 * React Query(useMyMasterProfile, useUpdateMasterProfile) + useMasterAuth + useBodyLock 적용.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMyMasterProfile, useUpdateMasterProfile } from '@/hooks/queries';
import { useBodyLock } from '@/hooks/useBodyLock';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { MasterStatus, Specialty } from '@/types/master.types';
import { SPECIALTIES } from '@/constants/regions';
import ImageUploader from '@/components/upload/ImageUploader';
import DaumPostcodeEmbed, { Address } from 'react-daum-postcode';
import { useKakaoLoader } from 'react-kakao-maps-sdk';
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  MapPin,
  X,
  Plus,
} from 'lucide-react';

/** 마스터 승인 상태별 스타일 */
const STATUS_CONFIG: Record<MasterStatus, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: '승인 대기', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: '승인 완료', icon: CheckCircle, className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: '승인 거절', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
  suspended: { label: '정지됨', icon: AlertCircle, className: 'bg-gray-50 text-gray-700 border-gray-200' },
};

export default function MasterProfilePage() {
  const router = useRouter();
  const { isReady } = useMasterAuth();

  /** React Query: 프로필 조회 & 수정 */
  const { data: profile, isLoading } = useMyMasterProfile(isReady);
  const updateMutation = useUpdateMasterProfile();

  /** 로컬 폼 상태 */
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [yearsExperience, setYearsExperience] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [region, setRegion] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [showPostcode, setShowPostcode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [initialized, setInitialized] = useState(false);

  /** 주소 검색 모달 스크롤 차단 */
  useBodyLock(showPostcode);

  /** 카카오맵 SDK (Geocoder 사용) */
  useKakaoLoader({ appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY || '', libraries: ['services'] });

  /** 쿼리 데이터 → 로컬 상태 동기화 (최초 1회) */
  useEffect(() => {
    if (profile && !initialized) {
      setBusinessName(profile.businessName);
      setDescription(profile.description);
      setSpecialties(profile.specialties);
      setYearsExperience(String(profile.yearsExperience));
      setBasePrice(String(profile.basePrice));
      setBankName(profile.bankName || '');
      setAccountNumber(profile.accountNumber || '');
      setAccountHolder(profile.accountHolder || '');
      setRegion(profile.region);
      setDetailAddress(profile.address);
      setImages(profile.images);
      setInitialized(true);
    }
  }, [profile, initialized]);

  /** 알림 메시지 3초 후 자동 해제 */
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  /** 주소 검색 완료 핸들러 (카카오 Geocoder로 좌표 획득) */
  const handlePostcodeComplete = (data: Address) => {
    const roadAddr = data.roadAddress || data.address;
    setRegion(roadAddr);
    setDetailAddress('');
    setShowPostcode(false);

    if (window.kakao?.maps?.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(roadAddr, (result: { x: string; y: string }[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          setCoords({
            latitude: parseFloat(result[0].y),
            longitude: parseFloat(result[0].x),
          });
        }
      });
    }
  };

  const toggleSpecialty = (specialty: Specialty) => {
    setSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    );
  };

  const addCustomSpecialty = () => {
    const trimmed = customSpecialty.trim();
    if (!trimmed) return;
    if (specialties.includes(trimmed)) {
      setCustomSpecialty('');
      return;
    }
    setSpecialties((prev) => [...prev, trimmed]);
    setCustomSpecialty('');
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties((prev) => prev.filter((s) => s !== specialty));
  };

  /** 프로필 저장 — useUpdateMasterProfile mutation 사용 */
  const handleSave = async () => {
    if (!businessName.trim()) {
      setMessage({ type: 'error', text: '상호명을 입력해주세요' });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        businessName: businessName.trim(),
        description: description.trim(),
        specialties,
        yearsExperience: yearsExperience ? Number(yearsExperience) : 0,
        basePrice: basePrice ? Number(basePrice) : 0,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        region,
        address: detailAddress.trim(),
        images,
        ...(coords && { latitude: coords.latitude, longitude: coords.longitude }),
      });
      setMessage({ type: 'success', text: '프로필이 저장되었습니다' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '저장에 실패했습니다' });
    }
  };

  if (!isReady) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <ListSkeleton count={4} variant="card" />
        </div>
      </div>
    );
  }

  const statusConfig = profile ? STATUS_CONFIG[profile.status] : null;
  const StatusIcon = statusConfig?.icon || Clock;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">내 점집 수정</h1>
            <p className="text-sm text-gray-500">점집 정보를 관리하세요</p>
          </div>
          <button
            onClick={() => router.push('/master-profile/preview')}
            className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
          >
            미리보기
          </button>
        </div>

        {/* 스낵바 토스트 */}
        {message && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div
              className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-lg flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-gray-900 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* 승인 상태 배너 */}
        {profile && statusConfig && (
          <div className={`mb-5 px-4 py-3 rounded-xl border flex items-center gap-2 ${statusConfig.className}`}>
            <StatusIcon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">승인 상태: {statusConfig.label}</span>
          </div>
        )}

        {/* 프로필 폼 */}
        <div className="space-y-5">
          {/* 상호명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              상호명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="상호명을 입력하세요"
              className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* 소개 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">소개</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="소개를 입력하세요"
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* 전문분야 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">전문분야</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => {
                const active = specialties.includes(s.value as Specialty);
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleSpecialty(s.value as Specialty)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                      active
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* 커스텀 전문분야 입력 */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={customSpecialty}
                onChange={(e) => setCustomSpecialty(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSpecialty();
                  }
                }}
                placeholder="직접 입력하세요"
                className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={addCustomSpecialty}
                className="h-10 px-4 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 active:scale-95 transition-all flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                추가
              </button>
            </div>

            {/* 선택된 전문분야 태그 */}
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {specialties.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(s)}
                      className="p-0.5 rounded-full hover:bg-indigo-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 경력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">경력 (년)</label>
            <input
              type="number"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* 기본 예약금 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">기본 예약금</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₩</span>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full h-11 pl-8 pr-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* 입금 계좌 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">입금 계좌</label>
            <p className="text-xs text-gray-400 mb-2">예약금 입금을 받을 계좌 정보를 입력하세요</p>
            <div className="space-y-2">
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="은행명 (예: 국민은행)"
                className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="계좌번호"
                className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="예금주"
                className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* 주소 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">주소</label>
            <button
              type="button"
              onClick={() => setShowPostcode(true)}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-500"
            >
              <Search className="w-4 h-4" />
              {region ? region : '주소를 검색하세요'}
            </button>

            {/* 주소 검색 모달 */}
            {showPostcode && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
                <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-900">주소 검색</span>
                    <button
                      type="button"
                      onClick={() => setShowPostcode(false)}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <DaumPostcodeEmbed
                    onComplete={handlePostcodeComplete}
                    style={{ height: 470 }}
                  />
                </div>
              </div>
            )}

            {/* 선택된 주소 표시 */}
            {region && (
              <div className="mt-2 px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-sm font-medium text-indigo-700">{region}</span>
              </div>
            )}
          </div>

          {/* 상세 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">상세 주소 (동/호수)</label>
            <input
              type="text"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="예: 101동 202호"
              className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* 이미지 업로드 */}
          <ImageUploader
            images={images}
            onChange={setImages}
            maxImages={5}
          />

          {/* 저장 버튼 */}
          <div className="sticky bottom-4 mt-4 z-10">
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="w-full py-3.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  프로필 저장
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
