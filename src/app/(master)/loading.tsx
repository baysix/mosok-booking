/**
 * 마스터 라우트 그룹 로딩 UI
 *
 * 마스터 페이지 전환 시 표시되는 스켈레톤 로딩.
 */
import { ListSkeleton } from '@/components/common/ListSkeleton';

export default function MasterLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="h-7 w-40 bg-gray-100 rounded mb-2 animate-pulse" />
      <div className="h-4 w-56 bg-gray-50 rounded mb-6 animate-pulse" />
      <ListSkeleton count={3} variant="card" />
    </div>
  );
}
