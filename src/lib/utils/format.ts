/**
 * 공통 포맷 유틸리티
 *
 * 5개+ 파일에서 반복 정의되는 날짜/가격 포맷 함수를 통합.
 */

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * ISO 문자열 또는 날짜 문자열을 YYYY.MM.DD 형식으로 변환
 * @example formatDate('2026-04-13T09:00:00Z') → '2026.04.13'
 */
export function formatDate(isoOrDateStr: string): string {
  const date = new Date(isoOrDateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

/**
 * 날짜 문자열을 YYYY. M. D. (요일) 형식으로 변환
 * @example formatDateWithDay('2026-04-13') → '2026. 4. 13. (월)'
 */
export function formatDateWithDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = DAY_NAMES[date.getDay()];
  return `${y}. ${m}. ${d}. (${day})`;
}

/**
 * 숫자를 한국어 가격 형식으로 변환
 * @example formatPrice(50000) → '50,000원'
 */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString()}원`;
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 * @example getTodayStr() → '2026-04-13'
 */
export function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 상대 시간 표시 (예: '방금 전', '3분 전', '2시간 전', '어제')
 */
export function formatRelativeTime(isoStr: string): string {
  const now = new Date();
  const date = new Date(isoStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;

  return formatDate(isoStr);
}
