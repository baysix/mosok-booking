/**
 * 예약 서비스
 *
 * 예약 관련 API 호출을 담당하는 서비스 레이어.
 * - 사용자: 내 예약 조회, 예약 생성
 * - 마스터: 전체 예약 조회, 캘린더, 일별 예약, 수동 예약
 */
import { apiClient } from '@/lib/api-client';
import {
  Reservation,
  ReservationWithUser,
  ReservationStatus,
  CreateReservationData,
  CreateManualReservationData,
  UpdateReservationStatusData,
  CalendarDayData,
  DashboardSummary,
} from '@/types/reservation.types';

// ===== 공통 =====

/** 내 예약 목록 조회 (사용자용) */
export async function getMyReservations(status?: ReservationStatus): Promise<Reservation[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  const data = await apiClient.get<{ reservations: Reservation[] }>(`/api/reservations?${params}`);
  return data.reservations;
}

/** 마스터 예약 목록 조회 (마스터용, 고객 정보 포함) */
export async function getMasterReservations(status?: ReservationStatus): Promise<ReservationWithUser[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  const data = await apiClient.get<{ reservations: ReservationWithUser[] }>(`/api/reservations?${params}`);
  return data.reservations;
}

/** 예약 상세 조회 */
export async function getReservationById(id: string): Promise<Reservation> {
  const data = await apiClient.get<{ reservation: Reservation }>(`/api/reservations/${id}`);
  return data.reservation;
}

/** 예약 생성 (사용자 온라인 예약) */
export async function createReservation(body: CreateReservationData): Promise<Reservation> {
  const data = await apiClient.post<{ reservation: Reservation }>('/api/reservations', body);
  return data.reservation;
}

/** 예약 상태 변경 (승인/거절/완료/취소) */
export async function updateReservationStatus(id: string, body: UpdateReservationStatusData): Promise<Reservation> {
  const data = await apiClient.patch<{ reservation: Reservation }>(`/api/reservations/${id}`, body);
  return data.reservation;
}

/** 예약 가능 시간 조회 */
export async function getAvailableSlots(masterId: string, date: string): Promise<{ time: string; available: boolean }[]> {
  const params = new URLSearchParams({ masterId, date });
  const data = await apiClient.get<{ slots: { time: string; available: boolean }[] }>(`/api/reservations/available-slots?${params}`);
  return data.slots;
}

// ===== 마스터 전용 =====

/** 캘린더 데이터 조회 (월별 요약 + 통계) */
export async function getCalendarData(year: number, month: number): Promise<{ days: CalendarDayData[]; summary: DashboardSummary }> {
  const params = new URLSearchParams({ year: String(year), month: String(month) });
  return apiClient.get(`/api/masters/me/reservations/calendar?${params}`);
}

/** 특정 날짜의 예약 목록 조회 */
export async function getDayReservations(date: string): Promise<{ reservations: ReservationWithUser[]; availableSlots: { time: string; available: boolean }[] }> {
  const params = new URLSearchParams({ date });
  return apiClient.get(`/api/masters/me/reservations/day?${params}`);
}

/** 수동 예약 생성 (마스터가 직접 등록) */
export async function createManualReservation(body: CreateManualReservationData): Promise<Reservation> {
  const data = await apiClient.post<{ reservation: Reservation }>('/api/masters/me/reservations/manual', body);
  return data.reservation;
}
