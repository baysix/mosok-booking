// 한국어 욕설 필터
// 기본 욕설 + 변형(공백, 특수문자 삽입) 대응

const PROFANITY_WORDS = [
  '시발', '씨발', '시바', '씨바', '씨팔', '시팔',
  '개새끼', '개세끼', '개쉐끼', '개색기', '개색끼',
  '병신', '븅신', '빙신',
  '지랄', '찌랄',
  '미친놈', '미친년', '미친새끼',
  '꺼져', '닥쳐',
  '존나', '졸라', '존니', 'ㅈㄴ',
  '새끼', '세끼', '쉐끼',
  '년', '놈',
  '닥치', '엿먹',
  '개같', '개놈', '개년',
  '썅', '쌍',
  'ㅅㅂ', 'ㅂㅅ', 'ㅆㅂ', 'ㄱㅅㄲ', 'ㅈㄹ', 'ㅁㅊ',
  'fuck', 'shit', 'damn', 'bitch', 'asshole',
];

// 공백/특수문자 제거 + 정규화
function normalize(text: string): string {
  return text
    .replace(/[\s\-_.,!@#$%^&*()+=~`'"<>?/\\|{}\[\]:;]/g, '')
    .toLowerCase();
}

export function containsProfanity(text: string): boolean {
  if (!text || text.trim().length === 0) return false;

  const normalized = normalize(text);

  for (const word of PROFANITY_WORDS) {
    const normalizedWord = normalize(word);
    if (normalized.includes(normalizedWord)) {
      return true;
    }
  }

  return false;
}
