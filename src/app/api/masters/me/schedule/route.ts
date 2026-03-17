import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { findMasterByUserId } from '@/lib/data/masters-data';
import { getWeeklyHours, upsertWeeklyHours, getOffDays } from '@/lib/data/schedule-data';
import { ALL_TIME_SLOTS, TimeSlot } from '@/types/reservation.types';

// 일정 조회
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

  const weeklyHours = await getWeeklyHours(master.id);
  const offDays = await getOffDays(master.id);

  return NextResponse.json({ weeklyHours, offDays });
}

// 주간 근무 시간 저장
export async function PUT(request: NextRequest) {
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
  const { weeklyHours } = body;

  if (!Array.isArray(weeklyHours) || weeklyHours.length !== 7) {
    return NextResponse.json({ error: '7개 요일 데이터가 필요합니다' }, { status: 400 });
  }

  // 유효성 검증
  for (const h of weeklyHours) {
    if (h.dayOfWeek < 0 || h.dayOfWeek > 6) {
      return NextResponse.json({ error: '잘못된 요일입니다' }, { status: 400 });
    }
    if (h.isWorking && h.timeSlots) {
      const invalid = h.timeSlots.find((t: string) => !ALL_TIME_SLOTS.includes(t as TimeSlot));
      if (invalid) {
        return NextResponse.json({ error: `잘못된 시간대: ${invalid}` }, { status: 400 });
      }
    }
  }

  const success = await upsertWeeklyHours(master.id, weeklyHours);

  if (!success) {
    return NextResponse.json({ error: '일정 저장에 실패했습니다' }, { status: 500 });
  }

  const updated = await getWeeklyHours(master.id);
  return NextResponse.json({ weeklyHours: updated });
}
