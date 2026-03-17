import { createClient } from '@/lib/supabase/server';
import { mapNotificationRow } from '@/lib/supabase/mappers';
import { Notification, NotificationType } from '@/types/notification.types';

export async function getNotifications(userId: string, limit = 50): Promise<Notification[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(mapNotificationRow);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
}

export async function markAsRead(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  return !error;
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', userId)
    .eq('is_read', false);

  return !error;
}

export async function createNotification(data: {
  recipientId: string;
  masterId?: string;
  reservationId?: string;
  type: NotificationType;
  title: string;
  body?: string;
}): Promise<Notification> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from('notifications')
    .insert({
      recipient_id: data.recipientId,
      master_id: data.masterId || null,
      reservation_id: data.reservationId || null,
      type: data.type,
      title: data.title,
      body: data.body || '',
    })
    .select()
    .single();

  if (error || !row) throw error || new Error('알림 생성 실패');
  return mapNotificationRow(row);
}
