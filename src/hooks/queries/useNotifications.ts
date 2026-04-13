/**
 * 알림 관련 React Query 훅
 *
 * 알림 목록 조회, 읽음 처리, 전체 읽음을 위한 Query & Mutation 훅.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/services/notification.service';

/** Query key 팩토리 */
export const notificationKeys = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
};

/** 알림 목록 조회 (읽지 않은 수 포함) */
export function useNotificationsList(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.list,
    queryFn: getNotifications,
    enabled,
  });
}

/** 알림 읽음 처리 */
export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/** 전체 알림 읽음 처리 */
export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
