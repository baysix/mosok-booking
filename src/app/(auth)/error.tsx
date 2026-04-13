/**
 * 인증 라우트 그룹 에러 바운더리
 */
'use client';

import { AlertCircle, RotateCcw } from 'lucide-react';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-red-500" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">문제가 발생했습니다</h2>
      <p className="text-sm text-gray-500 text-center mb-6 max-w-sm">
        {error.message || '알 수 없는 오류가 발생했습니다.'}
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        다시 시도
      </button>
    </div>
  );
}
