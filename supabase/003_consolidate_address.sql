-- region에 도로명 주소 전체 저장, address는 상세주소(동/호수)만
-- district 컬럼 삭제

-- 1. 기존 데이터 통합: region + district + address → region
UPDATE masters
SET
  region = TRIM(CONCAT_WS(' ', region, district, address)),
  address = ''
WHERE region IS NOT NULL AND region != '';

-- 2. district 컬럼 삭제
ALTER TABLE masters DROP COLUMN IF EXISTS district;
