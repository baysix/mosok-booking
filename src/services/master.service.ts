/**
 * 마스터 서비스
 *
 * 마스터 프로필 조회 및 수정 관련 API 호출을 담당하는 서비스 레이어.
 */
import { apiClient } from '@/lib/api-client';
import { MasterProfile, MasterWithUser } from '@/types/master.types';

/** 내가 소속된 마스터 정보 조회 (사용자용, 에러 시 null 반환) */
export async function getMyMaster(): Promise<MasterWithUser | null> {
  try {
    const data = await apiClient.get<{ master: MasterWithUser }>('/api/masters/my-master');
    return data.master;
  } catch {
    return null;
  }
}

/** 내 마스터 프로필 조회 (마스터용) */
export async function getMyMasterProfile(): Promise<MasterProfile | null> {
  const data = await apiClient.get<{ master: MasterProfile }>('/api/masters/me');
  return data.master;
}

/** 마스터 프로필 업데이트에 사용되는 필드 타입 */
export interface UpdateMasterProfileData {
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
}

/** 내 마스터 프로필 수정 */
export async function updateMyMasterProfile(updates: UpdateMasterProfileData): Promise<MasterProfile> {
  const data = await apiClient.patch<{ master: MasterProfile }>('/api/masters/me', updates);
  return data.master;
}
