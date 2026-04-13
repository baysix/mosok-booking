import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { findMasterByUserId } from '@/lib/data/masters-data';
import {
  findPrayerProductById,
  updatePrayerProduct,
  upsertPrayerProductOption,
  deletePrayerProduct,
} from '@/lib/data/prayer-data';

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
  const existing = await findPrayerProductById(id);
  if (!existing || existing.masterId !== master.id) {
    return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 });
  }

  const body = await request.json();

  // Update product fields
  const updates: { category?: string; name?: string; description?: string; isActive?: boolean } = {};
  if (body.category !== undefined) updates.category = body.category;
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.isActive !== undefined) updates.isActive = body.isActive;

  if (Object.keys(updates).length > 0) {
    await updatePrayerProduct(id, updates);
  }

  // Upsert options if provided
  if (body.options && Array.isArray(body.options)) {
    for (const opt of body.options) {
      if (opt.durationDays && opt.price !== undefined) {
        await upsertPrayerProductOption(id, opt.durationDays, opt.price);
      }
    }
  }

  const updated = await findPrayerProductById(id);
  if (!updated) return NextResponse.json({ error: '상품 수정에 실패했습니다' }, { status: 500 });
  return NextResponse.json({ product: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  if (user.role !== 'master') return NextResponse.json({ error: '마스터 계정만 접근할 수 있습니다' }, { status: 403 });

  const master = await findMasterByUserId(user.userId);
  if (!master) return NextResponse.json({ error: '마스터 정보를 찾을 수 없습니다' }, { status: 404 });

  const { id } = await params;
  const existing = await findPrayerProductById(id);
  if (!existing || existing.masterId !== master.id) {
    return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 });
  }

  const deleted = await deletePrayerProduct(id);
  if (!deleted) return NextResponse.json({ error: '활성 주문이 있어 삭제할 수 없습니다' }, { status: 400 });
  return NextResponse.json({ success: true });
}
