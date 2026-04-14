'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGetOrCreateRoom } from '@/hooks/queries/useChat';
import { ROUTES } from '@/constants/routes';
import { Calendar, MessageCircle } from 'lucide-react';
import { MasterProfile } from '@/types/master.types';
import { MasterDetailView } from '@/components/master/MasterDetailView';

export default function UserHomePage() {
  const { user, isLoading: authLoading, hasMembership } = useAuth();
  const router = useRouter();
  const [master, setMaster] = useState<(MasterProfile & { user?: { fullName: string } }) | null>(null);
  const [loading, setLoading] = useState(true);
  const getOrCreateRoom = useGetOrCreateRoom();

  const handleChat = async () => {
    if (!master) return;
    try {
      const room = await getOrCreateRoom.mutateAsync(master.id);
      router.push(`/chat/${room.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '채팅방을 열 수 없습니다');
    }
  };

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
        <div className="flex gap-2">
          <button
            onClick={handleChat}
            disabled={getOrCreateRoom.isPending}
            aria-label="채팅하기"
            className="shrink-0 w-12 h-12 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push(ROUTES.USER_RESERVE)}
            className="flex-1 h-12 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <Calendar className="w-5 h-5" />
            예약하기
          </button>
        </div>
      }
    />
  );
}
