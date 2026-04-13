/**
 * 토스트 메시지 훅
 *
 * 5개+ 페이지에서 반복되는 메시지 상태 + 자동 해제 타이머 패턴을 통합.
 *
 * 사용 예시:
 *   const toast = useToast();
 *   toast.success('저장되었습니다');
 *   toast.error('실패했습니다');
 *   // JSX에서: <Toast message={toast.message} />
 */
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ToastMessage {
  type: 'success' | 'error';
  text: string;
}

interface UseToastReturn {
  /** 현재 표시 중인 메시지 (없으면 null) */
  message: ToastMessage | null;
  /** 성공 메시지 표시 */
  success: (text: string) => void;
  /** 에러 메시지 표시 */
  error: (text: string) => void;
  /** 메시지 즉시 숨기기 */
  clear: () => void;
}

/**
 * @param duration 자동 해제 시간 (ms, 기본값: 3000)
 */
export function useToast(duration: number = 3000): UseToastReturn {
  const [message, setMessage] = useState<ToastMessage | null>(null);

  // 메시지가 표시되면 duration 후 자동 해제
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  const success = useCallback((text: string) => {
    setMessage({ type: 'success', text });
  }, []);

  const error = useCallback((text: string) => {
    setMessage({ type: 'error', text });
  }, []);

  const clear = useCallback(() => {
    setMessage(null);
  }, []);

  return { message, success, error, clear };
}
