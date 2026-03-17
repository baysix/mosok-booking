import { MasterSchedule, WeeklyHour, OffDay } from '@/types/schedule.types';

export async function getMySchedule(): Promise<MasterSchedule> {
  const response = await fetch('/api/masters/me/schedule');
  if (!response.ok) {
    throw new Error('일정을 불러오는데 실패했습니다');
  }
  return response.json();
}

export async function saveWeeklyHours(weeklyHours: WeeklyHour[]): Promise<WeeklyHour[]> {
  const response = await fetch('/api/masters/me/schedule', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weeklyHours }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '일정 저장에 실패했습니다');
  }
  const data = await response.json();
  return data.weeklyHours;
}

export async function addOffDay(offDate: string, reason?: string): Promise<OffDay> {
  const response = await fetch('/api/masters/me/schedule/off-days', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offDate, reason }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '휴무일 등록에 실패했습니다');
  }
  const data = await response.json();
  return data.offDay;
}

export async function deleteOffDay(id: string): Promise<void> {
  const response = await fetch(`/api/masters/me/schedule/off-days?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '휴무일 삭제에 실패했습니다');
  }
}
