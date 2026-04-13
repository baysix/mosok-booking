/**
 * 초대코드 서비스
 *
 * 마스터 초대코드 관련 API 호출을 담당하는 서비스 레이어.
 */
import { apiClient } from '@/lib/api-client';
import { JoinCode, CreateJoinCodeData } from '@/types/join-code.types';

/** 초대코드 목록 조회 */
export async function getJoinCodes(): Promise<JoinCode[]> {
  const data = await apiClient.get<{ joinCodes: JoinCode[] }>('/api/masters/me/join-codes');
  return data.joinCodes;
}

/** 초대코드 생성 */
export async function createJoinCode(body: CreateJoinCodeData): Promise<JoinCode> {
  const data = await apiClient.post<{ joinCode: JoinCode }>('/api/masters/me/join-codes', body);
  return data.joinCode;
}

/** 초대코드 비활성화 */
export async function deactivateJoinCode(id: string): Promise<void> {
  await apiClient.patch(`/api/masters/me/join-codes/${id}`);
}
