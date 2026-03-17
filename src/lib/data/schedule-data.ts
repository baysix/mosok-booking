import { createClient } from '@/lib/supabase/server';
import { WeeklyHour, OffDay } from '@/types/schedule.types';
import { TimeSlot, ALL_TIME_SLOTS } from '@/types/reservation.types';
import { getBookedTimeSlots } from './reservations-data';

export async function getWeeklyHours(masterId: string): Promise<WeeklyHour[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('master_weekly_hours')
    .select('*')
    .eq('master_id', masterId)
    .order('day_of_week');

  if (error || !data) return [];

  return data.map((row) => ({
    dayOfWeek: row.day_of_week,
    isWorking: row.is_working,
    timeSlots: row.time_slots as TimeSlot[],
  }));
}

export async function upsertWeeklyHours(
  masterId: string,
  hours: { dayOfWeek: number; isWorking: boolean; timeSlots: TimeSlot[] }[]
): Promise<boolean> {
  const supabase = createClient();

  const rows = hours.map((h) => ({
    master_id: masterId,
    day_of_week: h.dayOfWeek,
    is_working: h.isWorking,
    time_slots: h.timeSlots,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('master_weekly_hours')
    .upsert(rows, { onConflict: 'master_id,day_of_week' });

  return !error;
}

export async function getOffDays(
  masterId: string,
  fromDate?: string,
  toDate?: string
): Promise<OffDay[]> {
  const supabase = createClient();
  let query = supabase
    .from('master_off_days')
    .select('*')
    .eq('master_id', masterId)
    .order('off_date');

  if (fromDate) query = query.gte('off_date', fromDate);
  if (toDate) query = query.lte('off_date', toDate);

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    offDate: row.off_date,
    reason: row.reason,
    createdAt: row.created_at,
  }));
}

export async function addOffDay(
  masterId: string,
  offDate: string,
  reason?: string
): Promise<OffDay | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('master_off_days')
    .insert({
      master_id: masterId,
      off_date: offDate,
      reason: reason || null,
    })
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    offDate: data.off_date,
    reason: data.reason,
    createdAt: data.created_at,
  };
}

export async function deleteOffDay(id: string, masterId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('master_off_days')
    .delete()
    .eq('id', id)
    .eq('master_id', masterId);

  return !error;
}

export async function getAvailableSlotsForDate(
  masterId: string,
  date: string
): Promise<{ time: TimeSlot; available: boolean }[]> {
  const supabase = createClient();
  const { data: offDay } = await supabase
    .from('master_off_days')
    .select('id')
    .eq('master_id', masterId)
    .eq('off_date', date)
    .maybeSingle();

  if (offDay) {
    return ALL_TIME_SLOTS.map((time) => ({ time, available: false }));
  }

  const dayOfWeek = new Date(date + 'T00:00:00').getDay();

  const { data: weeklyRow } = await supabase
    .from('master_weekly_hours')
    .select('*')
    .eq('master_id', masterId)
    .eq('day_of_week', dayOfWeek)
    .maybeSingle();

  let workingSlots: TimeSlot[];
  if (!weeklyRow) {
    workingSlots = [...ALL_TIME_SLOTS];
  } else if (!weeklyRow.is_working) {
    return ALL_TIME_SLOTS.map((time) => ({ time, available: false }));
  } else {
    workingSlots = weeklyRow.time_slots as TimeSlot[];
  }

  const bookedSlots = await getBookedTimeSlots(masterId, date);

  return ALL_TIME_SLOTS.map((time) => ({
    time,
    available: workingSlots.includes(time) && !bookedSlots.includes(time),
  }));
}
