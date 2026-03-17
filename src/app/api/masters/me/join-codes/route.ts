import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { findMasterByUserId } from '@/lib/data/masters-data';
import { getJoinCodesByMasterId, createJoinCode } from '@/lib/data/join-codes-data';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  if (user.role !== 'master') {
    return NextResponse.json({ error: '마스터 계정만 접근할 수 있습니다' }, { status: 403 });
  }

  const master = await findMasterByUserId(user.userId);
  if (!master) {
    return NextResponse.json({ error: '마스터 프로필을 찾을 수 없습니다' }, { status: 404 });
  }

  const joinCodes = await getJoinCodesByMasterId(master.id);

  return NextResponse.json({ joinCodes });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  if (user.role !== 'master') {
    return NextResponse.json({ error: '마스터 계정만 접근할 수 있습니다' }, { status: 403 });
  }

  const master = await findMasterByUserId(user.userId);
  if (!master) {
    return NextResponse.json({ error: '마스터 프로필을 찾을 수 없습니다' }, { status: 404 });
  }

  const body = await request.json();
  const { label, maxUses, expiresAt } = body;

  const joinCode = await createJoinCode(master.id, { label, maxUses, expiresAt });

  return NextResponse.json({ joinCode }, { status: 201 });
}
