import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { findMasterByUserId } from '@/lib/data/masters-data';
import { getPrayerProductsByMasterId, createPrayerProduct } from '@/lib/data/prayer-data';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  if (user.role !== 'master') return NextResponse.json({ error: '마스터 계정만 접근할 수 있습니다' }, { status: 403 });

  const master = await findMasterByUserId(user.userId);
  if (!master) return NextResponse.json({ error: '마스터 정보를 찾을 수 없습니다' }, { status: 404 });

  const products = await getPrayerProductsByMasterId(master.id);
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  if (user.role !== 'master') return NextResponse.json({ error: '마스터 계정만 접근할 수 있습니다' }, { status: 403 });

  const master = await findMasterByUserId(user.userId);
  if (!master) return NextResponse.json({ error: '마스터 정보를 찾을 수 없습니다' }, { status: 404 });

  const body = await request.json();
  const { category, name, description, options } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: '상품명을 입력해주세요' }, { status: 400 });
  }
  if (!options || !Array.isArray(options) || options.length === 0) {
    return NextResponse.json({ error: '기간/가격 옵션을 최소 1개 이상 설정해주세요' }, { status: 400 });
  }

  for (const opt of options) {
    if (!opt.durationDays || opt.durationDays <= 0 || opt.price === undefined || opt.price < 0) {
      return NextResponse.json({ error: '옵션의 기간과 가격을 올바르게 입력해주세요' }, { status: 400 });
    }
  }

  try {
    const product = await createPrayerProduct(master.id, {
      category: category?.trim() || undefined,
      name: name.trim(),
      description: description?.trim() || '',
      options,
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: '기원 상품 등록에 실패했습니다' }, { status: 500 });
  }
}
