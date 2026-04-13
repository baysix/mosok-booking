'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import {
    LayoutDashboard,
    Calendar,
    CalendarDays,
    MessageSquare,
    User,
    LogOut,
    Users,
    KeyRound,
    History,
} from 'lucide-react';

interface SidebarProps {
    className?: string;
    onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    if (!user) return null;

    const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

    const userLinks = [
        { href: ROUTES.USER_RESERVE, label: '예약하기', icon: Calendar },
        { href: ROUTES.USER_RESERVATIONS, label: '내 예약', icon: History },
        { href: ROUTES.USER_CHAT, label: '채팅', icon: MessageSquare },
        { href: ROUTES.USER_PROFILE, label: '내 정보', icon: User },
    ];

    const masterLinks = [
        { href: ROUTES.MASTER_DASHBOARD, label: '대시보드', icon: LayoutDashboard },
        { href: ROUTES.MASTER_CALENDAR, label: '예약 캘린더', icon: CalendarDays },
        { href: ROUTES.MASTER_RESERVATIONS, label: '예약 관리', icon: Calendar },
        { href: ROUTES.MASTER_SCHEDULE, label: '영업시간 설정', icon: History },
        { href: ROUTES.MASTER_MEMBERS, label: '회원 관리', icon: Users },
        { href: ROUTES.MASTER_JOIN_CODES, label: '초대코드', icon: KeyRound },
        { href: ROUTES.MASTER_CHAT, label: '채팅', icon: MessageSquare },
        { href: ROUTES.MASTER_PROFILE, label: '내 점집', icon: User },
    ];

    const adminLinks = [
        { href: ROUTES.ADMIN_MASTERS_APPROVAL, label: '무속인 승인', icon: Users },
    ];

    let links: { href: string; label: string; icon: any }[] = [];

    if (user.role === 'user') {
        links = [...userLinks];
    } else if (user.role === 'master') {
        links = [...masterLinks];
    } else if (user.role === 'admin') {
        links = [...adminLinks];
    }

    return (
        <div className={cn("pb-12 min-h-screen bg-card border-r w-64 flex flex-col", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <Link href={ROUTES.HOME} className="flex items-center pl-2 mb-9">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                            무속 예약
                        </span>
                    </Link>
                    <div className="space-y-1">
                        {links.map((link) => (
                            <Button
                                key={link.href}
                                variant={isActive(link.href) ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    isActive(link.href) && "bg-secondary/50 font-medium"
                                )}
                                asChild
                                onClick={onClose}
                            >
                                <Link href={link.href}>
                                    <link.icon className="mr-2 h-4 w-4" />
                                    {link.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-auto px-3 py-4 border-t">
                <Link
                    href={user.role === 'master' ? ROUTES.MASTER_PROFILE : ROUTES.USER_PROFILE}
                    onClick={onClose}
                    className="flex items-center gap-3 px-2 mb-4 rounded-lg hover:bg-gray-50 py-2 transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.fullName?.[0] || 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">내 정보</p>
                    </div>
                </Link>
                <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={() => {
                    logout();
                    onClose?.();
                }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                </Button>
            </div>
        </div>
    );
}
