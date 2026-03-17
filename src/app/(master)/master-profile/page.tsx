'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getMyMasterProfile, updateMyMasterProfile } from '@/services/master.service';
import { MasterProfile, MasterStatus, Specialty } from '@/types/master.types';
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
} from 'lucide-react';

const STATUS_CONFIG: Record<MasterStatus, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: '승인 대기', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: '승인 완료', icon: CheckCircle, className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: '승인 거절', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
  suspended: { label: '정지됨', icon: AlertCircle, className: 'bg-gray-50 text-gray-700 border-gray-200' },
};

export default function MasterProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<MasterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [yearsExperience, setYearsExperience] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [region, setRegion] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [showPostcode, setShowPostcode] = useState(false);

  // 카카오맵 SDK 로드 (Geocoder 사용 위해)
  useKakaoLoader({ appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY || '', libraries: ['services'] });

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'master')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyMasterProfile();
      if (data) {
        setProfile(data);
        setBusinessName(data.businessName);
        setDescription(data.description);
        setSpecialties(data.specialties);
        setYearsExperience(String(data.yearsExperience));
        setBasePrice(String(data.basePrice));
        setRegion(data.region);
        setDetailAddress(data.address);
        setImages(data.images);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'master') {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handlePostcodeComplete = (data: Address) => {
    const roadAddr = data.roadAddress || data.address;
    setRegion(roadAddr);
    setDetailAddress('');
    setShowPostcode(false);

    // 카카오맵 Geocoder로 좌표 획득
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
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleSave = async () => {
    if (!businessName.trim()) {
      setMessage({ type: 'error', text: '상호명을 입력해주세요' });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateMyMasterProfile({
        businessName: businessName.trim(),
        description: description.trim(),
        specialties,
        yearsExperience: yearsExperience ? Number(yearsExperience) : 0,
        basePrice: basePrice ? Number(basePrice) : 0,
        region,
        address: detailAddress.trim(),
        images,
        ...(coords && { latitude: coords.latitude, longitude: coords.longitude }),
      });
      setProfile(updated);
      setMessage({ type: 'success', text: '프로필이 저장되었습니다' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '저장에 실패했습니다' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="h-4 w-20 bg-gray-100 rounded mb-3" />
                <div className="h-11 bg-gray-50 rounded-xl" />
              </div>
            ))}
          </div>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">내 프로필</h1>
            <p className="text-sm text-gray-500">무속인 프로필 정보를 관리하세요</p>
          </div>
          <button
            onClick={() => router.push('/master-profile/preview')}
            className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
          >
            미리보기
          </button>
        </div>

        {/* Message toast */}
        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Approval Status */}
        {profile && statusConfig && (
          <div className={`mb-5 px-4 py-3 rounded-xl border flex items-center gap-2 ${statusConfig.className}`}>
            <StatusIcon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">승인 상태: {statusConfig.label}</span>
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">
          {/* Business Name */}
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              소개
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="소개를 입력하세요"
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              전문분야
            </label>
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
          </div>

          {/* Years Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              경력 (년)
            </label>
            <input
              type="number"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              기본 상담료
            </label>
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

          {/* Address Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              주소
            </label>
            <button
              type="button"
              onClick={() => setShowPostcode(true)}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-500"
            >
              <Search className="w-4 h-4" />
              {region ? region : '주소를 검색하세요'}
            </button>

            {/* Postcode Modal */}
            {showPostcode && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
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

            {/* Selected Address Display */}
            {region && (
              <div className="mt-2 px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-sm font-medium text-indigo-700">{region}</span>
              </div>
            )}
          </div>

          {/* Detail Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              상세 주소 (동/호수)
            </label>
            <input
              type="text"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="예: 101동 202호"
              className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Image Upload */}
          <ImageUploader
            images={images}
            onChange={setImages}
            maxImages={5}
          />

          {/* Save Button */}
          <div className="sticky bottom-4 mt-4 z-10">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {saving ? (
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
