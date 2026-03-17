'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MasterWithUser } from '@/types/master.types';
import {
  MapPin,
  Briefcase,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Shield,
  CreditCard,
  Clock,
} from 'lucide-react';

export default function MasterApprovalPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [masters, setMasters] = useState<MasterWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchPendingMasters();
  }, []);

  const fetchPendingMasters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/masters/pending');
      if (response.ok) {
        const data = await response.json();
        setMasters(data.masters);
      }
    } catch (error) {
      console.error('Failed to fetch pending masters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (masterId: string) => {
    if (!confirm('이 무속인을 승인하시겠습니까?')) return;
    try {
      const response = await fetch(`/api/admin/masters/${masterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (response.ok) {
        setMasters((prev) => prev.filter((m) => m.id !== masterId));
      }
    } catch (error) {
      console.error('Failed to approve master:', error);
    }
  };

  const handleReject = async (masterId: string) => {
    const reason = prompt('거절 사유를 입력해주세요 (선택):');
    if (reason === null) return;
    try {
      const response = await fetch(`/api/admin/masters/${masterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejectionReason: reason || undefined }),
      });
      if (response.ok) {
        setMasters((prev) => prev.filter((m) => m.id !== masterId));
      }
    } catch (error) {
      console.error('Failed to reject master:', error);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">무속인 승인 관리</h1>
              <p className="text-sm text-gray-500">승인 대기 중인 무속인을 검토하고 승인하세요</p>
            </div>
          </div>
        </div>

        {masters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">모든 처리가 완료되었습니다</h2>
            <p className="text-sm text-gray-500">대기 중인 무속인이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Count badge */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 text-sm font-bold rounded-full flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                대기 중 {masters.length}건
              </span>
            </div>

            {masters.map((master) => (
              <div key={master.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{master.businessName}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        신청일: {new Date(master.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                      승인 대기
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-2">기본 정보</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span>{master.yearsExperience}년 경력</span>
                          </div>
                          {master.region && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{master.region}</span>
                            </div>
                          )}
                          {master.address && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400 opacity-0" />
                              <span className="text-gray-500">{master.address}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span>기본 요금: <strong>{master.basePrice.toLocaleString()}원</strong></span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-2">전문분야</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {master.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Contact info */}
                    <div className="space-y-4">
                      {master.user && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-700 mb-2">연락처 정보</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="text-gray-500">이름:</span>
                              <span className="font-medium">{master.user.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span>{master.user.email}</span>
                            </div>
                            {master.user.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{master.user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {master.description && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 mb-2">소개</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-3">
                        {master.description}
                      </p>
                    </div>
                  )}

                  {/* Images */}
                  {master.images.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 mb-2">이미지</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {master.images.map((image, index) => (
                          <div key={index} className="relative h-32 rounded-xl overflow-hidden border border-gray-100">
                            <img
                              src={image}
                              alt={`${master.businessName} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 border-t border-gray-50 flex gap-3">
                  <button
                    onClick={() => handleApprove(master.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(master.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    거절
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
