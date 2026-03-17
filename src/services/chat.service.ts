import { ChatRoomWithParticipant, ChatRoom, Message } from '@/types/chat.types';

export async function getChatRooms(): Promise<ChatRoomWithParticipant[]> {
  const response = await fetch('/api/chat/rooms');
  if (!response.ok) {
    throw new Error('채팅방 목록을 불러오는데 실패했습니다');
  }
  const data = await response.json();
  return data.rooms;
}

export async function getOrCreateRoom(masterId: string): Promise<ChatRoom> {
  const response = await fetch('/api/chat/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ masterId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '채팅방 생성에 실패했습니다');
  }
  const data = await response.json();
  return data.room;
}

export async function getMessages(roomId: string): Promise<Message[]> {
  const response = await fetch(`/api/chat/rooms/${roomId}/messages`);
  if (!response.ok) {
    throw new Error('메시지를 불러오는데 실패했습니다');
  }
  const data = await response.json();
  return data.messages;
}

export async function sendMessage(roomId: string, content: string): Promise<Message> {
  const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '메시지 전송에 실패했습니다');
  }
  const data = await response.json();
  return data.message;
}

export async function getUnreadCount(): Promise<number> {
  const response = await fetch('/api/chat/unread');
  if (!response.ok) return 0;
  const data = await response.json();
  return data.count;
}
