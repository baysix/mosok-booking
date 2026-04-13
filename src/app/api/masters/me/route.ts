import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { findMasterByUserId, updateMasterProfile, createMasterProfile } from '@/lib/data/masters-data';

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
    return NextResponse.json({ master: null });
  }

  return NextResponse.json({ master });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  if (user.role !== 'master') {
    return NextResponse.json({ error: '마스터 계정만 접근할 수 있습니다' }, { status: 403 });
  }

  const body = await request.json();
  const existingMaster = await findMasterByUserId(user.userId);

  if (existingMaster) {
    const updated = await updateMasterProfile(existingMaster.id, body);
    if (!updated) {
      return NextResponse.json({ error: '프로필 업데이트에 실패했습니다' }, { status: 500 });
    }
    return NextResponse.json({ master: updated });
  } else {
    const created = await createMasterProfile({
      userId: user.userId,
      businessName: body.businessName,
      description: body.description,
      specialties: body.specialties,
      yearsExperience: parseInt(body.yearsExperience),
      region: body.region,
      address: body.address,
      basePrice: parseInt(body.basePrice),
      bankName: body.bankName,
      accountNumber: body.accountNumber,
      accountHolder: body.accountHolder,
      images: body.images || [],
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
    });
    if (!created) {
      return NextResponse.json({ error: '프로필 등록에 실패했습니다' }, { status: 500 });
    }
    return NextResponse.json({ master: created }, { status: 201 });
  }
}
