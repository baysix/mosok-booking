import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { updateMasterStatus } from '@/lib/data/masters-data';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자만 접근할 수 있습니다' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태입니다' }, { status: 400 });
    }

    const updated = await updateMasterStatus(id, status);

    if (!updated) {
      return NextResponse.json({ error: '마스터를 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json({ master: updated });
  } catch (error) {
    console.error('PATCH /api/admin/masters/[id] error:', error);
    return NextResponse.json({ error: '마스터 상태 변경에 실패했습니다' }, { status: 500 });
  }
}
