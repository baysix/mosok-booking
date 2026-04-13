import {
  PrayerProduct,
  PrayerOrder,
  PrayerOrderWithUser,
  PrayerOrderStatus,
  CreatePrayerProductData,
  CreatePrayerOrderData,
  CreateManualPrayerOrderData,
} from '@/types/prayer.types';

// ===== MASTER: Products =====

export async function getMyPrayerProducts(): Promise<PrayerProduct[]> {
  const response = await fetch('/api/masters/me/prayer-products');
  if (!response.ok) throw new Error('기원 상품 목록을 불러오는데 실패했습니다');
  const data = await response.json();
  return data.products;
}

export async function createPrayerProduct(data: CreatePrayerProductData): Promise<PrayerProduct> {
  const response = await fetch('/api/masters/me/prayer-products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '기원 상품 등록에 실패했습니다');
  }
  const result = await response.json();
  return result.product;
}

export async function updatePrayerProduct(
  id: string,
  data: { category?: string; name?: string; description?: string; isActive?: boolean; options?: { durationDays: number; price: number }[] }
): Promise<PrayerProduct> {
  const response = await fetch(`/api/masters/me/prayer-products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '기원 상품 수정에 실패했습니다');
  }
  const result = await response.json();
  return result.product;
}

export async function deletePrayerProduct(id: string): Promise<void> {
  const response = await fetch(`/api/masters/me/prayer-products/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '기원 상품 삭제에 실패했습니다');
  }
}

// ===== MASTER: Orders =====

export async function getMasterPrayerOrders(
  status?: PrayerOrderStatus
): Promise<PrayerOrderWithUser[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);

  const response = await fetch(`/api/masters/me/prayer-orders?${params.toString()}`);
  if (!response.ok) throw new Error('기원 주문 목록을 불러오는데 실패했습니다');
  const data = await response.json();
  return data.orders;
}

export async function createManualPrayerOrder(
  data: CreateManualPrayerOrderData
): Promise<PrayerOrder> {
  const response = await fetch('/api/masters/me/prayer-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '기원 수동 등록에 실패했습니다');
  }
  const result = await response.json();
  return result.order;
}

export async function updateMasterPrayerOrderStatus(
  id: string,
  status: PrayerOrderStatus
): Promise<PrayerOrder> {
  const response = await fetch(`/api/masters/me/prayer-orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '기원 상태 변경에 실패했습니다');
  }
  const result = await response.json();
  return result.order;
}

// ===== USER =====

export async function getAvailablePrayerProducts(): Promise<PrayerProduct[]> {
  const response = await fetch('/api/prayer-products');
  if (!response.ok) throw new Error('기원 서비스 목록을 불러오는데 실패했습니다');
  const data = await response.json();
  return data.products;
}

export async function getMyPrayerOrders(status?: PrayerOrderStatus): Promise<PrayerOrder[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);

  const response = await fetch(`/api/prayer-orders?${params.toString()}`);
  if (!response.ok) throw new Error('내 기원 목록을 불러오는데 실패했습니다');
  const data = await response.json();
  return data.orders;
}

export async function applyPrayerOrder(data: CreatePrayerOrderData): Promise<PrayerOrder> {
  const response = await fetch('/api/prayer-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '기원 신청에 실패했습니다');
  }
  const result = await response.json();
  return result.order;
}
