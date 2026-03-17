import { Notification } from '@/types/notification.types';

export async function getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const response = await fetch('/api/notifications');
  if (!response.ok) {
    throw new Error('알림을 불러오는데 실패했습니다');
  }
  return response.json();
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const data = await getNotifications();
    return data.unreadCount;
  } catch {
    return 0;
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const response = await fetch(`/api/notifications/${id}`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('알림 읽음 처리에 실패했습니다');
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const response = await fetch('/api/notifications/read-all', {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('전체 알림 읽음 처리에 실패했습니다');
  }
}
