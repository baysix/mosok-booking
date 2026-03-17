-- masters 테이블에 위도/경도 컬럼 추가
ALTER TABLE masters ADD COLUMN IF NOT EXISTS latitude double precision DEFAULT NULL;
ALTER TABLE masters ADD COLUMN IF NOT EXISTS longitude double precision DEFAULT NULL;
