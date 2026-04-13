/**
 * 알림 서비스
 *
 * 알림 조회 및 읽음 처리 관련 API 호출을 담당하는 서비스 레이어.
 */
import { apiClient } from '@/lib/api-client';
import { Notification } from '@/types/notification.types';

/** 알림 목록 조회 (읽지 않은 수 포함) */
export async function getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
  return apiClient.get('/api/notifications');
}

/** 읽지 않은 알림 수 조회 (에러 시 0 반환) */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const data = await getNotifications();
    return data.unreadCount;
  } catch {
    return 0;
  }
}

/** 알림 읽음 처리 */
export async function markNotificationAsRead(id: string): Promise<void> {
  await apiClient.patch(`/api/notifications/${id}`);
}

/** 전체 알림 읽음 처리 */
export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.patch('/api/notifications/read-all');
}
