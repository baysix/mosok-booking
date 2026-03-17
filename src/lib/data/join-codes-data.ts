import { createClient } from '@/lib/supabase/server';
import { mapJoinCodeRow } from '@/lib/supabase/mappers';
import { JoinCode } from '@/types/join-code.types';

export async function getJoinCodesByMasterId(masterId: string): Promise<JoinCode[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('join_codes')
    .select('*')
    .eq('master_id', masterId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapJoinCodeRow);
}

export async function findJoinCodeByCode(code: string): Promise<JoinCode | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('join_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !data) return undefined;
  return mapJoinCodeRow(data);
}

export async function createJoinCode(
  masterId: string,
  data: { label?: string; maxUses?: number; expiresAt?: string }
): Promise<JoinCode> {
  const supabase = createClient();
  const code = generateCode();

  const { data: row, error } = await supabase
    .from('join_codes')
    .insert({
      master_id: masterId,
      code,
      label: data.label || null,
      max_uses: data.maxUses || null,
      expires_at: data.expiresAt || null,
      status: 'active',
    })
    .select()
    .single();

  if (error || !row) throw error || new Error('초대코드 생성 실패');
  return mapJoinCodeRow(row);
}

export async function incrementJoinCodeUses(id: string): Promise<void> {
  const supabase = createClient();

  // current_uses 증가
  const { data: current } = await supabase
    .from('join_codes')
    .select('current_uses, max_uses')
    .eq('id', id)
    .single();

  if (!current) return;

  const newUses = current.current_uses + 1;
  const updateData: Record<string, unknown> = { current_uses: newUses };

  // max_uses에 도달하면 상태 변경
  if (current.max_uses && newUses >= current.max_uses) {
    updateData.status = 'used_up';
  }

  await supabase.from('join_codes').update(updateData).eq('id', id);
}

export async function deactivateJoinCode(id: string, masterId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('join_codes')
    .update({ status: 'expired' as const })
    .eq('id', id)
    .eq('master_id', masterId);

  return !error;
}

// 유효한 초대코드인지 검증
export function isJoinCodeValid(joinCode: JoinCode): { valid: boolean; reason?: string } {
  if (joinCode.status !== 'active') {
    return { valid: false, reason: '만료되었거나 사용이 완료된 코드입니다' };
  }
  if (joinCode.expiresAt && new Date(joinCode.expiresAt) < new Date()) {
    return { valid: false, reason: '만료된 코드입니다' };
  }
  if (joinCode.maxUses && joinCode.currentUses >= joinCode.maxUses) {
    return { valid: false, reason: '사용 횟수가 초과된 코드입니다' };
  }
  return { valid: true };
}

// 6자리 대문자 영숫자 코드 생성
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동 문자 제외 (0,O,1,I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
