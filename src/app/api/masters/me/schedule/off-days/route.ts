import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { findMasterByUserId } from '@/lib/data/masters-data';
import { addOffDay, deleteOffDay } from '@/lib/data/schedule-data';

// 휴무일 추가
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  if (user.role !== 'master') {
    return NextResponse.json({ error: '마스터만 접근 가능합니다' }, { status: 403 });
  }

  const master = await findMasterByUserId(user.userId);
  if (!master) {
    return NextResponse.json({ error: '마스터 프로필을 찾을 수 없습니다' }, { status: 404 });
  }

  const body = await request.json();
  const { offDate, reason } = body;

  if (!offDate) {
    return NextResponse.json({ error: '날짜를 입력해주세요' }, { status: 400 });
  }

  // 과거 날짜 체크
  const today = new Date().toISOString().split('T')[0];
  if (offDate < today) {
    return NextResponse.json({ error: '과거 날짜는 설정할 수 없습니다' }, { status: 400 });
  }

  const offDay = await addOffDay(master.id, offDate, reason);

  if (!offDay) {
    return NextResponse.json({ error: '이미 등록된 휴무일이거나 저장에 실패했습니다' }, { status: 409 });
  }

  return NextResponse.json({ offDay }, { status: 201 });
}

// 휴무일 삭제
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  if (user.role !== 'master') {
    return NextResponse.json({ error: '마스터만 접근 가능합니다' }, { status: 403 });
  }

  const master = await findMasterByUserId(user.userId);
  if (!master) {
    return NextResponse.json({ error: '마스터 프로필을 찾을 수 없습니다' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '삭제할 휴무일 ID가 필요합니다' }, { status: 400 });
  }

  const success = await deleteOffDay(id, master.id);

  if (!success) {
    return NextResponse.json({ error: '삭제에 실패했습니다' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
