import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { markAllAsRead } from '@/lib/data/notifications-data';

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const success = await markAllAsRead(user.userId);

    if (!success) {
      return NextResponse.json({ error: '알림 전체 읽음 처리에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/notifications/read-all error:', error);
    return NextResponse.json({ error: '알림 전체 읽음 처리에 실패했습니다' }, { status: 500 });
  }
}
