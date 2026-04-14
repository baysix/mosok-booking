/**
 * 채팅 관련 React Query 훅
 *
 * 채팅방 목록, 메시지 조회(폴링), 메시지 전송을 위한 훅.
 * - useChatRooms: 채팅방 목록 (자동 refetch 없음)
 * - useChatMessages: 메시지 목록 (5초 폴링)
 * - useSendMessage: 메시지 전송 후 메시지 캐시 무효화
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChatRooms,
  getOrCreateRoom,
  getMessages,
  sendMessage,
  getUnreadCount,
} from '@/services/chat.service';

/** Query key 팩토리 */
export const chatKeys = {
  all: ['chat'] as const,
  rooms: ['chat', 'rooms'] as const,
  messages: (roomId: string) => ['chat', 'messages', roomId] as const,
  unread: ['chat', 'unread'] as const,
};

/** 채팅방 목록 조회 */
export function useChatRooms(enabled = true) {
  return useQuery({
    queryKey: chatKeys.rooms,
    queryFn: getChatRooms,
    enabled,
  });
}

/**
 * 채팅 메시지 목록 초기 조회
 * 실시간 업데이트는 Supabase Realtime 구독으로 처리 (채팅방 페이지 참조)
 */
export function useChatMessages(roomId: string, enabled = true) {
  return useQuery({
    queryKey: chatKeys.messages(roomId),
    queryFn: () => getMessages(roomId),
    enabled: enabled && !!roomId,
  });
}

/** 읽지 않은 메시지 수 조회 */
export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: chatKeys.unread,
    queryFn: getUnreadCount,
    enabled,
  });
}

/** 채팅방 생성 또는 기존 채팅방 조회 */
export function useGetOrCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (masterId: string) => getOrCreateRoom(masterId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKeys.rooms });
    },
  });
}

/** 메시지 전송 */
export function useSendMessage(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(roomId, content),
    onSuccess: () => {
      // 해당 채팅방 메시지 + 채팅방 목록 갱신
      qc.invalidateQueries({ queryKey: chatKeys.messages(roomId) });
      qc.invalidateQueries({ queryKey: chatKeys.rooms });
      qc.invalidateQueries({ queryKey: chatKeys.unread });
    },
  });
}
