'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { LoginCredentials, SignupData } from '@/types/auth.types';
import { ROUTES } from '@/constants/routes';

export function useAuth() {
  const { user, masterId, isLoading, setUser, setMasterId, setLoading, logout: storeLogout } = useAuthStore();
  const router = useRouter();

  // 초기 로드 시 사용자 정보 가져오기
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setMasterId(data.masterId || null);
        } else {
          setUser(null);
          setMasterId(null);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
        setMasterId(null);
      }
    }

    fetchUser();
  }, [setUser, setMasterId]);

  // 역할에 따른 리다이렉트 경로
  const getRedirectPath = (role: string, hasMasterId: boolean) => {
    if (role === 'master') return ROUTES.MASTER_DASHBOARD;
    if (role === 'admin') return ROUTES.ADMIN_MASTERS_APPROVAL;
    if (hasMasterId) return ROUTES.USER_HOME;
    return ROUTES.JOIN;
  };

  // 로그인
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '로그인에 실패했습니다');
      }

      const data = await response.json();
      setUser(data.user);
      setMasterId(data.masterId || null);

      const redirectPath = getRedirectPath(data.user.role, !!data.masterId);
      router.push(redirectPath);
      router.refresh();
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : '로그인에 실패했습니다',
      };
    }
  };

  // 회원가입
  const signup = async (data: SignupData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '회원가입에 실패했습니다');
      }

      const result = await response.json();
      setLoading(false);
      return { success: true, message: result.message };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : '회원가입에 실패했습니다',
      };
    }
  };

  // 초대코드로 가입
  const joinWithCode = async (inviteCode: string) => {
    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '가입에 실패했습니다');
      }

      const data = await response.json();
      setMasterId(data.masterId || null);
      router.push(ROUTES.USER_HOME);
      router.refresh();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '가입에 실패했습니다',
      };
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      storeLogout();
      router.push(ROUTES.LOGIN);
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    masterId,
    isLoading,
    isAuthenticated: !!user,
    hasMembership: !!masterId,
    login,
    signup,
    joinWithCode,
    logout,
  };
}
