/**
 * 기원 서비스
 *
 * 기원 상품 및 주문 관련 API 호출을 담당하는 서비스 레이어.
 * - 마스터: 상품 CRUD, 주문 관리
 * - 사용자: 상품 조회, 기원 신청, 내 기원 조회
 */
import { apiClient } from '@/lib/api-client';
import {
  PrayerProduct,
  PrayerOrder,
  PrayerOrderWithUser,
  PrayerOrderStatus,
  CreatePrayerProductData,
  UpdatePrayerProductData,
  CreatePrayerOrderData,
  CreateManualPrayerOrderData,
} from '@/types/prayer.types';

// ===== 마스터: 상품 관리 =====

/** 내 기원 상품 목록 조회 */
export async function getMyPrayerProducts(): Promise<PrayerProduct[]> {
  const data = await apiClient.get<{ products: PrayerProduct[] }>('/api/masters/me/prayer-products');
  return data.products;
}

/** 기원 상품 등록 */
export async function createPrayerProduct(body: CreatePrayerProductData): Promise<PrayerProduct> {
  const data = await apiClient.post<{ product: PrayerProduct }>('/api/masters/me/prayer-products', body);
  return data.product;
}

/** 기원 상품 수정 */
export async function updatePrayerProduct(id: string, body: UpdatePrayerProductData): Promise<PrayerProduct> {
  const data = await apiClient.patch<{ product: PrayerProduct }>(`/api/masters/me/prayer-products/${id}`, body);
  return data.product;
}

/** 기원 상품 삭제 */
export async function deletePrayerProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/masters/me/prayer-products/${id}`);
}

// ===== 마스터: 주문 관리 =====

/** 마스터 기원 주문 목록 조회 */
export async function getMasterPrayerOrders(status?: PrayerOrderStatus): Promise<PrayerOrderWithUser[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  const data = await apiClient.get<{ orders: PrayerOrderWithUser[] }>(`/api/masters/me/prayer-orders?${params}`);
  return data.orders;
}

/** 기원 수동 등록 (마스터가 직접 등록) */
export async function createManualPrayerOrder(body: CreateManualPrayerOrderData): Promise<PrayerOrder> {
  const data = await apiClient.post<{ order: PrayerOrder }>('/api/masters/me/prayer-orders', body);
  return data.order;
}

/** 기원 주문 상태 변경 */
export async function updateMasterPrayerOrderStatus(id: string, status: PrayerOrderStatus): Promise<PrayerOrder> {
  const data = await apiClient.patch<{ order: PrayerOrder }>(`/api/masters/me/prayer-orders/${id}`, { status });
  return data.order;
}

// ===== 사용자 =====

/** 이용 가능한 기원 상품 목록 조회 */
export async function getAvailablePrayerProducts(): Promise<PrayerProduct[]> {
  const data = await apiClient.get<{ products: PrayerProduct[] }>('/api/prayer-products');
  return data.products;
}

/** 내 기원 주문 목록 조회 */
export async function getMyPrayerOrders(status?: PrayerOrderStatus): Promise<PrayerOrder[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  const data = await apiClient.get<{ orders: PrayerOrder[] }>(`/api/prayer-orders?${params}`);
  return data.orders;
}

/** 기원 신청 (사용자 온라인 신청) */
export async function applyPrayerOrder(body: CreatePrayerOrderData): Promise<PrayerOrder> {
  const data = await apiClient.post<{ order: PrayerOrder }>('/api/prayer-orders', body);
  return data.order;
}
