import { NextResponse } from 'next/server';
import { deleteTokenCookie } from '@/lib/auth/jwt';

export async function POST() {
  try {
    await deleteTokenCookie();
    return NextResponse.json({ message: '로그아웃되었습니다' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '로그아웃 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
