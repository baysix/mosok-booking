'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { ROUTES } from '@/constants/routes';
import { Flame, ChevronLeft } from 'lucide-react';
import { ProductsTab } from './_components/ProductsTab';
import { OrdersTab } from './_components/OrdersTab';

type Tab = 'products' | 'orders';

export default function PrayerManagePage() {
  const router = useRouter();
  const { isReady } = useMasterAuth();
  const [activeTab, setActiveTab] = useState<Tab>('products');

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <button
          onClick={() => router.push(ROUTES.MASTER_MYPAGE)}
          className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
          내 점집
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">기원 서비스 관리</h1>
        </div>
        <p className="text-sm text-gray-500 mb-5">기원 상품 설정 및 주문을 관리하세요</p>

        {/* 탭 전환 */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'products'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            상품 설정
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'orders'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            기원 현황
          </button>
        </div>

        {activeTab === 'products' ? <ProductsTab /> : <OrdersTab />}
      </div>
    </div>
  );
}
