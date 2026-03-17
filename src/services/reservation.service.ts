import {
  Reservation,
  ReservationWithUser,
  ReservationWithMaster,
  ReservationStatus,
  CreateReservationData,
  CreateManualReservationData,
  UpdateReservationStatusData,
  CalendarDayData,
  DashboardSummary,
} from '@/types/reservation.types';

export async function getMyReservations(status?: ReservationStatus): Promise<Reservation[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);

  const response = await fetch(`/api/reservations?${params.toString()}`);
  if (!response.ok) {
    throw new Error('예약 목록을 불러오는데 실패했습니다');
  }
  const data = await response.json();
  return data.reservations;
}

export async function getMasterReservations(status?: ReservationStatus): Promise<ReservationWithUser[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);

  const response = await fetch(`/api/reservations?${params.toString()}`);
  if (!response.ok) {
    throw new Error('예약 목록을 불러오는데 실패했습니다');
  }
  const data = await response.json();
  return data.reservations;
}

export async function getReservationById(id: string): Promise<Reservation> {
  const response = await fetch(`/api/reservations/${id}`);
  if (!response.ok) {
    throw new Error('예약 정보를 불러오는데 실패했습니다');
  }
  const data = await response.json();
  return data.reservation;
}

export async function createReservation(data: CreateReservationData): Promise<Reservation> {
  const response = await fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '예약 생성에 실패했습니다');
  }
  const result = await response.json();
  return result.reservation;
}

export async function updateReservationStatus(
  id: string,
  data: UpdateReservationStatusData
): Promise<Reservation> {
  const response = await fetch(`/api/reservations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '예약 상태 변경에 실패했습니다');
  }
  const result = await response.json();
  return result.reservation;
}

export async function getAvailableSlots(
  masterId: string,
  date: string
): Promise<{ time: string; available: boolean }[]> {
  const params = new URLSearchParams({ masterId, date });
  const response = await fetch(`/api/reservations/available-slots?${params.toString()}`);
  if (!response.ok) {
    throw new Error('예약 가능 시간을 불러오는데 실패했습니다');
  }
  const data = await response.json();
  return data.slots;
}

export async function getCalendarData(
  year: number,
  month: number
): Promise<{ days: CalendarDayData[]; summary: DashboardSummary }> {
  const params = new URLSearchParams({ year: String(year), month: String(month) });
  const response = await fetch(`/api/masters/me/reservations/calendar?${params}`);
  if (!response.ok) throw new Error('캘린더 데이터를 불러오는데 실패했습니다');
  return response.json();
}

export async function getDayReservations(
  date: string
): Promise<{ reservations: ReservationWithUser[]; availableSlots: { time: string; available: boolean }[] }> {
  const params = new URLSearchParams({ date });
  const response = await fetch(`/api/masters/me/reservations/day?${params}`);
  if (!response.ok) throw new Error('예약 목록을 불러오는데 실패했습니다');
  return response.json();
}

export async function createManualReservation(data: CreateManualReservationData): Promise<Reservation> {
  const response = await fetch('/api/masters/me/reservations/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '수동 예약 생성에 실패했습니다');
  }
  const result = await response.json();
  return result.reservation;
}
