-- 기원 상품에 유형(카테고리) 추가: 등, 초, 또는 사용자 정의
ALTER TABLE prayer_products ADD COLUMN category TEXT NOT NULL DEFAULT '등';

-- 기원 주문에도 카테고리 보존
ALTER TABLE prayer_orders ADD COLUMN category TEXT NOT NULL DEFAULT '등';
