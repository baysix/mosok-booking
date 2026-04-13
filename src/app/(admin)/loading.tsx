/**
 * 관리자 라우트 그룹 로딩 UI
 */
import { ListSkeleton } from '@/components/common/ListSkeleton';

export default function AdminLoading() {
  return (
    <div className="p-6">
      <div className="h-7 w-48 bg-gray-100 rounded mb-4 animate-pulse" />
      <ListSkeleton count={4} variant="card" />
    </div>
  );
}
