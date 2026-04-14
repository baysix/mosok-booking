'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getMessages, sendMessage, getChatRooms } from '@/services/chat.service';
import { Message, ChatRoomWithParticipant } from '@/types/chat.types';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase/client';
import { mapMessageRow } from '@/lib/supabase/mappers';

export default function UserChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const roomId = params.roomId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [room, setRoom] = useState<ChatRoomWithParticipant | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const data = await getMessages(roomId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [roomId]);

  const fetchRoom = useCallback(async () => {
    try {
      const rooms = await getChatRooms();
      const found = rooms.find((r) => r.id === roomId);
      if (found) setRoom(found);
    } catch (error) {
      console.error('Failed to fetch room:', error);
    }
  }, [roomId]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      Promise.all([fetchMessages(), fetchRoom()]).then(() => setLoading(false));
    }
  }, [user, isLoading, router, fetchMessages, fetchRoom]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Supabase Realtime — messages INSERT 구독 (폴링 대체)
  useEffect(() => {
    if (!roomId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = mapMessageRow(payload.new as Parameters<typeof mapMessageRow>[0]);
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const handleSend = async (content: string) => {
    if (sending) return;
    setSending(true);
    try {
      const newMsg = await sendMessage(roomId, content);
      setMessages((prev) => [...prev, newMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (isLoading || !user) return null;

  const displayName = room?.otherUser?.businessName || room?.otherUser?.fullName || '채팅';

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat header */}
      <div className="shrink-0 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 h-14 px-4 max-w-lg mx-auto">
          <Link
            href={ROUTES.USER_CHAT}
            className="p-1 -ml-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {room?.otherUser && (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {room.otherUser.images && room.otherUser.images.length > 0 ? (
                  <img
                    src={room.otherUser.images[0]}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : room.otherUser.avatarUrl ? (
                  <img
                    src={room.otherUser.avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                    {displayName[0]}
                  </div>
                )}
              </div>
            )}
            <h1 className="font-bold text-gray-900 text-sm truncate">{displayName}</h1>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            대화를 시작하세요
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} isMine={msg.senderId === user.id} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 max-w-lg mx-auto w-full">
        <ChatInput onSend={handleSend} disabled={sending} />
      </div>
    </div>
  );
}
