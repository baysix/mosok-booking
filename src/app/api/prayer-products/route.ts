import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { getPrayerProductsByMasterId } from '@/lib/data/prayer-data';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  if (!user.masterId) return NextResponse.json({ error: '소속된 점집이 없습니다' }, { status: 403 });

  const products = await getPrayerProductsByMasterId(user.masterId, true);
  return NextResponse.json({ products });
}
