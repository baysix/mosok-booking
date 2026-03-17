-- ==========================================
-- 테스트 시드 데이터
-- 모든 계정 비밀번호: test1234
-- ==========================================

-- bcrypt hash for "test1234"
-- $2b$10$HnWC0RSVRkPNCJFHOM0Tm.EKu7taPgOlcPSnQ.EU53eMFHXzUzqWK

-- =====================
-- 1. 관리자
-- =====================
INSERT INTO users (id, email, full_name, phone, role, password_hash) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@test.com', '관리자', '010-0000-0000', 'admin', '$2b$10$HnWC0RSVRkPNCJFHOM0Tm.EKu7taPgOlcPSnQ.EU53eMFHXzUzqWK');

-- =====================
-- 2. 무속인 2명
-- =====================
INSERT INTO users (id, email, full_name, phone, role, password_hash) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'master1@test.com', '김신령', '010-1111-1111', 'master', '$2b$10$HnWC0RSVRkPNCJFHOM0Tm.EKu7taPgOlcPSnQ.EU53eMFHXzUzqWK'),
  ('b0000000-0000-0000-0000-000000000002', 'master2@test.com', '이도령', '010-2222-2222', 'master', '$2b$10$HnWC0RSVRkPNCJFHOM0Tm.EKu7taPgOlcPSnQ.EU53eMFHXzUzqWK');

INSERT INTO masters (id, user_id, business_name, description, specialties, years_experience, region, district, base_price, status) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '신령의 집', '30년 경력의 신점 전문 무속인입니다.', ARRAY['신점', '사주', '굿'], 30, '서울', '강남구', 100000, 'approved'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', '도령 상담소', '타로와 사주를 전문으로 합니다.', ARRAY['타로', '사주'], 10, '서울', '마포구', 80000, 'approved');

-- =====================
-- 3. 초대코드
-- =====================
INSERT INTO join_codes (id, master_id, code, label, max_uses, current_uses, status) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ABC123', '기본 초대코드', 100, 2, 'active'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'XYZ789', '기본 초대코드', 100, 1, 'active');

-- =====================
-- 4. 일반 사용자 3명
-- =====================
INSERT INTO users (id, email, full_name, phone, role, password_hash) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'user1@test.com', '박민수', '010-3333-3333', 'user', '$2b$10$HnWC0RSVRkPNCJFHOM0Tm.EKu7taPgOlcPSnQ.EU53eMFHXzUzqWK'),
  ('e0000000-0000-0000-0000-000000000002', 'user2@test.com', '최영희', '010-4444-4444', 'user', '$2b$10$HnWC0RSVRkPNCJFHOM0Tm.EKu7taPgOlcPSnQ.EU53eMFHXzUzqWK'),
  ('e0000000-0000-0000-0000-000000000003', 'user3@test.com', '정수진', '010-5555-5555', 'user', '$2b$10$HnWC0RSVRkPNCJFHOM0Tm.EKu7taPgOlcPSnQ.EU53eMFHXzUzqWK');

-- =====================
-- 5. 멤버십 (사용자 → 무속인 소속)
-- =====================
INSERT INTO master_memberships (master_id, user_id, joined_via, join_code_id, is_active) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'invite_code', 'd0000000-0000-0000-0000-000000000001', true),
  ('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'invite_code', 'd0000000-0000-0000-0000-000000000001', true),
  ('c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 'invite_code', 'd0000000-0000-0000-0000-000000000002', true);

-- =====================
-- 6. 무속인1 주간 스케줄 (월~금 근무)
-- =====================
INSERT INTO master_weekly_hours (master_id, day_of_week, is_working, time_slots) VALUES
  ('c0000000-0000-0000-0000-000000000001', 0, false, '{}'),
  ('c0000000-0000-0000-0000-000000000001', 1, true, ARRAY['10:00','11:00','13:00','14:00','15:00','16:00']),
  ('c0000000-0000-0000-0000-000000000001', 2, true, ARRAY['10:00','11:00','13:00','14:00','15:00','16:00']),
  ('c0000000-0000-0000-0000-000000000001', 3, true, ARRAY['10:00','11:00','13:00','14:00','15:00','16:00']),
  ('c0000000-0000-0000-0000-000000000001', 4, true, ARRAY['10:00','11:00','13:00','14:00','15:00','16:00']),
  ('c0000000-0000-0000-0000-000000000001', 5, true, ARRAY['10:00','11:00','13:00','14:00','15:00','16:00']),
  ('c0000000-0000-0000-0000-000000000001', 6, false, '{}');
