import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { getAvailableSlotsForDate } from '@/lib/data/schedule-data';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const masterId = searchParams.get('masterId');
    const date = searchParams.get('date');

    if (!masterId || !date) {
      return NextResponse.json(
        { error: 'masterId와 date 파라미터가 필요합니다' },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlotsForDate(masterId, date);

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('GET /api/reservations/available-slots error:', error);
    return NextResponse.json({ error: '예약 가능 시간 조회에 실패했습니다' }, { status: 500 });
  }
}
