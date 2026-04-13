import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  getPrayerOrdersByUserId,
  findPrayerProductById,
  findPrayerProductOptionById,
  createPrayerOrder,
} from '@/lib/data/prayer-data';
import { PrayerOrderStatus, calculateEndDate } from '@/types/prayer.types';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  if (!user.masterId) return NextResponse.json({ error: '소속된 점집이 없습니다' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as PrayerOrderStatus | null;

  const orders = await getPrayerOrdersByUserId(user.userId, user.masterId, status || undefined);
  return NextResponse.json({ orders, total: orders.length });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  if (!user.masterId) return NextResponse.json({ error: '소속된 점집이 없습니다' }, { status: 403 });

  const body = await request.json();
  const { productId, optionId, beneficiaryName, wishText, startDate } = body;

  if (!productId || !optionId || !startDate || !beneficiaryName) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요' }, { status: 400 });
  }

  const product = await findPrayerProductById(productId);
  if (!product || product.masterId !== user.masterId || !product.isActive) {
    return NextResponse.json({ error: '유효하지 않은 상품입니다' }, { status: 400 });
  }

  const option = await findPrayerProductOptionById(optionId);
  if (!option || option.productId !== productId || !option.isActive) {
    return NextResponse.json({ error: '유효하지 않은 옵션입니다' }, { status: 400 });
  }

  const endDate = calculateEndDate(startDate, option.durationDays);

  try {
    const order = await createPrayerOrder({
      masterId: user.masterId,
      userId: user.userId,
      productId: product.id,
      optionId: option.id,
      category: product.category,
      productName: product.name,
      durationDays: option.durationDays,
      price: option.price,
      beneficiaryName,
      wishText: wishText || '',
      startDate,
      endDate,
      status: 'pending',
      source: 'online',
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: '기원 신청에 실패했습니다' }, { status: 500 });
  }
}
