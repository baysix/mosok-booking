import { MasterProfile } from '@/types/master.types';
import { createClient } from '@/lib/supabase/server';
import { mapMasterRow } from '@/lib/supabase/mappers';

export async function findMasterById(id: string): Promise<MasterProfile | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('masters')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return undefined;
  return mapMasterRow(data);
}

export async function findMasterByUserId(userId: string): Promise<MasterProfile | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('masters')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return undefined;
  return mapMasterRow(data);
}

export async function getPendingMasters(): Promise<MasterProfile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('masters')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapMasterRow);
}

export async function updateMasterStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<MasterProfile | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('masters')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return undefined;
  return mapMasterRow(data);
}

export async function updateMasterProfile(
  id: string,
  updates: {
    businessName?: string;
    description?: string;
    specialties?: string[];
    yearsExperience?: number;
    region?: string;
    address?: string;
    basePrice?: number;
    images?: string[];
    latitude?: number | null;
    longitude?: number | null;
  }
): Promise<MasterProfile | undefined> {
  const supabase = createClient();
  const updateData: Record<string, unknown> = {};
  if (updates.businessName !== undefined) updateData.business_name = updates.businessName;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.specialties !== undefined) updateData.specialties = updates.specialties;
  if (updates.yearsExperience !== undefined) updateData.years_experience = updates.yearsExperience;
  if (updates.region !== undefined) updateData.region = updates.region;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.basePrice !== undefined) updateData.base_price = updates.basePrice;
  if (updates.images !== undefined) updateData.images = updates.images;
  if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
  if (updates.longitude !== undefined) updateData.longitude = updates.longitude;

  const { data, error } = await supabase
    .from('masters')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return undefined;
  return mapMasterRow(data);
}

export async function createMasterProfile(data: {
  userId: string;
  businessName: string;
  description?: string;
  specialties?: string[];
  yearsExperience?: number;
  region?: string;
  address?: string;
  basePrice?: number;
  images?: string[];
  latitude?: number | null;
  longitude?: number | null;
}): Promise<MasterProfile | undefined> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from('masters')
    .insert({
      user_id: data.userId,
      business_name: data.businessName,
      description: data.description || '',
      specialties: data.specialties || [],
      years_experience: data.yearsExperience || 0,
      region: data.region || '',
      address: data.address || '',
      base_price: data.basePrice || 0,
      images: data.images || [],
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      status: 'pending',
    })
    .select()
    .single();

  if (error || !row) return undefined;
  return mapMasterRow(row);
}
