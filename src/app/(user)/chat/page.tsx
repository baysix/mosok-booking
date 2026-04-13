/**
 * 사용자 채팅 목록 페이지
 *
 * 무속인과의 채팅방 목록을 표시하는 사용자 페이지.
 * React Query로 채팅방 목록 조회, 공통 컴포넌트 사용.
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useChatRooms } from '@/hooks/queries';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import ChatRoomCard from '@/components/chat/ChatRoomCard';
import { MessageSquare } from 'lucide-react';

export default function UserChatPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // 인증 가드: 로그인하지 않은 경우 로그인 페이지로 이동
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const isReady = !authLoading && !!user;
  const { data: rooms = [], isLoading } = useChatRooms(isReady);

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-lg">
        {/* 헤더 */}
        <div className="px-4 py-4">
          <h1 className="text-lg font-bold text-gray-900">채팅</h1>
        </div>

        {/* 채팅방 목록 */}
        <div className="bg-white border-y border-gray-100">
          {isLoading ? (
            <div className="p-4">
              <ListSkeleton count={3} variant="card" />
            </div>
          ) : rooms.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="아직 채팅이 없습니다"
              description="무속인에게 문의하면 여기에 표시됩니다"
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {rooms.map((room) => (
                <ChatRoomCard key={room.id} room={room} basePath="/chat" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
