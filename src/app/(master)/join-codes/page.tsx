/**
 * 초대코드 관리 페이지 (마스터 전용)
 *
 * 초대코드 목록 조회, 생성, 복사, 비활성화 기능.
 * React Query + 공통 컴포넌트(ListSkeleton, EmptyState, BaseModal) 사용.
 */
'use client';

import { useState, useEffect } from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useJoinCodesList, useCreateJoinCode, useDeactivateJoinCode } from '@/hooks/queries';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { BaseModal } from '@/components/common/BaseModal';
import { formatDate } from '@/lib/utils/format';
import { JoinCodeStatus, CreateJoinCodeData } from '@/types/join-code.types';
import {
  Ticket,
  Plus,
  Copy,
  Check,
  Loader2,
  Ban,
  Users,
  Clock,
  Calendar,
} from 'lucide-react';

/** 초대코드 상태별 스타일 */
const STATUS_CONFIG: Record<JoinCodeStatus, { label: string; className: string }> = {
  active: { label: '활성', className: 'bg-green-100 text-green-700' },
  expired: { label: '만료', className: 'bg-gray-100 text-gray-500' },
  used_up: { label: '소진', className: 'bg-amber-100 text-amber-700' },
};

export default function MasterJoinCodesPage() {
  const { isReady } = useMasterAuth();
  const { data: joinCodes = [], isLoading } = useJoinCodesList(isReady);
  const createMutation = useCreateJoinCode();
  const deactivateMutation = useDeactivateJoinCode();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (!isReady) return null;

  /** 코드 클립보드 복사 */
  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /** 초대코드 비활성화 */
  const handleDeactivate = async (id: string) => {
    if (!confirm('이 초대코드를 비활성화하시겠습니까?')) return;
    try {
      await deactivateMutation.mutateAsync(id);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '비활성화에 실패했습니다');
    }
  };

  /** 초대코드 생성 */
  const handleCreateCode = async (data: CreateJoinCodeData) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">초대코드 관리</h1>
            <p className="text-sm text-gray-500">회원 초대코드를 생성하고 관리하세요</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            코드 생성
          </button>
        </div>

        {/* 초대코드 목록 */}
        {isLoading ? (
          <ListSkeleton count={3} variant="card" />
        ) : joinCodes.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="초대코드가 없습니다"
            description="초대코드를 생성하여 회원을 초대하세요"
            action={{ label: '첫 번째 코드 생성', onClick: () => setModalOpen(true) }}
          />
        ) : (
          <div className="space-y-3">
            {joinCodes.map((code) => {
              const statusConfig = STATUS_CONFIG[code.status];
              const isCopied = copiedId === code.id;

              return (
                <div key={code.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  {/* 코드 + 라벨 */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {code.label && (
                        <p className="text-xs text-gray-500 mb-1">{code.label}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-mono font-bold text-gray-900 tracking-wider">
                          {code.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(code.code, code.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isCopied
                              ? 'bg-green-50 text-green-600'
                              : 'hover:bg-gray-100 text-gray-400'
                          }`}
                          title="코드 복사"
                        >
                          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${statusConfig.className}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* 통계 */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>사용 {code.currentUses}{code.maxUses !== null && `/${code.maxUses}`}</span>
                    </div>
                    {code.expiresAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>만료: {formatDate(code.expiresAt)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>생성: {formatDate(code.createdAt)}</span>
                    </div>
                  </div>

                  {/* 비활성화 버튼 */}
                  {code.status === 'active' && (
                    <button
                      onClick={() => handleDeactivate(code.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      <Ban className="w-3 h-3" />
                      비활성화
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 초대코드 생성 모달 */}
        {modalOpen && (
          <CreateCodeModal
            onClose={() => setModalOpen(false)}
            onSubmit={handleCreateCode}
          />
        )}
      </div>
    </div>
  );
}

// ============ 초대코드 생성 모달 ============

interface CreateCodeModalProps {
  onClose: () => void;
  onSubmit: (data: CreateJoinCodeData) => Promise<void>;
}

function CreateCodeModal({ onClose, onSubmit }: CreateCodeModalProps) {
  const [label, setLabel] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data: CreateJoinCodeData = {};
      if (label.trim()) data.label = label.trim();
      if (maxUses) data.maxUses = Number(maxUses);
      if (expiresAt) data.expiresAt = expiresAt;

      await onSubmit(data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '코드 생성에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="초대코드 생성"
      icon={
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Ticket className="w-4 h-4 text-indigo-500" />
        </div>
      }
      footer={
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              초대코드 생성
            </>
          )}
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-50 text-sm text-red-600">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">라벨 (선택)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="예: 블로그 이벤트, 소개 전용"
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">최대 사용 횟수 (선택)</label>
          <input
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="무제한"
            min="1"
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1">비워두면 무제한 사용 가능합니다</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">만료일 (선택)</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1">비워두면 만료 없이 사용 가능합니다</p>
        </div>
      </form>
    </BaseModal>
  );
}
