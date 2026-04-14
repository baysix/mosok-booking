'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { MapPin, Clock, Briefcase, Calendar, Shield, Copy, ExternalLink, Navigation } from 'lucide-react';
import { MasterProfile } from '@/types/master.types';
import KakaoMap from '@/components/maps/KakaoMap';

interface MasterDetailViewProps {
  master: MasterProfile & { user?: { fullName: string } | null };
  action?: React.ReactNode;
  /** 하단 탭바가 있을 경우 모바일 액션 바 위치 조정 */
  hasBottomTab?: boolean;
}

export function MasterDetailView({ master, action, hasBottomTab = false }: MasterDetailViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const imageCount = master.images?.length || 0;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold && currentSlide < imageCount - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else if (diff < -threshold && currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide, imageCount]);

  const handleCopyAddress = () => {
    const fullAddress = [master.region, master.address].filter(Boolean).join(' ');
    navigator.clipboard.writeText(fullAddress);
    alert('주소가 복사되었습니다');
  };

  return (
    <div className={`min-h-screen bg-white ${hasBottomTab ? 'pb-40' : 'pb-24'} lg:pb-0`}>
      {/* Image Gallery */}
      <div className="relative">
        {master.images && master.images.length > 0 ? (
          <>
            {/* 모바일: 터치 슬라이드 */}
            <div
              className="md:hidden relative h-72 overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              ref={slideContainerRef}
            >
              <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {master.images.map((image, i) => (
                  <div key={i} className="w-full h-full flex-shrink-0 relative">
                    <Image
                      src={image}
                      alt={`${master.businessName} ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* 슬라이드 인디케이터 */}
              {imageCount > 1 && (
                <>
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-xs font-medium text-white">
                    {currentSlide + 1} / {imageCount}
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {master.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === currentSlide ? 'bg-white w-4' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 데스크탑: 그리드 레이아웃 */}
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-1 h-[420px]">
              <div className="col-span-2 row-span-2 overflow-hidden relative">
                <Image src={master.images[0]} alt={master.businessName} fill className="object-cover" />
              </div>
              {master.images.slice(1, 5).map((image, i) => (
                <div key={i} className="overflow-hidden relative">
                  <Image src={image} alt={`${master.businessName} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - (master.images.length - 1)) }).map((_, i) => (
                <div key={`ph-${i}`} className="flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50">
                  <span className="text-4xl">{['🔮', '✨', '🌙', '⭐'][i]}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-72 md:h-96 bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center">
            <span className="text-7xl">🔮</span>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {master.yearsExperience > 0 && (
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                    경력 {master.yearsExperience}년
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {master.businessName}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                {master.user && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{master.user.fullName}</span>
                  </div>
                )}
                {master.region && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{master.region}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specialties */}
            {master.specialties.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">전문분야</h2>
                <div className="flex flex-wrap gap-2">
                  {master.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-gray-100" />

            {/* Description */}
            {master.description && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">소개</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {master.description}
                </p>
              </div>
            )}

            {master.description && <div className="h-px bg-gray-100" />}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-xs font-medium text-gray-700 text-center">신원 검증 완료</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl">
                <Clock className="w-6 h-6 text-primary" />
                <span className="text-xs font-medium text-gray-700 text-center">빠른 응답</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl">
                <Calendar className="w-6 h-6 text-primary" />
                <span className="text-xs font-medium text-gray-700 text-center">당일 예약 가능</span>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Location */}
            {master.region && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">위치</h2>
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{master.region}</p>
                      {master.address && (
                        <p className="text-xs text-gray-500 mt-0.5">{master.address}</p>
                      )}
                    </div>
                  </div>

                  {/* KakaoMap */}
                  {master.latitude && master.longitude && (
                    <KakaoMap
                      latitude={master.latitude}
                      longitude={master.longitude}
                      markerTitle={master.businessName}
                      className="h-48 rounded-2xl"
                    />
                  )}

                  {/* Location Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleCopyAddress}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      주소 복사
                    </button>
                    {master.latitude && master.longitude && (
                      <>
                        <a
                          href={`https://map.kakao.com/link/map/${encodeURIComponent(master.businessName)},${master.latitude},${master.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          카카오맵에서 보기
                        </a>
                        <a
                          href={`https://map.kakao.com/link/to/${encodeURIComponent(master.businessName)},${master.latitude},${master.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#FEE500] text-gray-900 text-xs font-medium rounded-xl hover:bg-[#FDD800] transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          길찾기
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <div className="h-px bg-gray-100" />
              </>
            )}

            {/* Gallery */}
            {master.images && master.images.length > 1 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">갤러리</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {master.images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                      <Image src={img} alt={`${master.businessName} ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Info Card (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                {/* Price */}
                {master.basePrice > 0 && (
                  <>
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-gray-900">
                          {master.basePrice.toLocaleString()}
                        </span>
                        <span className="text-base text-gray-500">원~</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">기본 예약금 기준</p>
                    </div>
                    <div className="h-px bg-gray-100" />
                  </>
                )}

                {/* Quick Info */}
                <div className="space-y-3">
                  {master.yearsExperience > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">경력</span>
                      <span className="font-semibold text-gray-900">{master.yearsExperience}년</span>
                    </div>
                  )}
                  {master.region && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">위치</span>
                      <span className="font-semibold text-gray-900">{master.region}</span>
                    </div>
                  )}
                  {master.specialties.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">전문분야</span>
                      <span className="font-semibold text-gray-900">{master.specialties.length}개</span>
                    </div>
                  )}
                </div>

                {master.basePrice > 0 && <div className="h-px bg-gray-100" />}

                {/* CTA Button */}
                {action}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      {action && (
        <div
          className={`fixed ${hasBottomTab ? 'bottom-16' : 'bottom-0'} left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 lg:hidden z-40`}
          style={hasBottomTab ? undefined : { paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="max-w-lg mx-auto space-y-2">
            {master.basePrice > 0 && (
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-500">기본 예약금</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-gray-900">
                    {master.basePrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">원~</span>
                </div>
              </div>
            )}
            <div>{action}</div>
          </div>
        </div>
      )}
    </div>
  );
}
