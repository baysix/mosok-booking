import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { findMasterByUserId } from '@/lib/data/masters-data';
import { getDayReservationsWithUser } from '@/lib/data/reservations-data';
import { getAvailableSlotsForDate } from '@/lib/data/schedule-data';

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'date 파라미터가 필요합니다' }, { status: 400 });
  }

  const [reservations, availableSlots] = await Promise.all([
    getDayReservationsWithUser(master.id, date),
    getAvailableSlotsForDate(master.id, date),
  ]);

  return NextResponse.json({ reservations, availableSlots });
}
