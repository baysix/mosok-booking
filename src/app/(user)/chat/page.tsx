'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getChatRooms } from '@/services/chat.service';
import { ChatRoomWithParticipant } from '@/types/chat.types';
import ChatRoomCard from '@/components/chat/ChatRoomCard';
import { MessageSquare } from 'lucide-react';

export default function UserChatPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [rooms, setRooms] = useState<ChatRoomWithParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    try {
      const data = await getChatRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) fetchRooms();
  }, [user, isLoading, router, fetchRooms]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-lg">
        {/* Header */}
        <div className="px-4 py-4">
          <h1 className="text-lg font-bold text-gray-900">채팅</h1>
        </div>

        {/* Room list */}
        <div className="bg-white border-y border-gray-100">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-100 rounded mb-2" />
                    <div className="h-3 w-40 bg-gray-50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <MessageSquare className="w-12 h-12 mb-3 text-gray-200" />
              <p className="text-sm font-medium">아직 채팅이 없습니다</p>
              <p className="text-xs mt-1">무속인에게 문의하면 여기에 표시됩니다</p>
            </div>
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
