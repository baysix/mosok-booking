/**
 * 채팅 서비스
 *
 * 채팅방 및 메시지 관련 API 호출을 담당하는 서비스 레이어.
 */
import { apiClient } from '@/lib/api-client';
import { ChatRoomWithParticipant, ChatRoom, Message } from '@/types/chat.types';

/** 채팅방 목록 조회 */
export async function getChatRooms(): Promise<ChatRoomWithParticipant[]> {
  const data = await apiClient.get<{ rooms: ChatRoomWithParticipant[] }>('/api/chat/rooms');
  return data.rooms;
}

/** 채팅방 생성 또는 기존 채팅방 조회 */
export async function getOrCreateRoom(masterId: string): Promise<ChatRoom> {
  const data = await apiClient.post<{ room: ChatRoom }>('/api/chat/rooms', { masterId });
  return data.room;
}

/** 채팅 메시지 목록 조회 */
export async function getMessages(roomId: string): Promise<Message[]> {
  const data = await apiClient.get<{ messages: Message[] }>(`/api/chat/rooms/${roomId}/messages`);
  return data.messages;
}

/** 메시지 전송 */
export async function sendMessage(roomId: string, content: string): Promise<Message> {
  const data = await apiClient.post<{ message: Message }>(`/api/chat/rooms/${roomId}/messages`, { content });
  return data.message;
}

/** 읽지 않은 메시지 수 조회 (에러 시 0 반환) */
export async function getUnreadCount(): Promise<number> {
  try {
    const data = await apiClient.get<{ count: number }>('/api/chat/unread');
    return data.count;
  } catch {
    return 0;
  }
}
