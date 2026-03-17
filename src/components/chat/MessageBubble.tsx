'use client';

import { Message } from '@/types/chat.types';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

function formatTime(isoStr: string): string {
  const date = new Date(isoStr);
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  const period = h < 12 ? '오전' : '오후';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${hour}:${m}`;
}

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`flex items-end gap-1.5 max-w-[75%] ${isMine ? 'flex-row-reverse' : ''}`}>
        {/* Bubble */}
        <div
          className={`
            px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words
            ${isMine
              ? 'bg-primary text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
            }
          `}
        >
          {message.content}
        </div>

        {/* Time + Read */}
        <div className={`flex flex-col items-${isMine ? 'end' : 'start'} gap-0.5 flex-shrink-0`}>
          {isMine && message.isRead && (
            <span className="text-[10px] text-primary">읽음</span>
          )}
          <span className="text-[10px] text-gray-300">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
