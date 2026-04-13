import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { findMasterByUserId } from '@/lib/data/masters-data';
import { updatePrayerOrderStatus } from '@/lib/data/prayer-data';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  if (user.role !== 'master') return NextResponse.json({ error: '마스터 계정만 접근할 수 있습니다' }, { status: 403 });

  const master = await findMasterByUserId(user.userId);
  if (!master) return NextResponse.json({ error: '마스터 정보를 찾을 수 없습니다' }, { status: 404 });

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!status || !['pending', 'active', 'completed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: '유효하지 않은 상태입니다' }, { status: 400 });
  }

  const updated = await updatePrayerOrderStatus(id, status);
  if (!updated) return NextResponse.json({ error: '상태 변경에 실패했습니다' }, { status: 500 });

  return NextResponse.json({ order: updated });
}
