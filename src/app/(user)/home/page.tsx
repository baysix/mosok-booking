'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Calendar } from 'lucide-react';
import { MasterProfile } from '@/types/master.types';
import { MasterDetailView } from '@/components/master/MasterDetailView';

export default function UserHomePage() {
  const { user, isLoading: authLoading, hasMembership } = useAuth();
  const router = useRouter();
  const [master, setMaster] = useState<(MasterProfile & { user?: { fullName: string } }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (!hasMembership) {
      router.push(ROUTES.JOIN);
      return;
    }

    fetch('/api/masters/my-master')
      .then((res) => res.json())
      .then((data) => {
        if (data.master) setMaster(data.master);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading, hasMembership, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!master) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-sm text-gray-500">무속인 정보를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <MasterDetailView
      master={master}
      hasBottomTab
      action={
        <button
          onClick={() => router.push(ROUTES.USER_RESERVE)}
          className="w-full h-12 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <Calendar className="w-5 h-5" />
          예약하기
        </button>
      }
    />
  );
}
