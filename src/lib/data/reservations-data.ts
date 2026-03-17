import { createClient } from '@/lib/supabase/server';
import { mapReservationRow } from '@/lib/supabase/mappers';
import {
  Reservation,
  ReservationStatus,
  ReservationWithUser,
  CalendarDayData,
  CreateManualReservationData,
  DashboardSummary,
  ALL_TIME_SLOTS,
  TimeSlot,
} from '@/types/reservation.types';
import { findUserById } from '@/lib/auth/users-data';

export async function findReservationById(id: string): Promise<Reservation | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return undefined;
  return mapReservationRow(data);
}

export async function getReservationsByUserId(
  userId: string,
  masterId: string,
  status?: ReservationStatus
): Promise<Reservation[]> {
  const supabase = createClient();
  let query = supabase
    .from('reservations')
    .select('*')
    .eq('user_id', userId)
    .eq('master_id', masterId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapReservationRow);
}

export async function getReservationsByMasterId(
  masterId: string,
  status?: ReservationStatus
): Promise<Reservation[]> {
  const supabase = createClient();
  let query = supabase
    .from('reservations')
    .select('*')
    .eq('master_id', masterId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapReservationRow);
}

export async function createReservation(
  data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Reservation> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from('reservations')
    .insert({
      master_id: data.masterId,
      user_id: data.userId,
      date: data.date,
      time_slot: data.timeSlot,
      duration: data.duration || 1,
      party_size: data.partySize || 1,
      consultation_type: data.consultationType,
      notes: data.notes,
      total_price: data.totalPrice,
      status: data.status,
      source: 'online',
    })
    .select()
    .single();

  if (error || !row) throw error || new Error('예약 생성 실패');
  return mapReservationRow(row);
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
  rejectionReason?: string
): Promise<Reservation | null> {
  const supabase = createClient();
  const updateData: Record<string, unknown> = { status };
  if (rejectionReason) {
    updateData.rejection_reason = rejectionReason;
  }

  const { data, error } = await supabase
    .from('reservations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return null;
  return mapReservationRow(data);
}

export async function getBookedTimeSlots(masterId: string, date: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .select('time_slot, duration')
    .eq('master_id', masterId)
    .eq('date', date)
    .in('status', ['pending', 'confirmed']);

  if (error || !data) return [];

  const bookedSlots: string[] = [];
  for (const row of data) {
    const startIdx = ALL_TIME_SLOTS.indexOf(row.time_slot as TimeSlot);
    if (startIdx === -1) continue;
    const dur = row.duration || 1;
    for (let i = 0; i < dur && startIdx + i < ALL_TIME_SLOTS.length; i++) {
      bookedSlots.push(ALL_TIME_SLOTS[startIdx + i]);
    }
  }
  return bookedSlots;
}

export async function getMonthlyCalendarData(
  masterId: string,
  year: number,
  month: number
): Promise<CalendarDayData[]> {
  const supabase = createClient();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('reservations')
    .select('date, status')
    .eq('master_id', masterId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error || !data) return [];

  const dateMap = new Map<string, CalendarDayData>();
  for (const row of data) {
    const existing = dateMap.get(row.date) || {
      date: row.date,
      totalCount: 0,
      pendingCount: 0,
      confirmedCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      isOffDay: false,
    };
    existing.totalCount++;
    if (row.status === 'pending') existing.pendingCount++;
    else if (row.status === 'confirmed') existing.confirmedCount++;
    else if (row.status === 'completed') existing.completedCount++;
    else existing.cancelledCount++;
    dateMap.set(row.date, existing);
  }
  return Array.from(dateMap.values());
}

export async function getDayReservationsWithUser(
  masterId: string,
  date: string
): Promise<ReservationWithUser[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('master_id', masterId)
    .eq('date', date)
    .order('time_slot', { ascending: true });

  if (error || !data) return [];

  const reservations = data.map(mapReservationRow);
  const results: ReservationWithUser[] = [];

  for (const reservation of reservations) {
    let user: ReservationWithUser['user'] = null;
    if (reservation.userId) {
      const userData = await findUserById(reservation.userId);
      if (userData) {
        user = {
          id: userData.id,
          fullName: userData.full_name,
          email: userData.email,
          phone: userData.phone,
        };
      }
    }
    results.push({ ...reservation, user });
  }
  return results;
}

export async function createManualReservation(
  masterId: string,
  data: CreateManualReservationData
): Promise<Reservation> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from('reservations')
    .insert({
      master_id: masterId,
      user_id: null,
      date: data.date,
      time_slot: data.timeSlot,
      duration: data.duration || 1,
      consultation_type: data.consultationType,
      notes: data.notes || '',
      total_price: data.totalPrice || 0,
      status: 'confirmed' as const,
      source: 'manual',
      manual_customer_name: data.customerName,
      manual_customer_phone: data.customerPhone || null,
    })
    .select()
    .single();

  if (error || !row) throw error || new Error('수동 예약 생성 실패');
  return mapReservationRow(row);
}

export async function getDashboardStats(masterId: string): Promise<DashboardSummary> {
  const supabase = createClient();
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthLastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(monthLastDay).padStart(2, '0')}`;

  const [todayResult, pendingResult, weekResult, revenueResult] = await Promise.all([
    supabase.from('reservations').select('id', { count: 'exact', head: true })
      .eq('master_id', masterId).eq('date', today).in('status', ['pending', 'confirmed']),
    supabase.from('reservations').select('id', { count: 'exact', head: true })
      .eq('master_id', masterId).eq('status', 'pending'),
    supabase.from('reservations').select('id', { count: 'exact', head: true })
      .eq('master_id', masterId)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0])
      .in('status', ['pending', 'confirmed', 'completed']),
    supabase.from('reservations').select('total_price')
      .eq('master_id', masterId).eq('status', 'completed')
      .gte('date', monthStart).lte('date', monthEnd),
  ]);

  const revenue = (revenueResult.data || []).reduce((sum, r) => sum + r.total_price, 0);

  return {
    todayReservations: todayResult.count || 0,
    pendingTotal: pendingResult.count || 0,
    thisWeekReservations: weekResult.count || 0,
    thisMonthRevenue: revenue,
  };
}
