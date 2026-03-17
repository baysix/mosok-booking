import { JoinCode, CreateJoinCodeData } from '@/types/join-code.types';

export async function getJoinCodes(): Promise<JoinCode[]> {
  const response = await fetch('/api/masters/me/join-codes');
  if (!response.ok) {
    throw new Error('초대코드 목록을 불러오는데 실패했습니다');
  }
  const data = await response.json();
  return data.joinCodes;
}

export async function createJoinCode(data: CreateJoinCodeData): Promise<JoinCode> {
  const response = await fetch('/api/masters/me/join-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '초대코드 생성에 실패했습니다');
  }
  const data2 = await response.json();
  return data2.joinCode;
}

export async function deactivateJoinCode(id: string): Promise<void> {
  const response = await fetch(`/api/masters/me/join-codes/${id}`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '초대코드 비활성화에 실패했습니다');
  }
}
