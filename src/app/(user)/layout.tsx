'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { LogOut } from 'lucide-react';
import { BottomTabBar } from '@/components/common/BottomTabBar';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* 상단 심플 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex h-14 items-center justify-between px-4 max-w-lg mx-auto">
          <Link href={ROUTES.USER_HOME}>
            <span className="text-lg font-extrabold text-primary">무속</span>
          </Link>
          {user && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs">로그아웃</span>
            </button>
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 pb-20">{children}</main>

      {/* 하단 탭바 */}
      <BottomTabBar />
    </div>
  );
}
