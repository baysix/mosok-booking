'use client';

import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { MapPin } from 'lucide-react';

interface KakaoMapProps {
  latitude: number;
  longitude: number;
  markerTitle?: string;
  className?: string;
}

export default function KakaoMap({ latitude, longitude, markerTitle, className }: KakaoMapProps) {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY || '',
  });

  if (!latitude || !longitude) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className || 'h-48 rounded-2xl'}`}>
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <MapPin className="w-6 h-6" />
          <span className="text-sm">위치 정보가 없습니다</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className || 'h-48 rounded-2xl'}`}>
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className || 'h-48 rounded-2xl'}`}>
        <span className="text-sm text-gray-400">지도를 불러올 수 없습니다</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className || 'h-48 rounded-2xl'}`}>
      <Map
        center={{ lat: latitude, lng: longitude }}
        style={{ width: '100%', height: '100%' }}
        level={3}
      >
        <MapMarker position={{ lat: latitude, lng: longitude }}>
          {markerTitle && (
            <div style={{ padding: '5px', fontSize: '12px', whiteSpace: 'nowrap' }}>
              {markerTitle}
            </div>
          )}
        </MapMarker>
      </Map>
    </div>
  );
}
