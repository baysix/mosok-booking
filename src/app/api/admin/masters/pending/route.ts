import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { getPendingMasters } from '@/lib/data/masters-data';
import { findUserById } from '@/lib/auth/users-data';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '관리자만 접근할 수 있습니다' }, { status: 403 });
    }

    const pendingMasters = await getPendingMasters();

    // 사용자 정보와 함께 반환
    const mastersWithUser = await Promise.all(
      pendingMasters.map(async (master) => {
        const userRow = await findUserById(master.userId);
        return {
          ...master,
          user: userRow
            ? {
                id: userRow.id,
                email: userRow.email,
                fullName: userRow.full_name,
                phone: userRow.phone,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ masters: mastersWithUser });
  } catch (error) {
    console.error('GET /api/admin/masters/pending error:', error);
    return NextResponse.json({ error: '대기 중인 마스터 목록 조회에 실패했습니다' }, { status: 500 });
  }
}
