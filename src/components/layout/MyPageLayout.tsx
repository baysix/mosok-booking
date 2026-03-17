'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, MessageSquare, User, ChevronRight, LayoutDashboard, History, Users, KeyRound } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

const USER_MENU = [
  { href: ROUTES.USER_RESERVE, label: '예약하기', icon: Calendar },
  { href: ROUTES.USER_RESERVATIONS, label: '내 예약', icon: History },
  { href: ROUTES.USER_CHAT, label: '채팅', icon: MessageSquare },
  { href: ROUTES.USER_PROFILE, label: '내 정보 관리', icon: User },
];

const MASTER_MENU = [
  { href: ROUTES.MASTER_DASHBOARD, label: '대시보드', icon: LayoutDashboard },
  { href: ROUTES.MASTER_RESERVATIONS, label: '예약 관리', icon: Calendar },
  { href: ROUTES.MASTER_SCHEDULE, label: '일정 관리', icon: History },
  { href: ROUTES.MASTER_MEMBERS, label: '회원 관리', icon: Users },
  { href: ROUTES.MASTER_JOIN_CODES, label: '초대코드', icon: KeyRound },
  { href: ROUTES.MASTER_PROFILE, label: '내 프로필', icon: User },
];

interface MyPageLayoutProps {
  children: React.ReactNode;
}

export function MyPageLayout({ children }: MyPageLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  const menuItems = user?.role === 'master' ? MASTER_MENU : USER_MENU;

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile horizontal tab nav */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide px-4 gap-1"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                ref={active ? activeRef : undefined}
                className={`flex items-center gap-1.5 px-3.5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                  active
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <nav className="sticky top-24 border border-gray-100 rounded-2xl overflow-hidden">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-5 py-4 text-sm font-medium transition-colors border-b border-gray-100 last:border-b-0 ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/5'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className={`w-4 h-4 ${isActive(item.href) ? 'text-primary' : 'text-gray-300'}`} />
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 max-w-3xl">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
