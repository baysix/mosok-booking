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
  USER_PRAYER: '/prayer',
  USER_PRAYER_APPLY: '/prayer/apply',
  USER_CHAT: '/chat',
  USER_CHAT_ROOM: (roomId: string) => `/chat/${roomId}`,

  // Master (무속인)
  MASTER_DASHBOARD: '/dashboard',
  MASTER_CALENDAR: '/calendar',
  MASTER_RESERVATIONS: '/master-reservations',
  MASTER_SCHEDULE: '/schedule',
  MASTER_MEMBERS: '/members',
  MASTER_JOIN_CODES: '/join-codes',
  MASTER_MYPAGE: '/master-mypage',
  MASTER_PROFILE: '/master-profile',
  MASTER_PRAYER: '/prayer-manage',
  MASTER_CHAT: '/master-chat',
  MASTER_CHAT_ROOM: (roomId: string) => `/master-chat/${roomId}`,

  // Admin
  ADMIN_MASTERS_APPROVAL: '/masters/approval',
} as const;
