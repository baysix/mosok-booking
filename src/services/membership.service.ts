/**
 * 멤버십 서비스
 *
 * 마스터 회원 관리 관련 API 호출을 담당하는 서비스 레이어.
 */
import { apiClient } from '@/lib/api-client';
import { MembershipWithUser } from '@/types/membership.types';

/** 회원 목록 조회 */
export async function getMembers(): Promise<MembershipWithUser[]> {
  const data = await apiClient.get<{ members: MembershipWithUser[] }>('/api/masters/me/members');
  return data.members;
}

/** 회원 제거 (멤버십 비활성화) */
export async function removeMember(membershipId: string): Promise<void> {
  await apiClient.delete(`/api/masters/me/members/${membershipId}`);
}

/** 초대코드로 가입 */
export async function joinWithCode(inviteCode: string): Promise<{ masterId: string }> {
  return apiClient.post<{ masterId: string }>('/api/join', { inviteCode });
}
