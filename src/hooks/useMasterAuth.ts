/**
 * 마스터 전용 인증 훅
 *
 * 11개+ 마스터 페이지에서 반복되는 인증 가드 로직을 통합.
 * - 로그인하지 않았거나 master 역할이 아니면 홈으로 리다이렉트
 * - isReady가 true일 때만 페이지 콘텐츠를 렌더링하면 됨
 *
 * 사용 예시:
 *   const { user, isReady } = useMasterAuth();
 *   if (!isReady) return null;
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/auth.types';

interface MasterAuthResult {
  /** 인증된 사용자 정보 (로딩 중이면 null) */
  user: User | null;
  /** 인증 상태 로딩 여부 */
  isLoading: boolean;
  /** 마스터 ID */
  masterId: string | null;
  /** 인증 완료 + 마스터 역할 확인됨 (true일 때 페이지 렌더링) */
  isReady: boolean;
}

export function useMasterAuth(): MasterAuthResult {
  const router = useRouter();
  const { user, masterId, isLoading } = useAuth();

  // 인증 로딩 완료 후 마스터가 아니면 홈으로 리다이렉트
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'master')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  return {
    user,
    isLoading,
    masterId,
    isReady: !isLoading && !!user && user.role === 'master',
  };
}
