'use client';

import Link from 'next/link';
import { ChatRoomWithParticipant } from '@/types/chat.types';

interface ChatRoomCardProps {
  room: ChatRoomWithParticipant;
  basePath?: string;
}

function formatTime(isoStr: string): string {
  const date = new Date(isoStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

export default function ChatRoomCard({ room, basePath = '/chat' }: ChatRoomCardProps) {
  const { otherUser } = room;
  const displayName = otherUser.businessName || otherUser.fullName;

  return (
    <Link
      href={`${basePath}/${room.id}`}
      className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
        {otherUser.images && otherUser.images.length > 0 ? (
          <img
            src={otherUser.images[0]}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : otherUser.avatarUrl ? (
          <img
            src={otherUser.avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
            {displayName[0]}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="font-bold text-gray-900 text-sm truncate">{displayName}</h3>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
            {room.lastMessageAt ? formatTime(room.lastMessageAt) : ''}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 truncate">
            {room.lastMessage || '새로운 대화를 시작하세요'}
          </p>
          {room.unreadCount > 0 && (
            <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-primary text-white text-xs font-bold rounded-full">
              {room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
