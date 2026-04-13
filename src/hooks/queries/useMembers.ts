/**
 * 회원 관리 React Query 훅
 *
 * 마스터의 회원(멤버십) 목록 조회 및 제거를 위한 훅.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMembers, removeMember, joinWithCode } from '@/services/membership.service';

/** Query key 팩토리 */
export const memberKeys = {
  all: ['members'] as const,
  list: ['members', 'list'] as const,
};

/** 회원 목록 조회 */
export function useMembersList(enabled = true) {
  return useQuery({
    queryKey: memberKeys.list,
    queryFn: getMembers,
    enabled,
  });
}

/** 회원 제거 (멤버십 비활성화) */
export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: string) => removeMember(membershipId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.all });
    },
  });
}

/** 초대코드로 가입 */
export function useJoinWithCode() {
  return useMutation({
    mutationFn: (inviteCode: string) => joinWithCode(inviteCode),
  });
}
