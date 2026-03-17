import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  findReservationById,
  updateReservationStatus,
} from '@/lib/data/reservations-data';
import { findMasterById } from '@/lib/data/masters-data';
import { findUserById } from '@/lib/auth/users-data';
import { createNotification } from '@/lib/data/notifications-data';
import { UpdateReservationStatusData } from '@/types/reservation.types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const reservation = await findReservationById(id);
    if (!reservation) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다' }, { status: 404 });
    }

    // 소유권 검증: 사용자 본인 또는 해당 마스터만 접근 가능
    if (user.role === 'user' && reservation.userId !== user.userId) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 });
    }

    if (user.role === 'master' && reservation.masterId !== user.masterId) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 });
    }

    // 마스터 및 고객 정보 포함
    const master = await findMasterById(reservation.masterId);
    const customerRow = reservation.userId ? await findUserById(reservation.userId) : null;

    return NextResponse.json({
      reservation: {
        ...reservation,
        master: master
          ? {
              id: master.id,
              businessName: master.businessName,
              basePrice: master.basePrice,
              images: master.images,
              specialties: master.specialties,
            }
          : null,
        user: customerRow
          ? {
              id: customerRow.id,
              fullName: customerRow.full_name,
              email: customerRow.email,
              phone: customerRow.phone,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('GET /api/reservations/[id] error:', error);
    return NextResponse.json({ error: '예약 조회에 실패했습니다' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const reservation = await findReservationById(id);
    if (!reservation) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다' }, { status: 404 });
    }

    const body: UpdateReservationStatusData = await request.json();

    // 사용자(고객) 권한 검증 및 상태 변경 규칙
    if (user.role === 'user') {
      if (reservation.userId !== user.userId) {
        return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 });
      }
      if (body.status !== 'cancelled') {
        return NextResponse.json({ error: '고객은 취소만 가능합니다' }, { status: 400 });
      }
      if (reservation.status !== 'pending' && reservation.status !== 'confirmed') {
        return NextResponse.json({ error: '취소할 수 없는 상태입니다' }, { status: 400 });
      }
    }

    // 마스터 권한 검증 및 상태 변경 규칙
    if (user.role === 'master') {
      if (reservation.masterId !== user.masterId) {
        return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 });
      }

      if (reservation.status === 'pending') {
        if (body.status !== 'confirmed' && body.status !== 'rejected') {
          return NextResponse.json(
            { error: '대기 중인 예약은 승인 또는 거절만 가능합니다' },
            { status: 400 }
          );
        }
      } else if (reservation.status === 'confirmed') {
        if (body.status !== 'completed') {
          return NextResponse.json(
            { error: '확정된 예약은 완료 처리만 가능합니다' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: '상태를 변경할 수 없는 예약입니다' },
          { status: 400 }
        );
      }
    }

    const updated = await updateReservationStatus(id, body.status, body.rejectionReason);
    if (!updated) {
      return NextResponse.json({ error: '예약 상태 변경에 실패했습니다' }, { status: 500 });
    }

    // 상대방에게 알림 생성
    const master = await findMasterById(reservation.masterId);

    if (user.role === 'user' && master) {
      // 고객이 취소한 경우 -> 마스터에게 알림
      await createNotification({
        recipientId: master.userId,
        masterId: master.id,
        reservationId: reservation.id,
        type: 'reservation_cancelled',
        title: '예약 취소',
        body: `${reservation.date} ${reservation.timeSlot} 예약이 취소되었습니다.`,
      });
    }

    if (user.role === 'master' && reservation.userId) {
      // 마스터가 상태 변경한 경우 -> 고객에게 알림
      const notificationType =
        body.status === 'confirmed'
          ? 'reservation_confirmed'
          : body.status === 'rejected'
            ? 'reservation_rejected'
            : 'reservation_completed';

      const notificationTitle =
        body.status === 'confirmed'
          ? '예약 확정'
          : body.status === 'rejected'
            ? '예약 거절'
            : '상담 완료';

      const notificationBody =
        body.status === 'rejected' && body.rejectionReason
          ? `${reservation.date} ${reservation.timeSlot} 예약이 거절되었습니다. 사유: ${body.rejectionReason}`
          : `${reservation.date} ${reservation.timeSlot} 예약이 ${notificationTitle}되었습니다.`;

      await createNotification({
        recipientId: reservation.userId,
        masterId: reservation.masterId,
        reservationId: reservation.id,
        type: notificationType,
        title: notificationTitle,
        body: notificationBody,
      });
    }

    return NextResponse.json({ reservation: updated });
  } catch (error) {
    console.error('PATCH /api/reservations/[id] error:', error);
    return NextResponse.json({ error: '예약 상태 변경에 실패했습니다' }, { status: 500 });
  }
}
