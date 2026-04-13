/**
 * 사용자 라우트 그룹 로딩 UI
 */
import { ListSkeleton } from '@/components/common/ListSkeleton';

export default function UserLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="h-7 w-40 bg-gray-100 rounded mb-2 animate-pulse" />
      <div className="h-4 w-56 bg-gray-50 rounded mb-6 animate-pulse" />
      <ListSkeleton count={3} variant="card" />
    </div>
  );
}
