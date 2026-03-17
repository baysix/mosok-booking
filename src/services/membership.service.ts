import { MembershipWithUser } from '@/types/membership.types';

export async function getMembers(): Promise<MembershipWithUser[]> {
  const response = await fetch('/api/masters/me/members');
  if (!response.ok) {
    throw new Error('회원 목록을 불러오는데 실패했습니다');
  }
  const data = await response.json();
  return data.members;
}

export async function removeMember(membershipId: string): Promise<void> {
  const response = await fetch(`/api/masters/me/members/${membershipId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '회원 삭제에 실패했습니다');
  }
}

export async function joinWithCode(inviteCode: string): Promise<{ masterId: string }> {
  const response = await fetch('/api/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviteCode }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '가입에 실패했습니다');
  }
  return response.json();
}
