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
    <div className="flex h-dvh flex-col bg-gray-50">
      {/* 상단 심플 헤더 */}
      <header className="shrink-0 z-40 bg-white border-b border-gray-100">
        <div className="flex h-14 items-center justify-between px-4 max-w-lg mx-auto">
          <Link href={ROUTES.USER_HOME}>
            <span className="text-lg font-extrabold text-primary">무속</span>
          </Link>
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">{user.fullName}</span>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 (자체 스크롤) */}
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>

      {/* 하단 탭바 */}
      <BottomTabBar />
    </div>
  );
}
