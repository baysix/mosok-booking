/**
 * 회원 관리 페이지 (마스터 전용)
 *
 * 가입한 회원 목록을 조회하고, 검색/제거할 수 있는 페이지.
 * React Query로 데이터 페칭, 공통 컴포넌트(ListSkeleton, EmptyState) 사용.
 */
'use client';

import { useState } from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMembersList, useRemoveMember } from '@/hooks/queries';
import { ListSkeleton } from '@/components/common/ListSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils/format';
import {
  Users,
  Search,
  Trash2,
  Mail,
  Phone,
  Calendar,
  UserX,
} from 'lucide-react';

export default function MasterMembersPage() {
  const { isReady } = useMasterAuth();
  const { data: members = [], isLoading } = useMembersList(isReady);
  const removeMutation = useRemoveMember();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isReady) return null;

  /** 회원 제거 핸들러 */
  const handleRemoveMember = async (membershipId: string, name: string) => {
    if (!confirm(`${name}님을 회원에서 제거하시겠습니까?`)) return;
    try {
      await removeMutation.mutateAsync(membershipId);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '회원 삭제에 실패했습니다');
    }
  };

  /** 검색어 필터링 */
  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.user.fullName.toLowerCase().includes(q) ||
      m.user.email.toLowerCase().includes(q) ||
      (m.user.phone && m.user.phone.includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">회원 관리</h1>
            <p className="text-sm text-gray-500">가입한 회원을 관리하세요</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-indigo-700">{members.length}명</span>
          </div>
        </div>

        {/* 검색 */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름, 이메일, 연락처로 검색"
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* 회원 목록 */}
        {isLoading ? (
          <ListSkeleton count={3} variant="card" />
        ) : filteredMembers.length === 0 ? (
          <EmptyState
            icon={UserX}
            title={searchQuery ? '검색 결과가 없습니다' : '회원이 없습니다'}
            description={searchQuery ? '다른 검색어로 시도해보세요' : '초대코드를 공유하여 회원을 모집하세요'}
          />
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((membership) => (
              <div
                key={membership.id}
                className="bg-white rounded-2xl border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {membership.user.fullName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{membership.user.fullName}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{membership.user.email}</span>
                        </div>
                      </div>
                      {membership.user.phone && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{membership.user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>가입일: {formatDate(membership.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveMember(membership.id, membership.user.fullName)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="회원 제거"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
