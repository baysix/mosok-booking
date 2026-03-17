import bcrypt from 'bcryptjs';
import { createClient } from '@/lib/supabase/server';
import { mapProfileToUser } from '@/lib/supabase/mappers';

// 이메일로 사용자 찾기 (password_hash 포함)
export async function findUserByEmail(email: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return undefined;
  return data;
}

// ID로 사용자 찾기 (password_hash 포함)
export async function findUserById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return undefined;
  return data;
}

// 비밀번호 검증
export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}

// 사용자 정보 (비밀번호 제외) → camelCase
export function getUserWithoutPassword(row: any) {
  return mapProfileToUser(row);
}

// 사용자 정보 수정
export async function updateUser(id: string, data: { fullName?: string; phone?: string | null }) {
  const supabase = createClient();
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (data.fullName !== undefined) updateData.full_name = data.fullName;
  if (data.phone !== undefined) updateData.phone = data.phone;

  const { data: row, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !row) return undefined;
  return row;
}

// 새 사용자 생성
export async function createUser(data: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'user' | 'master';
}) {
  const supabase = createClient();
  const passwordHash = bcrypt.hashSync(data.password, 10);

  const { data: profile, error } = await supabase
    .from('users')
    .insert({
      email: data.email,
      full_name: data.fullName,
      phone: data.phone || null,
      role: data.role,
      password_hash: passwordHash,
    })
    .select()
    .single();

  if (error) throw error;
  return profile;
}

// 사용자의 활성 멤버십 조회 (masterId 포함)
export async function getActiveMembership(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('master_memberships')
    .select('*, masters(id, business_name, status)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error || !data) return undefined;
  return data;
}
