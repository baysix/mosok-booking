import { createClient } from '@/lib/supabase/server';
import { mapMembershipRow } from '@/lib/supabase/mappers';
import { Membership, MembershipWithUser } from '@/types/membership.types';

export async function getMembersByMasterId(masterId: string): Promise<MembershipWithUser[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('master_memberships')
    .select('*, users(id, full_name, email, phone)')
    .eq('master_id', masterId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    ...mapMembershipRow(row),
    user: {
      id: (row.users as any).id,
      fullName: (row.users as any).full_name,
      email: (row.users as any).email,
      phone: (row.users as any).phone,
    },
  }));
}

export async function getMembershipByUserAndMaster(
  userId: string,
  masterId: string
): Promise<Membership | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('master_memberships')
    .select('*')
    .eq('user_id', userId)
    .eq('master_id', masterId)
    .single();

  if (error || !data) return undefined;
  return mapMembershipRow(data);
}

export async function getActiveMembershipByUser(userId: string): Promise<Membership | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('master_memberships')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error || !data) return undefined;
  return mapMembershipRow(data);
}

export async function createMembership(data: {
  masterId: string;
  userId: string;
  joinedVia: 'invite_code' | 'phone' | 'admin';
  joinCodeId?: string;
}): Promise<Membership> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from('master_memberships')
    .insert({
      master_id: data.masterId,
      user_id: data.userId,
      joined_via: data.joinedVia,
      join_code_id: data.joinCodeId || null,
      is_active: true,
    })
    .select()
    .single();

  if (error || !row) throw error || new Error('멤버십 생성 실패');
  return mapMembershipRow(row);
}

export async function deactivateMembership(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('master_memberships')
    .update({ is_active: false })
    .eq('id', id);

  return !error;
}

export async function getMemberCount(masterId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('master_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('master_id', masterId)
    .eq('is_active', true);

  if (error) return 0;
  return count || 0;
}
