// ===== 타입 =====

export type PrayerOrderStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type PrayerOrderSource = 'online' | 'manual';

// ===== 상수 =====

export const PRAYER_CATEGORY_PRESETS = ['등', '초'] as const;

export const PRAYER_DURATION_PRESETS: { days: number; label: string }[] = [
  { days: 30, label: '한달' },
  { days: 365, label: '1년' },
];

export const PRAYER_DURATIONS: { days: number; label: string }[] = [
  { days: 30, label: '한달' },
  { days: 49, label: '49일' },
  { days: 100, label: '100일' },
  { days: 365, label: '1년' },
];

export const PRAYER_ORDER_STATUS_LABELS: Record<PrayerOrderStatus, string> = {
  pending: '대기',
  active: '진행 중',
  completed: '기원 완료',
  cancelled: '취소',
};

export const PRAYER_ORDER_STATUS_COLORS: Record<PrayerOrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

// ===== 인터페이스 =====

export interface PrayerProductOption {
  id: string;
  productId: string;
  durationDays: number;
  price: number;
  isActive: boolean;
  createdAt: string;
}

export interface PrayerProduct {
  id: string;
  masterId: string;
  category: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  options: PrayerProductOption[];
}

export interface PrayerOrder {
  id: string;
  masterId: string;
  userId: string | null;
  productId: string;
  optionId: string | null;
  category: string;
  productName: string;
  durationDays: number;
  price: number;
  beneficiaryName: string;
  wishText: string;
  startDate: string;
  endDate: string;
  status: PrayerOrderStatus;
  source: PrayerOrderSource;
  manualCustomerName?: string;
  manualCustomerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerOrderWithUser extends PrayerOrder {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  } | null;
}

// ===== DTO =====

export interface CreatePrayerProductData {
  category?: string;
  name: string;
  description?: string;
  options: { durationDays: number; price: number }[];
}

export interface UpdatePrayerProductData {
  category?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  options?: { durationDays: number; price: number; isActive?: boolean }[];
}

export interface CreatePrayerOrderData {
  productId: string;
  optionId: string;
  beneficiaryName: string;
  wishText?: string;
  startDate: string;
}

export interface CreateManualPrayerOrderData {
  productId: string;
  optionId: string;
  beneficiaryName: string;
  wishText?: string;
  startDate: string;
  customerName: string;
  customerPhone?: string;
  userId?: string;
}

// ===== 헬퍼 =====

export function calculateEndDate(startDate: string, durationDays: number): string {
  const start = new Date(startDate);
  start.setDate(start.getDate() + durationDays - 1);
  return start.toISOString().split('T')[0];
}

export function getRemainingDays(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getProgressPercent(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (now >= end) return 100;
  if (now <= start) return 0;
  return Math.round(((now - start) / (end - start)) * 100);
}

export function getDurationLabel(durationDays: number): string {
  const found = PRAYER_DURATIONS.find((d) => d.days === durationDays);
  return found?.label ?? `${durationDays}일`;
}
