import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { findMasterByUserId } from '@/lib/data/masters-data';
import { createManualReservation, getBookedTimeSlots } from '@/lib/data/reservations-data';
import { ALL_TIME_SLOTS, TimeSlot, getOccupiedSlots } from '@/types/reservation.types';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  if (user.role !== 'master') {
    return NextResponse.json({ error: '마스터만 접근 가능합니다' }, { status: 403 });
  }

  const master = await findMasterByUserId(user.userId);
  if (!master) {
    return NextResponse.json({ error: '마스터 프로필을 찾을 수 없습니다' }, { status: 404 });
  }

  const body = await request.json();
  let { date, timeSlot, consultationType, customerName, customerPhone, notes, totalPrice } = body;
  let duration: number = body.duration ?? 1;

  if (!date || !timeSlot || !consultationType || !customerName) {
    return NextResponse.json({ error: '날짜, 시간대, 상담유형, 고객명은 필수입니다' }, { status: 400 });
  }

  // 종일(0) -> 첫 슬롯부터 전체
  if (duration === 0) {
    timeSlot = ALL_TIME_SLOTS[0];
    duration = ALL_TIME_SLOTS.length;
  }

  if (!ALL_TIME_SLOTS.includes(timeSlot as TimeSlot)) {
    return NextResponse.json({ error: '잘못된 시간대입니다' }, { status: 400 });
  }

  const today = new Date().toISOString().split('T')[0];
  if (date < today) {
    return NextResponse.json({ error: '과거 날짜는 예약할 수 없습니다' }, { status: 400 });
  }

  const occupiedSlots = getOccupiedSlots(timeSlot as TimeSlot, duration);
  const bookedSlots = await getBookedTimeSlots(master.id, date);
  const hasConflict = occupiedSlots.some((s) => bookedSlots.includes(s));
  if (hasConflict) {
    return NextResponse.json({ error: '이미 예약된 시간대가 포함되어 있습니다' }, { status: 409 });
  }

  const reservation = await createManualReservation(master.id, {
    date,
    timeSlot,
    duration,
    consultationType,
    customerName,
    customerPhone,
    notes,
    totalPrice,
  });

  return NextResponse.json({ reservation }, { status: 201 });
}
