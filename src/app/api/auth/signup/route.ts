import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser, getUserWithoutPassword } from '@/lib/auth/users-data';
import { createToken, setTokenCookie } from '@/lib/auth/jwt';
import { findJoinCodeByCode, isJoinCodeValid, incrementJoinCodeUses } from '@/lib/data/join-codes-data';
import { createMembership } from '@/lib/data/memberships-data';
import { createMasterProfile } from '@/lib/data/masters-data';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone, role, inviteCode } = await request.json();

    // 입력 검증
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요' },
        { status: 400 }
      );
    }

    if (!['user', 'master'].includes(role)) {
      return NextResponse.json(
        { error: '올바른 역할을 선택해주세요' },
        { status: 400 }
      );
    }

    // user 역할은 초대코드 필수
    if (role === 'user' && !inviteCode) {
      return NextResponse.json(
        { error: '초대코드를 입력해주세요' },
        { status: 400 }
      );
    }

    // 초대코드 검증 (user 역할인 경우)
    let joinCode;
    if (role === 'user') {
      joinCode = await findJoinCodeByCode(inviteCode);
      if (!joinCode) {
        return NextResponse.json(
          { error: '유효하지 않은 초대코드입니다' },
          { status: 400 }
        );
      }

      const validation = isJoinCodeValid(joinCode);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.reason },
          { status: 400 }
        );
      }
    }

    // 이메일 중복 검사
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다' },
        { status: 409 }
      );
    }

    // 실제 DB에 사용자 생성
    const profile = await createUser({ email, password, fullName, phone, role });

    if (role === 'user') {
      // 멤버십 생성
      await createMembership({
        masterId: joinCode!.masterId,
        userId: profile.id,
        joinedVia: 'invite_code',
        joinCodeId: joinCode!.id,
      });

      // 초대코드 사용 횟수 증가
      await incrementJoinCodeUses(joinCode!.id);

      // masterId 포함 JWT 생성
      const token = await createToken({
        userId: profile.id,
        email: profile.email,
        role: 'user',
        masterId: joinCode!.masterId,
      });

      await setTokenCookie(token);

      return NextResponse.json({
        message: '회원가입이 완료되었습니다.',
        user: getUserWithoutPassword(profile),
      });
    }

    // master 역할
    // 마스터 프로필 생성 (businessName 기본값: fullName)
    await createMasterProfile({
      userId: profile.id,
      businessName: fullName,
    });

    // masterId 없이 JWT 생성 (승인 대기 중)
    const token = await createToken({
      userId: profile.id,
      email: profile.email,
      role: 'master',
    });

    await setTokenCookie(token);

    return NextResponse.json({
      message: '회원가입이 완료되었습니다.',
      user: getUserWithoutPassword(profile),
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
