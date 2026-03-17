export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: 'user' | 'master' | 'admin';
  avatarUrl: string | null;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'user' | 'master';
  inviteCode?: string; // user 역할일 때 필수
}

export interface AuthResponse {
  user: User;
  token: string;
}
