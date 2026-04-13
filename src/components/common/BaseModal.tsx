/**
 * 공통 모달 컴포넌트
 *
 * 5개+ 모달에서 반복되는 구조를 통합:
 * - 모바일: 하단에서 올라오는 bottom-sheet
 * - 데스크톱: 화면 중앙 팝업
 * - 드래그 핸들, 헤더 (아이콘 + 제목 + 닫기), 스크롤 콘텐츠, 고정 하단 영역
 *
 * 사용 예시:
 *   <BaseModal
 *     isOpen={isOpen}
 *     onClose={handleClose}
 *     title="예약 등록"
 *     icon={<Calendar className="w-4 h-4" />}
 *     footer={<button>저장</button>}
 *   >
 *     <form>...</form>
 *   </BaseModal>
 */
'use client';

import { X } from 'lucide-react';
import { useBodyLock } from '@/hooks/useBodyLock';

interface BaseModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 닫기 핸들러 (백드롭 클릭 또는 X 버튼) */
  onClose: () => void;
  /** 모달 제목 */
  title: string;
  /** 제목 왼쪽 아이콘 (선택) */
  icon?: React.ReactNode;
  /** 모달 본문 (스크롤 가능 영역) */
  children: React.ReactNode;
  /** 하단 고정 영역 — 버튼 등 (선택) */
  footer?: React.ReactNode;
  /** 최대 너비 클래스 (기본값: 'sm:max-w-md') */
  maxWidth?: string;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  maxWidth = 'sm:max-w-md',
}: BaseModalProps) {
  // 모달 열림 시 배경 스크롤 차단
  useBodyLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* 모달 본체 */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300`}
      >
        {/* 모바일 드래그 핸들 */}
        <div className="sm:hidden flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* 헤더: 아이콘 + 제목 + 닫기 버튼 */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 스크롤 가능한 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-4 pt-2">
          {children}
        </div>

        {/* 하단 고정 영역 (버튼 등) */}
        {footer && (
          <div className="flex-shrink-0 p-4 pt-2 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
