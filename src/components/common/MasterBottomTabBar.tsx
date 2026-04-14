'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Calendar, MessageSquare, User } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const tabs = [
  { href: ROUTES.MASTER_DASHBOARD, label: '대시보드', icon: LayoutDashboard },
  { href: ROUTES.MASTER_CALENDAR, label: '캘린더', icon: CalendarDays },
  { href: ROUTES.MASTER_RESERVATIONS, label: '예약관리', icon: Calendar },
  { href: ROUTES.MASTER_CHAT, label: '채팅', icon: MessageSquare },
  { href: ROUTES.MASTER_MYPAGE, label: '내 정보', icon: User },
];

export function MasterBottomTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === ROUTES.MASTER_MYPAGE) {
      return (
        pathname === ROUTES.MASTER_MYPAGE ||
        pathname === ROUTES.MASTER_PROFILE ||
        pathname === ROUTES.MASTER_SCHEDULE ||
        pathname === ROUTES.MASTER_MEMBERS ||
        pathname === ROUTES.MASTER_JOIN_CODES ||
        pathname?.startsWith(`${ROUTES.MASTER_PROFILE}/`)
      );
    }
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <nav className="shrink-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 transition-colors ${
                active ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
