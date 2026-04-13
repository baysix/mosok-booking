/**
 * 기원 관련 React Query 훅
 *
 * 기원 상품/주문 데이터 조회 및 변경을 위한 Query & Mutation 훅.
 * - useMyPrayerProducts: 마스터 상품 목록
 * - useAvailablePrayerProducts: 사용자용 상품 목록
 * - useMasterPrayerOrders / useMyPrayerOrders: 주문 목록
 * - useCreatePrayerProduct / useUpdatePrayerProduct / useDeletePrayerProduct
 * - useApplyPrayerOrder / useUpdateMasterPrayerOrderStatus
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyPrayerProducts,
  createPrayerProduct,
  updatePrayerProduct,
  deletePrayerProduct,
  getMasterPrayerOrders,
  createManualPrayerOrder,
  updateMasterPrayerOrderStatus,
  getAvailablePrayerProducts,
  getMyPrayerOrders,
  applyPrayerOrder,
} from '@/services/prayer.service';
import {
  PrayerOrderStatus,
  CreatePrayerProductData,
  UpdatePrayerProductData,
  CreatePrayerOrderData,
  CreateManualPrayerOrderData,
} from '@/types/prayer.types';

/** Query key 팩토리 */
export const prayerKeys = {
  all: ['prayer'] as const,
  products: ['prayer', 'products'] as const,
  myProducts: ['prayer', 'products', 'my'] as const,
  availableProducts: ['prayer', 'products', 'available'] as const,
  orders: ['prayer', 'orders'] as const,
  masterOrders: (status?: PrayerOrderStatus) => ['prayer', 'orders', 'master', status] as const,
  myOrders: (status?: PrayerOrderStatus) => ['prayer', 'orders', 'my', status] as const,
};

// ===== 마스터: 상품 관리 =====

/** 내 기원 상품 목록 조회 */
export function useMyPrayerProducts(enabled = true) {
  return useQuery({
    queryKey: prayerKeys.myProducts,
    queryFn: getMyPrayerProducts,
    enabled,
  });
}

/** 기원 상품 등록 */
export function useCreatePrayerProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePrayerProductData) => createPrayerProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prayerKeys.products });
    },
  });
}

/** 기원 상품 수정 */
export function useUpdatePrayerProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdatePrayerProductData & { id: string }) =>
      updatePrayerProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prayerKeys.products });
    },
  });
}

/** 기원 상품 삭제 */
export function useDeletePrayerProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePrayerProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prayerKeys.products });
    },
  });
}

// ===== 마스터: 주문 관리 =====

/** 마스터 기원 주문 목록 조회 */
export function useMasterPrayerOrders(status?: PrayerOrderStatus, enabled = true) {
  return useQuery({
    queryKey: prayerKeys.masterOrders(status),
    queryFn: () => getMasterPrayerOrders(status),
    enabled,
  });
}

/** 기원 수동 등록 (마스터 직접 등록) */
export function useCreateManualPrayerOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateManualPrayerOrderData) => createManualPrayerOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prayerKeys.orders });
    },
  });
}

/** 기원 주문 상태 변경 */
export function useUpdateMasterPrayerOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PrayerOrderStatus }) =>
      updateMasterPrayerOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prayerKeys.orders });
    },
  });
}

// ===== 사용자 =====

/** 이용 가능한 기원 상품 목록 조회 */
export function useAvailablePrayerProducts(enabled = true) {
  return useQuery({
    queryKey: prayerKeys.availableProducts,
    queryFn: getAvailablePrayerProducts,
    enabled,
  });
}

/** 내 기원 주문 목록 조회 */
export function useMyPrayerOrders(status?: PrayerOrderStatus, enabled = true) {
  return useQuery({
    queryKey: prayerKeys.myOrders(status),
    queryFn: () => getMyPrayerOrders(status),
    enabled,
  });
}

/** 기원 신청 (사용자 온라인 신청) */
export function useApplyPrayerOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePrayerOrderData) => applyPrayerOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prayerKeys.orders });
    },
  });
}
