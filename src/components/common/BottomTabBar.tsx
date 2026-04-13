'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Flame, MessageSquare, User } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const tabs = [
  { href: ROUTES.USER_HOME, label: '홈', icon: Home },
  { href: ROUTES.USER_RESERVATIONS, label: '예약내역', icon: Calendar },
  { href: ROUTES.USER_PRAYER, label: '기원', icon: Flame },
  { href: ROUTES.USER_CHAT, label: '채팅', icon: MessageSquare },
  { href: ROUTES.USER_PROFILE, label: '프로필', icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === ROUTES.USER_HOME) {
      return pathname === '/home' || pathname === '/reserve';
    }
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
                active ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
