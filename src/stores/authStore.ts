import { create } from 'zustand';
import { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  masterId: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setMasterId: (masterId: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  masterId: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setMasterId: (masterId) => set({ masterId }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null, masterId: null, isLoading: false }),
}));
