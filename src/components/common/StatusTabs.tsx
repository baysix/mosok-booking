/**
 * 상태 필터 탭 컴포넌트
 *
 * 3개+ 페이지에서 반복되는 상태 필터 탭 UI를 통합.
 * 제네릭 타입으로 어떤 상태값이든 사용 가능.
 *
 * 사용 예시:
 *   <StatusTabs
 *     tabs={[
 *       { value: 'all', label: '전체' },
 *       { value: 'pending', label: '대기', count: 3 },
 *       { value: 'active', label: '진행 중' },
 *     ]}
 *     active={activeStatus}
 *     onChange={setActiveStatus}
 *   />
 */

interface Tab<T extends string> {
  /** 탭 값 (필터링에 사용) */
  value: T;
  /** 표시 텍스트 */
  label: string;
  /** 뱃지 카운트 (선택, 0보다 클 때만 표시) */
  count?: number;
}

interface StatusTabsProps<T extends string> {
  /** 탭 목록 */
  tabs: Tab<T>[];
  /** 현재 선택된 탭 값 */
  active: T;
  /** 탭 변경 핸들러 */
  onChange: (value: T) => void;
  /** 활성 탭 배경색 (기본값: 'bg-indigo-500') */
  activeColor?: string;
}

export function StatusTabs<T extends string>({
  tabs,
  active,
  onChange,
  activeColor = 'bg-indigo-500',
}: StatusTabsProps<T>) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            active === tab.value
              ? `${activeColor} text-white`
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {tab.label}
          {/* 카운트 뱃지 (0보다 클 때만 표시) */}
          {tab.count !== undefined && tab.count > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 bg-white/20 rounded-full text-xs">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
