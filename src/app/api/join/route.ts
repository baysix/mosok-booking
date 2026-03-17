import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createToken, setTokenCookie } from '@/lib/auth/jwt';
import { findJoinCodeByCode, isJoinCodeValid, incrementJoinCodeUses } from '@/lib/data/join-codes-data';
import {
  getMembershipByUserAndMaster,
  getActiveMembershipByUser,
  deactivateMembership,
  createMembership,
} from '@/lib/data/memberships-data';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { inviteCode } = await request.json();

    if (!inviteCode) {
      return NextResponse.json(
        { error: '초대코드를 입력해주세요' },
        { status: 400 }
      );
    }

    // 초대코드 조회
    const joinCode = await findJoinCodeByCode(inviteCode);
    if (!joinCode) {
      return NextResponse.json(
        { error: '유효하지 않은 초대코드입니다' },
        { status: 400 }
      );
    }

    // 초대코드 유효성 검증
    const validation = isJoinCodeValid(joinCode);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      );
    }

    // 이미 해당 마스터의 멤버인지 확인
    const existingMembership = await getMembershipByUserAndMaster(
      currentUser.userId,
      joinCode.masterId
    );
    if (existingMembership) {
      return NextResponse.json(
        { error: '이미 해당 마스터의 멤버입니다' },
        { status: 409 }
      );
    }

    // 기존 활성 멤버십 비활성화
    const activeMembership = await getActiveMembershipByUser(currentUser.userId);
    if (activeMembership) {
      await deactivateMembership(activeMembership.id);
    }

    // 새 멤버십 생성
    await createMembership({
      masterId: joinCode.masterId,
      userId: currentUser.userId,
      joinedVia: 'invite_code',
      joinCodeId: joinCode.id,
    });

    // 초대코드 사용 횟수 증가
    await incrementJoinCodeUses(joinCode.id);

    // 새 masterId로 JWT 재발급
    const token = await createToken({
      userId: currentUser.userId,
      email: currentUser.email,
      role: currentUser.role,
      masterId: joinCode.masterId,
    });

    await setTokenCookie(token);

    return NextResponse.json({
      success: true,
      masterId: joinCode.masterId,
    });
  } catch (error) {
    console.error('Join error:', error);
    return NextResponse.json(
      { error: '참여 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
