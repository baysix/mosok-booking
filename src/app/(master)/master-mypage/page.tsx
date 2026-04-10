'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import {
  User,
  History,
  Users,
  KeyRound,
  ChevronRight,
  LogOut,
  FileText,
  Shield,
  HelpCircle,
} from 'lucide-react';

const SERVICE_MENU = [
  { href: ROUTES.MASTER_PROFILE, label: '내 프로필', desc: '프로필 정보 수정 및 미리보기', icon: User },
  { href: ROUTES.MASTER_SCHEDULE, label: '영업시간 설정', desc: '상담 가능 시간 및 휴무일', icon: History },
];

const MEMBER_MENU = [
  { href: ROUTES.MASTER_MEMBERS, label: '회원 관리', desc: '소속 회원 목록 관리', icon: Users },
  { href: ROUTES.MASTER_JOIN_CODES, label: '초대코드', desc: '회원 초대코드 생성 및 관리', icon: KeyRound },
];

export default function MasterMyPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'master')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* User info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xl font-bold text-indigo-600">
                {user.fullName?.[0] || 'M'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-900">{user.fullName}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>

        {/* 서비스 */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">서비스</p>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {SERVICE_MENU.map((item, idx) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                  idx < SERVICE_MENU.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                    <item.icon className="w-4.5 h-4.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* 회원 */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">회원</p>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {MEMBER_MENU.map((item, idx) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                  idx < MEMBER_MENU.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                    <item.icon className="w-4.5 h-4.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors mb-6"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">로그아웃</span>
        </button>

        {/* 서비스 안내 */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">서비스 안내</p>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {[
              { href: '#', label: '이용약관', icon: FileText },
              { href: '#', label: '개인정보처리방침', icon: Shield },
              { href: '#', label: '자주 묻는 질문', icon: HelpCircle },
            ].map((item, idx) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                  idx < 2 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </a>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-300">
          &copy; {new Date().getFullYear()} 무속 예약. All rights reserved.
        </p>
      </div>
    </div>
  );
}
