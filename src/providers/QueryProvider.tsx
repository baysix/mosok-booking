/**
 * React Query 전역 프로바이더
 *
 * 루트 레이아웃에서 children을 감싸서 React Query 기능을 전역 사용.
 * QueryClient 기본 설정:
 * - staleTime: 30초 (30초 동안 캐시된 데이터를 fresh로 간주)
 * - refetchOnWindowFocus: false (모바일 특성상 비활성화)
 * - retry: 1 (실패 시 1회 재시도)
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState로 QueryClient를 생성하여 SSR 시 인스턴스 공유 방지
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
