'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface TopBarProps {
    onMenuClick: () => void;
    className?: string;
}

export function TopBar({ onMenuClick, className }: TopBarProps) {
    const { user } = useAuth();

    return (
        <header className={cn("h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 justify-between sticky top-0 z-50 md:hidden", className)}>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
                <span className="font-semibold text-lg">메뉴</span>
            </div>

            {/* Additional top bar items like notifications could go here */}
        </header>
    );
}
