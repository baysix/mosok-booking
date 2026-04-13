import { createClient } from '@/lib/supabase/server';
import { mapPrayerProductRow, mapPrayerProductOptionRow, mapPrayerOrderRow } from '@/lib/supabase/mappers';
import {
  PrayerProduct,
  PrayerProductOption,
  PrayerOrder,
  PrayerOrderWithUser,
  PrayerOrderStatus,
  CreatePrayerProductData,
  CreateManualPrayerOrderData,
  calculateEndDate,
} from '@/types/prayer.types';
import { findUserById } from '@/lib/auth/users-data';

// ===== PRODUCTS =====

async function loadOptionsForProducts(productIds: string[]): Promise<Record<string, PrayerProductOption[]>> {
  if (productIds.length === 0) return {};
  const supabase = createClient();
  const { data, error } = await supabase
    .from('prayer_product_options')
    .select('*')
    .in('product_id', productIds)
    .order('duration_days');

  if (error || !data) return {};
  const map: Record<string, PrayerProductOption[]> = {};
  data.forEach((row) => {
    const opt = mapPrayerProductOptionRow(row);
    if (!map[opt.productId]) map[opt.productId] = [];
    map[opt.productId].push(opt);
  });
  return map;
}

export async function getPrayerProductsByMasterId(
  masterId: string,
  activeOnly = false
): Promise<PrayerProduct[]> {
  const supabase = createClient();
  let query = supabase
    .from('prayer_products')
    .select('*')
    .eq('master_id', masterId);

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query.order('sort_order').order('created_at');
  if (error || !data) return [];

  const optionsMap = await loadOptionsForProducts(data.map((d) => d.id));
  return data.map((row) => mapPrayerProductRow(row, optionsMap[row.id] || []));
}

export async function findPrayerProductById(id: string): Promise<PrayerProduct | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('prayer_products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return undefined;
  const optionsMap = await loadOptionsForProducts([data.id]);
  return mapPrayerProductRow(data, optionsMap[data.id] || []);
}

export async function findPrayerProductOptionById(id: string): Promise<PrayerProductOption | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('prayer_product_options')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return undefined;
  return mapPrayerProductOptionRow(data);
}

export async function createPrayerProduct(
  masterId: string,
  data: CreatePrayerProductData
): Promise<PrayerProduct> {
  const supabase = createClient();

  const { data: productRow, error: productError } = await supabase
    .from('prayer_products')
    .insert({
      master_id: masterId,
      category: data.category || '등',
      name: data.name,
      description: data.description || '',
    })
    .select()
    .single();

  if (productError || !productRow) throw productError || new Error('상품 생성 실패');

  if (data.options.length > 0) {
    const optionInserts = data.options.map((opt) => ({
      product_id: productRow.id,
      duration_days: opt.durationDays,
      price: opt.price,
    }));
    await supabase.from('prayer_product_options').insert(optionInserts);
  }

  const optionsMap = await loadOptionsForProducts([productRow.id]);
  return mapPrayerProductRow(productRow, optionsMap[productRow.id] || []);
}

export async function updatePrayerProduct(
  id: string,
  updates: { category?: string; name?: string; description?: string; isActive?: boolean }
): Promise<PrayerProduct | null> {
  const supabase = createClient();
  const updateData: Record<string, unknown> = {};
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('prayer_products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return null;
  const optionsMap = await loadOptionsForProducts([data.id]);
  return mapPrayerProductRow(data, optionsMap[data.id] || []);
}

export async function upsertPrayerProductOption(
  productId: string,
  durationDays: number,
  price: number
): Promise<PrayerProductOption> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('prayer_product_options')
    .upsert(
      { product_id: productId, duration_days: durationDays, price, is_active: true },
      { onConflict: 'product_id,duration_days' }
    )
    .select()
    .single();

  if (error || !data) throw error || new Error('옵션 저장 실패');
  return mapPrayerProductOptionRow(data);
}

export async function deletePrayerProduct(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('prayer_products').delete().eq('id', id);
  return !error;
}

// ===== ORDERS =====

export async function getPrayerOrdersByMasterId(
  masterId: string,
  filters?: { status?: PrayerOrderStatus }
): Promise<PrayerOrderWithUser[]> {
  const supabase = createClient();
  let query = supabase
    .from('prayer_orders')
    .select('*')
    .eq('master_id', masterId);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error || !data) return [];

  const orders = data.map(mapPrayerOrderRow);
  const results: PrayerOrderWithUser[] = [];

  for (const order of orders) {
    let user: PrayerOrderWithUser['user'] = null;
    if (order.userId) {
      const userData = await findUserById(order.userId);
      if (userData) {
        user = {
          id: userData.id,
          fullName: userData.full_name,
          email: userData.email,
          phone: userData.phone,
        };
      }
    }
    results.push({ ...order, user });
  }
  return results;
}

export async function getPrayerOrdersByUserId(
  userId: string,
  masterId: string,
  status?: PrayerOrderStatus
): Promise<PrayerOrder[]> {
  const supabase = createClient();
  let query = supabase
    .from('prayer_orders')
    .select('*')
    .eq('user_id', userId)
    .eq('master_id', masterId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(mapPrayerOrderRow);
}

export async function createPrayerOrder(
  orderData: Omit<PrayerOrder, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PrayerOrder> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from('prayer_orders')
    .insert({
      master_id: orderData.masterId,
      user_id: orderData.userId,
      product_id: orderData.productId,
      option_id: orderData.optionId,
      category: orderData.category,
      product_name: orderData.productName,
      duration_days: orderData.durationDays,
      price: orderData.price,
      beneficiary_name: orderData.beneficiaryName || '',
      wish_text: orderData.wishText || '',
      start_date: orderData.startDate,
      end_date: orderData.endDate,
      status: orderData.status,
      source: orderData.source,
      manual_customer_name: orderData.manualCustomerName || null,
      manual_customer_phone: orderData.manualCustomerPhone || null,
    })
    .select()
    .single();

  if (error || !row) throw error || new Error('기원 주문 생성 실패');
  return mapPrayerOrderRow(row);
}

export async function createManualPrayerOrder(
  masterId: string,
  product: PrayerProduct,
  option: PrayerProductOption,
  data: CreateManualPrayerOrderData
): Promise<PrayerOrder> {
  const endDate = calculateEndDate(data.startDate, option.durationDays);
  return createPrayerOrder({
    masterId,
    userId: data.userId || null,
    productId: product.id,
    optionId: option.id,
    category: product.category,
    productName: product.name,
    durationDays: option.durationDays,
    price: option.price,
    beneficiaryName: data.beneficiaryName || '',
    wishText: data.wishText || '',
    startDate: data.startDate,
    endDate,
    status: 'active',
    source: data.userId ? 'online' : 'manual',
    manualCustomerName: data.customerName,
    manualCustomerPhone: data.customerPhone,
  });
}

export async function updatePrayerOrderStatus(
  id: string,
  status: PrayerOrderStatus
): Promise<PrayerOrder | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('prayer_orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return null;
  return mapPrayerOrderRow(data);
}
