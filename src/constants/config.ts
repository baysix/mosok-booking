export const APP_CONFIG = {
  name: '무속 예약',
  description: '무속인 전용 예약 관리 시스템',
  version: '1.0.0',

  // Pagination
  itemsPerPage: 20,

  // File upload
  maxImageSize: 5 * 1024 * 1024, // 5MB
  acceptedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],

  // Price
  minPrice: 10000,
  maxPrice: 1000000,
} as const;
