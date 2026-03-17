import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { getNotifications, getUnreadCount } from '@/lib/data/notifications-data';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(user.userId),
      getUnreadCount(user.userId),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json({ error: '알림 조회에 실패했습니다' }, { status: 500 });
  }
}
