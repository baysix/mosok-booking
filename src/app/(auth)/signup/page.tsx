'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Eye, EyeOff, Check, Clock, Loader2 } from 'lucide-react';

type SignupMode = 'user' | 'master';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm mx-auto p-8 text-center text-gray-400">로딩 중...</div>}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const { signup, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'master' ? 'master' : 'user';

  const [mode, setMode] = useState<SignupMode>(initialTab);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    inviteCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInviteCodeChange = (value: string) => {
    setFormData({
      ...formData,
      inviteCode: value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6),
    });
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return '이름을 입력해주세요';
    if (!formData.email.trim()) return '이메일을 입력해주세요';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return '올바른 이메일 형식을 입력해주세요';
    if (formData.password.length < 8) return '비밀번호는 8자 이상이어야 합니다';
    if (formData.password !== formData.confirmPassword) return '비밀번호가 일치하지 않습니다';
    if (mode === 'user' && formData.inviteCode.length !== 6) return '초대 코드 6자리를 입력해주세요';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const result = await signup({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phone: formData.phone || undefined,
      role: mode,
      inviteCode: mode === 'user' ? formData.inviteCode : undefined,
    });

    if (result.success) {
      setSuccess(true);
      if (mode === 'master') {
        setSuccessMessage('관리자 승인 대기 중');
      } else {
        setSuccessMessage('회원가입이 완료되었습니다!');
        setTimeout(() => {
          router.push(ROUTES.LOGIN);
        }, 2000);
      }
    } else if (result.error) {
      setError(result.error);
    }
  };

  const handleModeSwitch = (newMode: SignupMode) => {
    setMode(newMode);
    setError('');
  };

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          {mode === 'master' ? (
            <>
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">등록 신청 완료</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                관리자 승인 대기 중입니다.
                <br />
                승인 후 서비스를 이용하실 수 있습니다.
              </p>
              <Link
                href={ROUTES.LOGIN}
                className="inline-block mt-6 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                로그인 페이지로
              </Link>
            </>
          ) : (
            <>
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">회원가입 완료!</h2>
              <p className="text-sm text-gray-500">로그인 페이지로 이동합니다...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/">
          <span className="text-3xl font-extrabold text-primary">무속</span>
        </Link>
        <p className="text-sm text-gray-500 mt-2">계정을 만들어 서비스를 이용하세요</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Tab Selector */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleModeSwitch('user')}
              disabled={isLoading}
              className={`h-11 rounded-xl text-sm font-semibold transition-all ${
                mode === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              회원 가입
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('master')}
              disabled={isLoading}
              className={`h-11 rounded-xl text-sm font-semibold transition-all ${
                mode === 'master'
                  ? 'bg-primary text-white'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              무속인 등록
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1.5">
              이름
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="홍길동"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              disabled={isLoading}
              className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
              이메일
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
              className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
              비밀번호
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="8자 이상 입력하세요"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                className="w-full h-11 px-4 pr-11 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
              className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          {/* Phone (user mode only, optional) */}
          {mode === 'user' && (
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                전화번호 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="010-0000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isLoading}
                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
              />
            </div>
          )}

          {/* Invite Code (user mode only, required) */}
          {mode === 'user' && (
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-semibold text-gray-700 mb-1.5">
                초대 코드 <span className="text-red-400">*</span>
              </label>
              <input
                id="inviteCode"
                type="text"
                placeholder="6자리 초대 코드"
                value={formData.inviteCode}
                onChange={(e) => handleInviteCodeChange(e.target.value)}
                maxLength={6}
                required
                disabled={isLoading}
                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium tracking-widest placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 uppercase"
              />
              <p className="text-xs text-gray-400 mt-1">무속인에게 받은 초대 코드를 입력하세요</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                처리 중...
              </>
            ) : mode === 'user' ? (
              '회원가입'
            ) : (
              '무속인 등록 신청'
            )}
          </button>
        </form>
      </div>

      {/* Footer Link */}
      <p className="text-center text-sm text-gray-500 mt-6">
        이미 계정이 있으신가요?{' '}
        <Link href={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
