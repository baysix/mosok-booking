export type JoinCodeStatus = 'active' | 'expired' | 'used_up';

export interface JoinCode {
  id: string;
  masterId: string;
  code: string;
  label: string | null;
  maxUses: number | null;
  currentUses: number;
  status: JoinCodeStatus;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateJoinCodeData {
  label?: string;
  maxUses?: number;
  expiresAt?: string;
}
