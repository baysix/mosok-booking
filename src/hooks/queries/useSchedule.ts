/**
 * 스케줄 관련 React Query 훅
 *
 * 마스터 주간 일정 및 휴무일 관리를 위한 Query & Mutation 훅.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMySchedule,
  saveWeeklyHours,
  addOffDay,
  deleteOffDay,
} from '@/services/schedule.service';
import { WeeklyHour } from '@/types/schedule.types';

/** Query key 팩토리 */
export const scheduleKeys = {
  all: ['schedule'] as const,
  my: ['schedule', 'my'] as const,
};

/** 내 스케줄 조회 (주간 일정 + 휴무일) */
export function useMySchedule(enabled = true) {
  return useQuery({
    queryKey: scheduleKeys.my,
    queryFn: getMySchedule,
    enabled,
  });
}

/** 주간 일정 저장 */
export function useSaveWeeklyHours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (weeklyHours: WeeklyHour[]) => saveWeeklyHours(weeklyHours),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

/** 휴무일 추가 */
export function useAddOffDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ offDate, reason }: { offDate: string; reason?: string }) =>
      addOffDay(offDate, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

/** 휴무일 삭제 */
export function useDeleteOffDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOffDay(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}
