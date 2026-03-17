import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { findMasterById } from '@/lib/data/masters-data';
import { findUserById } from '@/lib/auth/users-data';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  if (!user.masterId) {
    return NextResponse.json({ error: '소속된 무속인이 없습니다' }, { status: 404 });
  }

  const master = await findMasterById(user.masterId);
  if (!master) {
    return NextResponse.json({ error: '무속인 정보를 찾을 수 없습니다' }, { status: 404 });
  }

  const masterUser = await findUserById(master.userId);

  return NextResponse.json({
    master: {
      ...master,
      user: masterUser ? {
        id: masterUser.id,
        fullName: masterUser.full_name,
        phone: masterUser.phone,
      } : null,
    },
  });
}
