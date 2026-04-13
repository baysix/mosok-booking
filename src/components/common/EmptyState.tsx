/**
 * 빈 상태 컴포넌트
 *
 * 7개+ 페이지에서 반복되는 '데이터 없음' UI를 통합.
 * 아이콘 + 제목 + 설명 + 선택적 액션 버튼을 중앙 정렬로 표시.
 *
 * 사용 예시:
 *   <EmptyState
 *     icon={UserX}
 *     title="회원이 없습니다"
 *     description="초대코드를 공유하여 회원을 모집하세요"
 *     action={{ label: '초대코드 생성', onClick: () => {} }}
 *   />
 */
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  /** lucide-react 아이콘 컴포넌트 */
  icon: LucideIcon;
  /** 메인 메시지 */
  title: string;
  /** 부가 설명 (선택) */
  description?: string;
  /** 액션 버튼 (선택) */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-gray-500 mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
