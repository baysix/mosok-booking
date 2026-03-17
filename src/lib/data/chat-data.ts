import { createClient } from '@/lib/supabase/server';
import { mapChatRoomRow, mapMessageRow } from '@/lib/supabase/mappers';
import { ChatRoom, Message } from '@/types/chat.types';

export async function findRoomById(roomId: string): Promise<ChatRoom | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error || !data) return undefined;

  const { data: master } = await supabase
    .from('masters')
    .select('user_id')
    .eq('id', data.master_id)
    .single();

  const participants = [data.user_id];
  if (master) participants.push(master.user_id);

  return mapChatRoomRow({ ...data, participants });
}

export async function getRoomsByUserId(userId: string): Promise<ChatRoom[]> {
  const supabase = createClient();

  const { data: masterProfile } = await supabase
    .from('masters')
    .select('id, user_id')
    .eq('user_id', userId)
    .single();

  let orCondition = `user_id.eq.${userId}`;
  if (masterProfile) {
    orCondition += `,master_id.eq.${masterProfile.id}`;
  }

  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .or(orCondition)
    .order('last_message_at', { ascending: false });

  if (error || !data) return [];

  const masterIds = [...new Set(data.map((r) => r.master_id))];
  const { data: masters } = await supabase
    .from('masters')
    .select('id, user_id')
    .in('id', masterIds);

  const masterUserMap = new Map<string, string>();
  masters?.forEach((m) => masterUserMap.set(m.id, m.user_id));

  return data.map((row) =>
    mapChatRoomRow({
      ...row,
      participants: [row.user_id, masterUserMap.get(row.master_id) || ''].filter(Boolean),
    })
  );
}

export async function findExistingRoom(userId: string, masterId: string): Promise<ChatRoom | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('user_id', userId)
    .eq('master_id', masterId)
    .single();

  if (error || !data) return undefined;

  const { data: master } = await supabase
    .from('masters')
    .select('user_id')
    .eq('id', data.master_id)
    .single();

  const participants = [data.user_id];
  if (master) participants.push(master.user_id);

  return mapChatRoomRow({ ...data, participants });
}

export async function createRoom(userId: string, masterId: string, masterUserId: string): Promise<ChatRoom> {
  const existing = await findExistingRoom(userId, masterId);
  if (existing) return existing;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('chat_rooms')
    .insert({
      user_id: userId,
      master_id: masterId,
    })
    .select()
    .single();

  if (error || !data) throw error || new Error('채팅방 생성 실패');
  return mapChatRoomRow({ ...data, participants: [userId, masterUserId] });
}

export async function getMessagesByRoomId(roomId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data.map(mapMessageRow);
}

export async function addMessage(roomId: string, senderId: string, content: string): Promise<Message> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('messages')
    .insert({
      room_id: roomId,
      sender_id: senderId,
      content,
      type: 'text',
    })
    .select()
    .single();

  if (error || !data) throw error || new Error('메시지 전송 실패');

  await supabase
    .from('chat_rooms')
    .update({
      last_message: content,
      last_message_at: data.created_at,
    })
    .eq('id', roomId);

  return mapMessageRow(data);
}

export async function markMessagesAsRead(roomId: string, userId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('room_id', roomId)
    .neq('sender_id', userId)
    .eq('is_read', false);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { data: masterProfile } = await supabase
    .from('masters')
    .select('id')
    .eq('user_id', userId)
    .single();

  let orCondition = `user_id.eq.${userId}`;
  if (masterProfile) {
    orCondition += `,master_id.eq.${masterProfile.id}`;
  }

  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select('id')
    .or(orCondition);

  if (!rooms || rooms.length === 0) return 0;

  const roomIds = rooms.map((r) => r.id);

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('room_id', roomIds)
    .neq('sender_id', userId)
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
}

export async function getUnreadCountByRoom(roomId: string, userId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId)
    .neq('sender_id', userId)
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
}
