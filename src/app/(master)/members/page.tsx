'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getMembers, removeMember } from '@/services/membership.service';
import { MembershipWithUser } from '@/types/membership.types';
import {
  Users,
  Search,
  Trash2,
  Mail,
  Phone,
  Calendar,
  UserX,
} from 'lucide-react';

function formatDate(isoStr: string): string {
  const date = new Date(isoStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export default function MasterMembersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [members, setMembers] = useState<MembershipWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'master')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMembers();
      setMembers(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'master') {
      fetchMembers();
    }
  }, [user, fetchMembers]);

  const handleRemoveMember = async (membershipId: string, name: string) => {
    if (!confirm(`${name}님을 회원에서 제거하시겠습니까?`)) return;
    try {
      await removeMember(membershipId);
      setMembers((prev) => prev.filter((m) => m.id !== membershipId));
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '회원 삭제에 실패했습니다');
    }
  };

  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.user.fullName.toLowerCase().includes(q) ||
      m.user.email.toLowerCase().includes(q) ||
      (m.user.phone && m.user.phone.includes(q))
    );
  });

  if (authLoading || !user) return null;

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

        {/* Search */}
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

        {/* Member List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-24 bg-gray-100 rounded" />
                    <div className="h-3 w-32 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20">
            <UserX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '회원이 없습니다'}
            </h2>
            <p className="text-sm text-gray-500">
              {searchQuery ? '다른 검색어로 시도해보세요' : '초대코드를 공유하여 회원을 모집하세요'}
            </p>
          </div>
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
