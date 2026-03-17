import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { findMasterByUserId } from '@/lib/data/masters-data';
import { getMonthlyCalendarData, getDashboardStats } from '@/lib/data/reservations-data';
import { getOffDays } from '@/lib/data/schedule-data';

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
  const year = parseInt(searchParams.get('year') || '', 10);
  const month = parseInt(searchParams.get('month') || '', 10);

  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: 'year, month 파라미터가 필요합니다' }, { status: 400 });
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const [days, offDays, summary] = await Promise.all([
    getMonthlyCalendarData(master.id, year, month),
    getOffDays(master.id, startDate, endDate),
    getDashboardStats(master.id),
  ]);

  const offDaySet = new Set(offDays.map((d) => d.offDate));
  for (const day of days) {
    day.isOffDay = offDaySet.has(day.date);
  }

  // 예약은 없지만 휴무인 날짜도 추가
  const existingDates = new Set(days.map((d) => d.date));
  for (const offDate of offDaySet) {
    if (!existingDates.has(offDate)) {
      days.push({
        date: offDate,
        totalCount: 0,
        pendingCount: 0,
        confirmedCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        isOffDay: true,
      });
    }
  }

  return NextResponse.json({ days, summary });
}
