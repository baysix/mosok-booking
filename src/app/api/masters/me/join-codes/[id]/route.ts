import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { findMasterByUserId } from '@/lib/data/masters-data';
import { deactivateJoinCode } from '@/lib/data/join-codes-data';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const success = await deactivateJoinCode(id, master.id);

  if (!success) {
    return NextResponse.json({ error: '초대코드 비활성화에 실패했습니다' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
