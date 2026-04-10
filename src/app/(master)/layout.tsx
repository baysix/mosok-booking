'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { LogOut } from 'lucide-react';
import { MasterBottomTabBar } from '@/components/common/MasterBottomTabBar';

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 상단 심플 헤더 (모바일) */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex h-14 items-center justify-between px-4 max-w-lg mx-auto">
          <Link href={ROUTES.MASTER_DASHBOARD}>
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

      {/* 메인 컨텐츠 */}
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      {/* 하단 탭바 (모바일) */}
      <div className="lg:hidden">
        <MasterBottomTabBar />
      </div>
    </div>
  );
}
