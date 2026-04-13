/**
 * 로딩 스켈레톤 컴포넌트
 *
 * 8개+ 페이지에서 반복되는 로딩 스켈레톤 패턴을 통합.
 * 3가지 variant 지원:
 * - 'card': 카드 형태 (테두리 + 내부 shimmer)
 * - 'row': 단순 행 (회색 바)
 * - 'simple': 기본 바 (작은 높이)
 *
 * 사용 예시:
 *   <ListSkeleton count={3} variant="card" />
 */

interface ListSkeletonProps {
  /** 스켈레톤 행 개수 (기본값: 3) */
  count?: number;
  /** 스켈레톤 스타일 */
  variant?: 'card' | 'row' | 'simple';
}

export function ListSkeleton({ count = 3, variant = 'card' }: ListSkeletonProps) {
  const items = Array.from({ length: count });

  // 카드 스켈레톤: 테두리 있는 카드 내부에 shimmer 라인
  if (variant === 'card') {
    return (
      <div className="space-y-3">
        {items.map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="h-3 w-40 bg-gray-50 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 행 스켈레톤: 단순 회색 바
  if (variant === 'row') {
    return (
      <div className="space-y-3">
        {items.map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-50 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  // 심플 스켈레톤: 얇은 회색 바
  return (
    <div className="space-y-3">
      {items.map((_, i) => (
        <div
          key={i}
          className="h-12 bg-gray-50 rounded-xl animate-pulse"
        />
      ))}
    </div>
  );
}
