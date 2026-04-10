'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { User, MessageSquare, Menu, X, LogOut, LayoutDashboard, Calendar, Bell, Users } from 'lucide-react';

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="무속 예약"
              width={70}
              height={70}
              priority
            />
          </Link>

          {/* User Actions - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {isLoading ? (
              <div className="w-20 h-9 rounded-lg bg-gray-100 animate-pulse" />
            ) : user ? (
              user.role === 'master' ? (
                <>
                  <Link
                    href={ROUTES.MASTER_DASHBOARD}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5 text-gray-600" />
                    <span className="text-[11px] text-gray-600">대시보드</span>
                  </Link>
                  <Link
                    href={ROUTES.MASTER_RESERVATIONS}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="text-[11px] text-gray-600">예약관리</span>
                  </Link>
                  <Link
                    href={ROUTES.MASTER_CHAT}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    <span className="text-[11px] text-gray-600">채팅</span>
                  </Link>
                  <Link
                    href={ROUTES.MASTER_PROFILE}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-[11px] text-gray-600">{user.fullName}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                    <span className="text-[11px] text-gray-600">로그아웃</span>
                  </button>
                </>
              ) : user.role === 'admin' ? (
                <>
                  <Link
                    href={ROUTES.ADMIN_MASTERS_APPROVAL}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="text-[11px] text-gray-600">무속인 승인</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                    <span className="text-[11px] text-gray-600">로그아웃</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.USER_RESERVE}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="text-[11px] text-gray-600">예약하기</span>
                  </Link>
                  <Link
                    href={ROUTES.USER_RESERVATIONS}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="text-[11px] text-gray-600">내 예약</span>
                  </Link>
                  <Link
                    href={ROUTES.USER_CHAT}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    <span className="text-[11px] text-gray-600">채팅</span>
                  </Link>
                  <Link
                    href={ROUTES.USER_PROFILE}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-[11px] text-gray-600">{user.fullName}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                    <span className="text-[11px] text-gray-600">로그아웃</span>
                  </button>
                </>
              )
            ) : (
              <>
                <Link
                  href={ROUTES.LOGIN}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-[11px] text-gray-600">로그인</span>
                </Link>
                <Link
                  href={ROUTES.SIGNUP}
                  className="ml-2 px-5 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary/90 transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="메뉴"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {user ? (
              user.role === 'master' ? (
                <>
                  <Link
                    href={ROUTES.MASTER_DASHBOARD}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    대시보드
                  </Link>
                  <Link
                    href={ROUTES.MASTER_CALENDAR}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    예약 캘린더
                  </Link>
                  <Link
                    href={ROUTES.MASTER_RESERVATIONS}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    예약관리
                  </Link>
                  <Link
                    href={ROUTES.MASTER_SCHEDULE}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    영업시간 설정
                  </Link>
                  <Link
                    href={ROUTES.MASTER_MEMBERS}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    회원관리
                  </Link>
                  <Link
                    href={ROUTES.MASTER_JOIN_CODES}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    초대코드
                  </Link>
                  <Link
                    href={ROUTES.MASTER_CHAT}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    채팅
                  </Link>
                  <Link
                    href={ROUTES.MASTER_PROFILE}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    내 프로필
                  </Link>
                  <div className="h-px bg-gray-100 my-2" />
                  <div className="px-4 py-2 text-sm text-gray-500">
                    {user.fullName}님
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left"
                  >
                    로그아웃
                  </button>
                </>
              ) : user.role === 'admin' ? (
                <>
                  <Link
                    href={ROUTES.ADMIN_MASTERS_APPROVAL}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    무속인 승인
                  </Link>
                  <div className="h-px bg-gray-100 my-2" />
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.USER_RESERVE}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    예약하기
                  </Link>
                  <Link
                    href={ROUTES.USER_RESERVATIONS}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    내 예약
                  </Link>
                  <Link
                    href={ROUTES.USER_CHAT}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    채팅
                  </Link>
                  <Link
                    href={ROUTES.USER_PROFILE}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    내 프로필
                  </Link>
                  <div className="h-px bg-gray-100 my-2" />
                  <div className="px-4 py-2 text-sm text-gray-500">
                    {user.fullName}님
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left"
                  >
                    로그아웃
                  </button>
                </>
              )
            ) : (
              <>
                <div className="h-px bg-gray-100 my-2" />
                <Link
                  href={ROUTES.LOGIN}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  로그인
                </Link>
                <Link
                  href={ROUTES.SIGNUP}
                  className="mx-4 mt-2 py-3 bg-primary text-white text-sm font-semibold rounded-xl text-center hover:bg-primary/90 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
