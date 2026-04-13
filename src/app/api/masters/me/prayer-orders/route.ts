import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { findMasterByUserId } from '@/lib/data/masters-data';
import {
  getPrayerOrdersByMasterId,
  findPrayerProductById,
  findPrayerProductOptionById,
  createManualPrayerOrder,
} from '@/lib/data/prayer-data';
import { PrayerOrderStatus } from '@/types/prayer.types';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  if (user.role !== 'master') return NextResponse.json({ error: '마스터 계정만 접근할 수 있습니다' }, { status: 403 });

  const master = await findMasterByUserId(user.userId);
  if (!master) return NextResponse.json({ error: '마스터 정보를 찾을 수 없습니다' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as PrayerOrderStatus | null;

  const orders = await getPrayerOrdersByMasterId(master.id, {
    status: status || undefined,
  });

  return NextResponse.json({ orders, total: orders.length });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  if (user.role !== 'master') return NextResponse.json({ error: '마스터 계정만 접근할 수 있습니다' }, { status: 403 });

  const master = await findMasterByUserId(user.userId);
  if (!master) return NextResponse.json({ error: '마스터 정보를 찾을 수 없습니다' }, { status: 404 });

  const body = await request.json();
  const { productId, optionId, beneficiaryName, wishText, startDate, customerName, customerPhone, userId } = body;

  if (!productId || !optionId || !startDate) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요' }, { status: 400 });
  }
  if (!customerName && !userId) {
    return NextResponse.json({ error: '고객명 또는 회원을 선택해주세요' }, { status: 400 });
  }

  const product = await findPrayerProductById(productId);
  if (!product || product.masterId !== master.id || !product.isActive) {
    return NextResponse.json({ error: '유효하지 않은 상품입니다' }, { status: 400 });
  }

  const option = await findPrayerProductOptionById(optionId);
  if (!option || option.productId !== productId) {
    return NextResponse.json({ error: '유효하지 않은 옵션입니다' }, { status: 400 });
  }

  try {
    const order = await createManualPrayerOrder(master.id, product, option, {
      productId,
      optionId,
      beneficiaryName: beneficiaryName || customerName,
      wishText,
      startDate,
      customerName: customerName || '',
      customerPhone,
      userId,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: '기원 등록에 실패했습니다' }, { status: 500 });
  }
}
