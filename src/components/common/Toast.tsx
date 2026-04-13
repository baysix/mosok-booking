/**
 * 토스트 메시지 컴포넌트
 *
 * useToast 훅과 함께 사용. 두 가지 variant 지원:
 * - 'snackbar' (기본): 화면 하단 고정, 떠다니는 스타일
 * - 'banner': 페이지 내 인라인 배너 스타일
 *
 * 사용 예시:
 *   <Toast message={toast.message} />
 *   <Toast message={toast.message} variant="banner" />
 */
'use client';

import { Check, X } from 'lucide-react';
import { ToastMessage } from '@/hooks/useToast';

interface ToastProps {
  /** useToast 훅에서 반환된 메시지 (null이면 렌더링하지 않음) */
  message: ToastMessage | null;
  /** 표시 스타일 */
  variant?: 'snackbar' | 'banner';
}

export function Toast({ message, variant = 'snackbar' }: ToastProps) {
  if (!message) return null;

  // 스낵바: 화면 하단에 떠다니는 토스트
  if (variant === 'snackbar') {
    return (
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div
          className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-gray-900 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
          {message.text}
        </div>
      </div>
    );
  }

  // 배너: 페이지 내 인라인 알림
  return (
    <div
      className={`px-4 py-3 rounded-xl text-sm font-medium ${
        message.type === 'success'
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}
    >
      {message.text}
    </div>
  );
}
