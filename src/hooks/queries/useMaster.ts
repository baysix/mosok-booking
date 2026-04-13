/**
 * 마스터 관련 React Query 훅
 *
 * 마스터 프로필 조회 및 수정을 위한 Query & Mutation 훅.
 * - useMyMaster: 사용자가 소속된 마스터 정보
 * - useMyMasterProfile: 마스터 본인 프로필
 * - useUpdateMasterProfile: 프로필 수정
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyMaster,
  getMyMasterProfile,
  updateMyMasterProfile,
  UpdateMasterProfileData,
} from '@/services/master.service';

/** Query key 팩토리 */
export const masterKeys = {
  all: ['master'] as const,
  myMaster: ['master', 'my-master'] as const,
  profile: ['master', 'profile'] as const,
};

/** 내가 소속된 마스터 정보 조회 (사용자용) */
export function useMyMaster(enabled = true) {
  return useQuery({
    queryKey: masterKeys.myMaster,
    queryFn: getMyMaster,
    enabled,
  });
}

/** 내 마스터 프로필 조회 (마스터용) */
export function useMyMasterProfile(enabled = true) {
  return useQuery({
    queryKey: masterKeys.profile,
    queryFn: getMyMasterProfile,
    enabled,
  });
}

/** 마스터 프로필 수정 */
export function useUpdateMasterProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMasterProfileData) => updateMyMasterProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: masterKeys.all });
    },
  });
}
