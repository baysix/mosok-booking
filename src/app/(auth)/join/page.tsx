'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { KeyRound, Loader2 } from 'lucide-react';

export default function JoinPage() {
  const { joinWithCode, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('초대 코드는 6자리여야 합니다');
      return;
    }

    setIsSubmitting(true);

    const result = await joinWithCode(code);
    if (!result.success && result.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
    // On success, joinWithCode redirects automatically
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/">
          <span className="text-3xl font-extrabold text-primary">무속</span>
        </Link>
        <p className="text-sm text-gray-500 mt-2">초대 코드를 입력하여 서비스에 참여하세요</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="w-7 h-7 text-primary" />
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 text-center mb-1">초대 코드 입력</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          무속인에게 받은 6자리 초대 코드를 입력하세요
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="ABC123"
              maxLength={6}
              disabled={isSubmitting}
              className="w-full h-14 px-4 rounded-xl bg-gray-50 border border-gray-200 text-center text-2xl font-bold tracking-[0.3em] placeholder:text-gray-300 placeholder:tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 uppercase"
            />
            <p className="text-xs text-gray-400 text-center mt-2">
              영문 대문자와 숫자 6자리
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            className="w-full h-11 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                확인 중...
              </>
            ) : (
              '참여하기'
            )}
          </button>
        </form>
      </div>

      {/* Footer Links */}
      <div className="text-center mt-6 space-y-2">
        <p className="text-sm text-gray-500">
          계정이 없으신가요?{' '}
          <Link href={ROUTES.SIGNUP} className="text-primary font-semibold hover:underline">
            회원가입
          </Link>
        </p>
        <p className="text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
