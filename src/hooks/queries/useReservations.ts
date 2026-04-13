/**
 * 예약 관련 React Query 훅
 *
 * 예약 데이터 조회/생성/수정을 위한 Query & Mutation 훅 모음.
 * - useMyReservations: 사용자 예약 목록
 * - useMasterReservations: 마스터 예약 목록
 * - useCalendarData: 월별 캘린더 데이터
 * - useDayReservations: 일별 예약 상세
 * - useCreateReservation / useCreateManualReservation: 예약 생성
 * - useUpdateReservationStatus: 예약 상태 변경
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyReservations,
  getMasterReservations,
  getCalendarData,
  getDayReservations,
  createReservation,
  createManualReservation,
  updateReservationStatus,
  getAvailableSlots,
} from '@/services/reservation.service';
import {
  ReservationStatus,
  CreateReservationData,
  CreateManualReservationData,
  UpdateReservationStatusData,
} from '@/types/reservation.types';

/** Query key 팩토리 — 캐시 무효화 시 일관성 유지 */
export const reservationKeys = {
  all: ['reservations'] as const,
  myList: (status?: ReservationStatus) => ['reservations', 'my', status] as const,
  masterList: (status?: ReservationStatus) => ['reservations', 'master', status] as const,
  calendar: (year: number, month: number) => ['reservations', 'calendar', year, month] as const,
  day: (date: string) => ['reservations', 'day', date] as const,
  slots: (masterId: string, date: string) => ['reservations', 'slots', masterId, date] as const,
};

/** 사용자 예약 목록 조회 */
export function useMyReservations(status?: ReservationStatus, enabled = true) {
  return useQuery({
    queryKey: reservationKeys.myList(status),
    queryFn: () => getMyReservations(status),
    enabled,
  });
}

/** 마스터 예약 목록 조회 (고객 정보 포함) */
export function useMasterReservations(status?: ReservationStatus, enabled = true) {
  return useQuery({
    queryKey: reservationKeys.masterList(status),
    queryFn: () => getMasterReservations(status),
    enabled,
  });
}

/** 캘린더 데이터 조회 (월별 요약 + 통계) */
export function useCalendarData(year: number, month: number, enabled = true) {
  return useQuery({
    queryKey: reservationKeys.calendar(year, month),
    queryFn: () => getCalendarData(year, month),
    enabled,
  });
}

/** 특정 날짜의 예약 목록 + 가용 슬롯 조회 */
export function useDayReservations(date: string, enabled = true) {
  return useQuery({
    queryKey: reservationKeys.day(date),
    queryFn: () => getDayReservations(date),
    enabled: enabled && !!date,
  });
}

/** 예약 가능 시간대 조회 */
export function useAvailableSlots(masterId: string, date: string, enabled = true) {
  return useQuery({
    queryKey: reservationKeys.slots(masterId, date),
    queryFn: () => getAvailableSlots(masterId, date),
    enabled: enabled && !!masterId && !!date,
  });
}

/** 예약 생성 (사용자 온라인 예약) */
export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReservationData) => createReservation(data),
    onSuccess: () => {
      // 사용자 예약 목록 + 캘린더 캐시 무효화
      qc.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

/** 수동 예약 생성 (마스터 직접 등록) */
export function useCreateManualReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateManualReservationData) => createManualReservation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

/** 예약 상태 변경 (승인/거절/완료/취소) */
export function useUpdateReservationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateReservationStatusData & { id: string }) =>
      updateReservationStatus(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}
