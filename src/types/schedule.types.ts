import { TimeSlot } from './reservation.types';

export interface WeeklyHour {
  dayOfWeek: number; // 0=일, 1=월, ..., 6=토
  isWorking: boolean;
  timeSlots: TimeSlot[];
}

export interface OffDay {
  id: string;
  offDate: string; // YYYY-MM-DD
  reason: string | null;
  createdAt: string;
}

export interface MasterSchedule {
  weeklyHours: WeeklyHour[];
  offDays: OffDay[];
}

export const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
