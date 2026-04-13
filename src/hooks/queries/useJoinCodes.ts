/**
 * 초대코드 관련 React Query 훅
 *
 * 초대코드 목록 조회, 생성, 비활성화를 위한 Query & Mutation 훅.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getJoinCodes,
  createJoinCode,
  deactivateJoinCode,
} from '@/services/join-code.service';
import { CreateJoinCodeData } from '@/types/join-code.types';

/** Query key 팩토리 */
export const joinCodeKeys = {
  all: ['joinCodes'] as const,
  list: ['joinCodes', 'list'] as const,
};

/** 초대코드 목록 조회 */
export function useJoinCodesList(enabled = true) {
  return useQuery({
    queryKey: joinCodeKeys.list,
    queryFn: getJoinCodes,
    enabled,
  });
}

/** 초대코드 생성 */
export function useCreateJoinCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJoinCodeData) => createJoinCode(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: joinCodeKeys.all });
    },
  });
}

/** 초대코드 비활성화 */
export function useDeactivateJoinCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateJoinCode(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: joinCodeKeys.all });
    },
  });
}
