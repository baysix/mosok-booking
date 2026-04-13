/**
 * 스케줄 서비스
 *
 * 마스터 주간 일정 및 휴무일 관련 API 호출을 담당하는 서비스 레이어.
 */
import { apiClient } from '@/lib/api-client';
import { MasterSchedule, WeeklyHour, OffDay } from '@/types/schedule.types';

/** 내 스케줄 조회 (주간 일정 + 휴무일) */
export async function getMySchedule(): Promise<MasterSchedule> {
  return apiClient.get<MasterSchedule>('/api/masters/me/schedule');
}

/** 주간 일정 저장 */
export async function saveWeeklyHours(weeklyHours: WeeklyHour[]): Promise<WeeklyHour[]> {
  const data = await apiClient.put<{ weeklyHours: WeeklyHour[] }>('/api/masters/me/schedule', { weeklyHours });
  return data.weeklyHours;
}

/** 휴무일 추가 */
export async function addOffDay(offDate: string, reason?: string): Promise<OffDay> {
  const data = await apiClient.post<{ offDay: OffDay }>('/api/masters/me/schedule/off-days', { offDate, reason });
  return data.offDay;
}

/** 휴무일 삭제 */
export async function deleteOffDay(id: string): Promise<void> {
  await apiClient.delete(`/api/masters/me/schedule/off-days?id=${id}`);
}
