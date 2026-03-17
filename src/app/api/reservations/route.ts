import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  getReservationsByUserId,
  getReservationsByMasterId,
  createReservation,
  getBookedTimeSlots,
} from '@/lib/data/reservations-data';
import { findMasterById } from '@/lib/data/masters-data';
import { createNotification } from '@/lib/data/notifications-data';
import { ALL_TIME_SLOTS, ReservationStatus, TimeSlot } from '@/types/reservation.types';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') as ReservationStatus | null;

    if (user.role === 'user') {
      if (!user.masterId) {
        return NextResponse.json({ error: '소속된 마스터가 없습니다' }, { status: 400 });
      }

      const reservations = await getReservationsByUserId(
        user.userId,
        user.masterId,
        statusFilter || undefined
      );

      return NextResponse.json({ reservations, total: reservations.length });
    }

    if (user.role === 'master') {
      if (!user.masterId) {
        return NextResponse.json({ error: '마스터 정보를 찾을 수 없습니다' }, { status: 400 });
      }

      const reservations = await getReservationsByMasterId(
        user.masterId,
        statusFilter || undefined
      );

      return NextResponse.json({ reservations, total: reservations.length });
    }

    return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 });
  } catch (error) {
    console.error('GET /api/reservations error:', error);
    return NextResponse.json({ error: '예약 목록 조회에 실패했습니다' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    if (user.role !== 'user') {
      return NextResponse.json({ error: '고객 계정만 예약할 수 있습니다' }, { status: 403 });
    }

    if (!user.masterId) {
      return NextResponse.json({ error: '소속된 마스터가 없습니다' }, { status: 400 });
    }

    const body = await request.json();
    const { date, timeSlot, partySize, consultationType, notes } = body;

    if (!date || !timeSlot || !consultationType) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 });
    }

    // 과거 날짜 검증
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return NextResponse.json({ error: '과거 날짜는 예약할 수 없습니다' }, { status: 400 });
    }

    // 유효한 시간대인지 확인
    if (!ALL_TIME_SLOTS.includes(timeSlot as TimeSlot)) {
      return NextResponse.json({ error: '유효하지 않은 시간대입니다' }, { status: 400 });
    }

    // 시간대 충돌 확인
    const bookedSlots = await getBookedTimeSlots(user.masterId, date);
    if (bookedSlots.includes(timeSlot)) {
      return NextResponse.json({ error: '이미 예약된 시간대입니다' }, { status: 400 });
    }

    // 마스터 정보에서 기본 가격 조회
    const master = await findMasterById(user.masterId);
    if (!master) {
      return NextResponse.json({ error: '마스터 정보를 찾을 수 없습니다' }, { status: 404 });
    }

    const totalPrice = master.basePrice;

    const reservation = await createReservation({
      masterId: user.masterId,
      userId: user.userId,
      date,
      timeSlot: timeSlot as TimeSlot,
      duration: 1,
      partySize: partySize || 1,
      consultationType,
      notes: notes || '',
      totalPrice,
      status: 'pending',
      source: 'online',
    });

    // 마스터에게 알림 생성
    await createNotification({
      recipientId: master.userId,
      masterId: master.id,
      reservationId: reservation.id,
      type: 'reservation_requested',
      title: '새로운 예약 요청',
      body: `${date} ${timeSlot} 예약 요청이 있습니다.`,
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reservations error:', error);
    return NextResponse.json({ error: '예약 생성에 실패했습니다' }, { status: 500 });
  }
}
