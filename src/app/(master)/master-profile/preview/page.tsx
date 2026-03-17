'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getMyMasterProfile } from '@/services/master.service';
import { findUserById } from '@/lib/auth/users-data';
import { MasterProfile } from '@/types/master.types';
import { MasterDetailView } from '@/components/master/MasterDetailView';
import { ArrowLeft, Pencil } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function MasterProfilePreviewPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [master, setMaster] = useState<(MasterProfile & { user?: { fullName: string } | null }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'master') return;

    async function fetchData() {
      try {
        const profile = await getMyMasterProfile();
        if (profile) {
          setMaster({
            ...profile,
            user: { fullName: user!.fullName },
          });
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!master) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-sm text-gray-500">프로필 정보를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 바 */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <button
            onClick={() => router.push(ROUTES.MASTER_PROFILE)}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">돌아가기</span>
          </button>
          <span className="text-sm font-semibold text-gray-400">미리보기</span>
          <button
            onClick={() => router.push(ROUTES.MASTER_PROFILE)}
            className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            <span className="text-sm font-medium">수정</span>
          </button>
        </div>
      </div>

      <MasterDetailView master={master} />
    </div>
  );
}
