import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword, getUserWithoutPassword, getActiveMembership } from '@/lib/auth/users-data';
import { createToken, setTokenCookie } from '@/lib/auth/jwt';
import { findMasterByUserId } from '@/lib/data/masters-data';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요' },
        { status: 400 }
      );
    }

    // 사용자 찾기
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isValidPassword = verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      );
    }

    // masterId 조회
    let masterId: string | undefined;

    if (user.role === 'master') {
      const masterProfile = await findMasterByUserId(user.id);
      if (masterProfile) {
        masterId = masterProfile.id;
      }
    } else if (user.role === 'user') {
      const membership = await getActiveMembership(user.id);
      if (membership?.masters) {
        masterId = (membership.masters as any).id;
      }
    }
    // admin: masterId 없음

    // JWT 토큰 생성 (masterId 포함)
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      ...(masterId && { masterId }),
    });

    // 쿠키에 토큰 저장
    await setTokenCookie(token);

    // 사용자 정보 반환 (비밀번호 제외)
    return NextResponse.json({
      user: getUserWithoutPassword(user),
      token,
      masterId,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
