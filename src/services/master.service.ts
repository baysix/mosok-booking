import { MasterProfile, MasterWithUser } from '@/types/master.types';

export async function getMyMaster(): Promise<MasterWithUser | null> {
  const response = await fetch('/api/masters/my-master');
  if (!response.ok) return null;
  const data = await response.json();
  return data.master;
}

export async function getMyMasterProfile(): Promise<MasterProfile | null> {
  const response = await fetch('/api/masters/me');
  if (!response.ok) {
    throw new Error('프로필을 불러오는데 실패했습니다');
  }
  const data = await response.json();
  return data.master;
}

export async function updateMyMasterProfile(updates: {
  businessName?: string;
  description?: string;
  specialties?: string[];
  yearsExperience?: number;
  region?: string;
  address?: string;
  basePrice?: number;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  images?: string[];
  latitude?: number | null;
  longitude?: number | null;
}): Promise<MasterProfile> {
  const response = await fetch('/api/masters/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '프로필 저장에 실패했습니다');
  }
  const data = await response.json();
  return data.master;
}
