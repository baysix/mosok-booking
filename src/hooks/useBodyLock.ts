/**
 * 모달/오버레이 배경 스크롤 차단 훅
 *
 * 6개+ 모달에서 반복되는 document.body.style.overflow 패턴을 통합.
 *
 * 사용 예시:
 *   useBodyLock(isModalOpen);
 */
'use client';

import { useEffect } from 'react';

/**
 * @param isLocked true일 때 body 스크롤 차단, false일 때 복원
 */
export function useBodyLock(isLocked: boolean): void {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isLocked]);
}
