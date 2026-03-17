export type NotificationType =
  | 'reservation_requested'
  | 'reservation_confirmed'
  | 'reservation_rejected'
  | 'reservation_cancelled'
  | 'reservation_completed'
  | 'membership_approved';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  reservation_requested: '예약 요청',
  reservation_confirmed: '예약 확정',
  reservation_rejected: '예약 거절',
  reservation_cancelled: '예약 취소',
  reservation_completed: '상담 완료',
  membership_approved: '가입 승인',
};

export interface Notification {
  id: string;
  recipientId: string;
  masterId: string | null;
  reservationId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}
