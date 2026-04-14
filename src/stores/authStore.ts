import { create } from 'zustand';
import { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  masterId: string | null;
  isLoading: boolean;
  /** /api/auth/me 최초 호출 완료 여부 — 중복 fetch 방지 */
  initialized: boolean;
  setUser: (user: User | null) => void;
  setMasterId: (masterId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  masterId: null,
  isLoading: true,
  initialized: false,
  setUser: (user) => set({ user, isLoading: false }),
  setMasterId: (masterId) => set({ masterId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setInitialized: () => set({ initialized: true }),
  logout: () => set({ user: null, masterId: null, isLoading: false, initialized: false }),
}));
