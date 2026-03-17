export const ROUTES = {
  // Public
  HOME: '/',

  // Auth
  LOGIN: '/login',
  SIGNUP: '/signup',
  JOIN: '/join',

  // User (일반 사용자)
  USER_HOME: '/home',
  USER_RESERVE: '/reserve',
  USER_RESERVATIONS: '/reservations',
  USER_PROFILE: '/profile',
  USER_CHAT: '/chat',
  USER_CHAT_ROOM: (roomId: string) => `/chat/${roomId}`,

  // Master (무속인)
  MASTER_DASHBOARD: '/dashboard',
  MASTER_RESERVATIONS: '/master-reservations',
  MASTER_SCHEDULE: '/schedule',
  MASTER_MEMBERS: '/members',
  MASTER_JOIN_CODES: '/join-codes',
  MASTER_PROFILE: '/master-profile',
  MASTER_CHAT: '/master-chat',
  MASTER_CHAT_ROOM: (roomId: string) => `/master-chat/${roomId}`,

  // Admin
  ADMIN_MASTERS_APPROVAL: '/masters/approval',
} as const;
