import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyToken } from '@/lib/auth/jwt';
import { findUserById, getUserWithoutPassword, updateUser } from '@/lib/auth/users-data';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다' },
        { status: 401 }
      );
    }

    const user = await findUserById(currentUser.userId);
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: getUserWithoutPassword(user),
      masterId: currentUser.masterId,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: '사용자 정보를 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 프로필 수정
export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const currentUser = await verifyToken(token);
  if (!currentUser) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const body = await request.json();
  const { fullName, phone } = body;

  if (!fullName || fullName.trim().length === 0) {
    return NextResponse.json({ error: '이름을 입력해주세요' }, { status: 400 });
  }

  const updated = await updateUser(currentUser.userId, {
    fullName: fullName.trim(),
    phone: phone?.trim() || null,
  });

  if (!updated) {
    return NextResponse.json({ error: '프로필 수정에 실패했습니다' }, { status: 500 });
  }

  return NextResponse.json({ user: getUserWithoutPassword(updated) });
}
