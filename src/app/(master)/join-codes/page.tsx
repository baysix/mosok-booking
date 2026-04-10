'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getJoinCodes, createJoinCode, deactivateJoinCode } from '@/services/join-code.service';
import { JoinCode, JoinCodeStatus, CreateJoinCodeData } from '@/types/join-code.types';
import {
  Ticket,
  Plus,
  Copy,
  Check,
  X,
  Loader2,
  Ban,
  Users,
  Clock,
  Calendar,
} from 'lucide-react';

function formatDate(isoStr: string): string {
  const date = new Date(isoStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

const STATUS_CONFIG: Record<JoinCodeStatus, { label: string; className: string }> = {
  active: { label: '활성', className: 'bg-green-100 text-green-700' },
  expired: { label: '만료', className: 'bg-gray-100 text-gray-500' },
  used_up: { label: '소진', className: 'bg-amber-100 text-amber-700' },
};

export default function MasterJoinCodesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [joinCodes, setJoinCodes] = useState<JoinCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create modal
  const [modalOpen, setModalOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'master')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchJoinCodes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJoinCodes();
      setJoinCodes(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'master') {
      fetchJoinCodes();
    }
  }, [user, fetchJoinCodes]);

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('이 초대코드를 비활성화하시겠습니까?')) return;
    try {
      await deactivateJoinCode(id);
      fetchJoinCodes();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '비활성화에 실패했습니다');
    }
  };

  const handleCreateCode = async (data: CreateJoinCodeData) => {
    await createJoinCode(data);
    fetchJoinCodes();
  };

  if (authLoading || !user) return null;

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

        {/* Join Code List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="h-8 w-40 bg-gray-100 rounded mb-3" />
                <div className="flex gap-2">
                  <div className="h-5 w-12 bg-gray-100 rounded-full" />
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : joinCodes.length === 0 ? (
          <div className="text-center py-20">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">초대코드가 없습니다</h2>
            <p className="text-sm text-gray-500 mb-4">초대코드를 생성하여 회원을 초대하세요</p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              첫 번째 코드 생성
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {joinCodes.map((code) => {
              const statusConfig = STATUS_CONFIG[code.status];
              const isCopied = copiedId === code.id;

              return (
                <div
                  key={code.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4"
                >
                  {/* Code + Label */}
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
                          {isCopied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${statusConfig.className}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        사용 {code.currentUses}
                        {code.maxUses !== null && `/${code.maxUses}`}
                      </span>
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

                  {/* Actions */}
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

        {/* Create Code Modal */}
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

// ============ Create Code Modal ============

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

  // 모달 열릴 때 배경 스크롤 차단
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* 고정 헤더 */}
        <div className="flex-shrink-0">
          <div className="sm:hidden flex justify-center pt-3">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Ticket className="w-4 h-4 text-indigo-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900">초대코드 생성</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* 스크롤 가능한 폼 영역 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 text-sm text-red-600">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              라벨 (선택)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="예: 블로그 이벤트, 소개 전용"
              className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              최대 사용 횟수 (선택)
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              만료일 (선택)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">비워두면 만료 없이 사용 가능합니다</p>
          </div>

          <div className="pb-2" />
        </form>

        {/* 하단 고정 버튼 */}
        <div className="flex-shrink-0 p-4 pt-2 border-t border-gray-100">
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
        </div>
      </div>
    </div>
  );
}
