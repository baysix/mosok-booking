/**
 * 노션 포트폴리오 자동 생성 스크립트
 *
 * 사용법:
 *   1. https://www.notion.so/my-integrations 에서 새 Integration 생성
 *   2. 노션에서 포트폴리오를 넣을 페이지 열기 → 우측 상단 ··· → 연결 추가 → 만든 Integration 선택
 *   3. 해당 페이지 URL에서 ID 복사 (notion.so/ 뒤 32자리 hex)
 *   4. 아래 명령어로 실행:
 *      NOTION_TOKEN=secret_xxx NOTION_PAGE_ID=xxxxx node scripts/create-notion-portfolio.mjs
 */

import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const PARENT_PAGE_ID = process.env.NOTION_PAGE_ID;

if (!process.env.NOTION_TOKEN || !PARENT_PAGE_ID) {
  console.error('❌ 환경변수를 설정해주세요:');
  console.error('   NOTION_TOKEN=secret_xxx NOTION_PAGE_ID=xxxxx node scripts/create-notion-portfolio.mjs');
  process.exit(1);
}

// ── 헬퍼 함수 ──

function heading1(text) {
  return { object: 'block', type: 'heading_1', heading_1: { rich_text: [{ type: 'text', text: { content: text } }] } };
}
function heading2(text) {
  return { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: text } }] } };
}
function heading3(text) {
  return { object: 'block', type: 'heading_3', heading_3: { rich_text: [{ type: 'text', text: { content: text } }] } };
}
function paragraph(text, bold = false) {
  return {
    object: 'block', type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content: text }, annotations: { bold } }] },
  };
}
function richParagraph(segments) {
  return {
    object: 'block', type: 'paragraph',
    paragraph: {
      rich_text: segments.map(s => ({
        type: 'text',
        text: { content: s.text },
        annotations: { bold: s.bold || false, code: s.code || false, color: s.color || 'default' },
      })),
    },
  };
}
function bullet(text) {
  return {
    object: 'block', type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: [{ type: 'text', text: { content: text } }] },
  };
}
function richBullet(segments) {
  return {
    object: 'block', type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: segments.map(s => ({
        type: 'text',
        text: { content: s.text },
        annotations: { bold: s.bold || false, code: s.code || false },
      })),
    },
  };
}
function code(text, language = 'typescript') {
  return {
    object: 'block', type: 'code',
    code: { rich_text: [{ type: 'text', text: { content: text } }], language },
  };
}
function divider() {
  return { object: 'block', type: 'divider', divider: {} };
}
function callout(text, emoji = '💡') {
  return {
    object: 'block', type: 'callout',
    callout: { rich_text: [{ type: 'text', text: { content: text } }], icon: { type: 'emoji', emoji } },
  };
}
function toggle(text, children = []) {
  return {
    object: 'block', type: 'toggle',
    toggle: { rich_text: [{ type: 'text', text: { content: text } }], children },
  };
}
function checkbox(text, checked = true) {
  return {
    object: 'block', type: 'to_do',
    to_do: { rich_text: [{ type: 'text', text: { content: text } }], checked },
  };
}

/** 테이블 생성 */
function table(headers, rows) {
  const width = headers.length;
  const headerRow = {
    object: 'block', type: 'table_row',
    table_row: { cells: headers.map(h => [{ type: 'text', text: { content: h } }]) },
  };
  const dataRows = rows.map(row => ({
    object: 'block', type: 'table_row',
    table_row: { cells: row.map(cell => [{ type: 'text', text: { content: cell } }]) },
  }));
  return {
    object: 'block', type: 'table',
    table: { table_width: width, has_column_header: true, has_row_header: false, children: [headerRow, ...dataRows] },
  };
}

/** 페이지 생성 */
async function createPage(title, icon, children) {
  const page = await notion.pages.create({
    parent: { page_id: PARENT_PAGE_ID },
    icon: { type: 'emoji', emoji: icon },
    properties: { title: { title: [{ text: { content: title } }] } },
    children: children.slice(0, 100), // Notion API 100 블록 제한
  });

  // 100개 초과 시 추가 append
  if (children.length > 100) {
    for (let i = 100; i < children.length; i += 100) {
      await notion.blocks.children.append({
        block_id: page.id,
        children: children.slice(i, i + 100),
      });
    }
  }

  return page;
}

// ══════════════════════════════════════
//  각 섹션별 페이지 내용
// ══════════════════════════════════════

function buildOverview() {
  return [
    callout('무속인(점술사) 전용 예약·상담·기원 관리 플랫폼\n1인 무속인이 고객 예약, 기원 서비스, 채팅 상담, 일정 관리를 하나의 앱에서 운영할 수 있는 올인원 SaaS', '🔮'),
    divider(),

    heading2('프로젝트 정보'),
    table(
      ['항목', '내용'],
      [
        ['프로젝트명', '무속 솔로 부킹 (Musok Solo Booking)'],
        ['유형', '풀스택 웹 애플리케이션 (모바일 퍼스트)'],
        ['개발 기간', '2025.03 ~'],
        ['개발 인원', '1인 (기획·디자인·프론트·백엔드·DB)'],
        ['배포', 'Vercel'],
      ],
    ),
    divider(),

    heading2('핵심 기능'),
    heading3('고객 (User)'),
    bullet('예약 신청 (캘린더 → 시간 선택 → 상담 유형 → 결제)'),
    bullet('기원 서비스 신청 (등/초 상품, 기간별 옵션)'),
    bullet('1:1 채팅 상담'),
    bullet('예약·기원 현황 조회 & 알림'),

    heading3('무속인 (Master)'),
    bullet('예약 승인/거절/완료 + 수동 예약 등록'),
    bullet('월간 캘린더 뷰 & 시간표 관리'),
    bullet('기원 상품 CRUD & 주문 관리'),
    bullet('영업시간/휴무일 설정'),
    bullet('회원 초대 코드 & 회원 관리'),
    bullet('1:1 채팅 응대'),

    heading3('관리자 (Admin)'),
    bullet('무속인 가입 승인/거절'),
  ];
}

function buildTechStack() {
  return [
    heading2('Core Framework'),
    table(
      ['기술', '버전', '역할'],
      [
        ['Next.js', '16.2', 'App Router 기반 풀스택 프레임워크'],
        ['React', '19.0', 'UI 렌더링'],
        ['TypeScript', '5.9', '정적 타입 시스템'],
      ],
    ),
    divider(),

    heading2('상태 관리 & 데이터 페칭'),
    table(
      ['기술', '역할'],
      [
        ['TanStack React Query v5', '서버 상태 관리 (캐싱, 자동 갱신, 낙관적 업데이트)'],
        ['Zustand', '클라이언트 전역 상태 (인증 정보)'],
      ],
    ),
    divider(),

    heading2('데이터베이스 & 인증'),
    table(
      ['기술', '역할'],
      [
        ['Supabase (PostgreSQL)', '클라우드 관계형 데이터베이스'],
        ['Jose (JWT)', 'JSON Web Token 생성·검증'],
        ['bcryptjs', '비밀번호 해싱'],
      ],
    ),
    divider(),

    heading2('UI & 스타일링'),
    table(
      ['기술', '역할'],
      [
        ['Tailwind CSS', '유틸리티 퍼스트 스타일링'],
        ['Radix UI', '접근성 기반 헤드리스 UI 컴포넌트'],
        ['Lucide React', '아이콘 시스템'],
      ],
    ),
    divider(),

    heading2('외부 서비스'),
    table(
      ['기술', '역할'],
      [
        ['카카오맵 SDK', '지도 표시 & 마커'],
        ['Daum 주소 API', '주소 검색 (우편번호)'],
        ['Toss Payments', '결제 연동 (예정)'],
      ],
    ),
  ];
}

function buildArchitecture() {
  return [
    // 1. 서버리스
    heading2('1. 별도 백엔드 서버 없는 풀스택 구조'),
    callout('Express/NestJS 같은 별도 백엔드 서버 없이, Next.js API Routes가 서버 역할을 수행합니다.', '⚡'),
    code(
`┌─────────────────────────────────────────────┐
│                Next.js (Vercel)              │
│                                             │
│  ┌──────────────┐    ┌──────────────────┐   │
│  │  프론트엔드   │───▶│  API Routes      │   │
│  │  (React)     │◀───│  (/api/*)        │   │
│  │  CSR + SSR   │    │  서버리스 함수    │   │
│  └──────────────┘    └───────┬──────────┘   │
│                              │              │
└──────────────────────────────┼──────────────┘
                               │ HTTPS
                    ┌──────────▼──────────┐
                    │  Supabase           │
                    │  (PostgreSQL)       │
                    └─────────────────────┘`, 'plain text'),
    bullet('각 API Route는 Vercel에서 서버리스 함수(Lambda)로 자동 배포'),
    bullet('프론트엔드와 백엔드가 하나의 프로젝트에서 관리 → 타입 공유, 배포 단순화'),
    bullet('별도 서버 운영 비용 0원 (Vercel 무료 티어)'),
    divider(),

    // 2. JWT 인증
    heading2('2. JWT 기반 인증 시스템'),
    code(
`[회원가입/로그인]
    │
    ▼
API Route에서 비밀번호 검증 (bcryptjs)
    │
    ▼
JWT 토큰 생성 (jose, HS256)
    │
    ▼
HTTP-only 쿠키로 토큰 저장 (auth-token)
    │  ✅ JavaScript 접근 불가 → XSS 방어
    │  ✅ sameSite: 'lax' → CSRF 방어
    │  ✅ secure: true (프로덕션) → HTTPS 강제
    ▼
매 요청마다 Middleware에서 토큰 검증
    │
    ▼
역할(role) 기반 접근 제어
    ├── user  → /home, /reserve, ...
    ├── master → /dashboard, /calendar, ...
    └── admin → /masters/approval`, 'plain text'),
    richBullet([
      { text: '세션 갱신 최적화: ', bold: true },
      { text: '토큰 잔여 < 6일일 때만 갱신 (불필요한 쿠키 쓰기 최소화)' },
    ]),
    richBullet([
      { text: 'server-only 모듈: ', bold: true },
      { text: '서버 전용 코드가 클라이언트 번들에 포함되는 것을 빌드 타임에 차단' },
    ]),
    divider(),

    // 3. 3-Layer
    heading2('3. 3-Layer 아키텍처 (관심사 분리)'),
    code(
`┌─────────────────────────────────────────┐
│  UI Layer (페이지 & 컴포넌트)            │
│  page.tsx, _components/*.tsx            │
│  └── React Query 훅 호출               │
├─────────────────────────────────────────┤
│  Service Layer (API 호출 추상화)         │
│  services/*.service.ts                  │
│  └── apiClient.get/post/patch/delete    │
├─────────────────────────────────────────┤
│  Data Layer (DB 직접 접근)              │
│  lib/data/*-data.ts                     │
│  └── Supabase 쿼리 + 매퍼              │
└─────────────────────────────────────────┘`, 'plain text'),
    paragraph('예시 — 예약 생성 데이터 흐름:', true),
    code(
`사용자 "예약하기" 클릭
  → useCreateReservation() (React Query mutation)
    → reservationService.createReservation(data)
      → apiClient.post('/api/reservations', data)
        → POST /api/reservations (API Route)
          → reservationsData.createReservation() (Supabase INSERT)
          → notificationsData.create() (알림 생성)
        ← 201 Created
      ← 응답 파싱
    ← 캐시 무효화 (invalidateQueries)
  → UI 자동 갱신`, 'plain text'),
    divider(),

    // 4. React Query
    heading2('4. React Query 서버 상태 관리'),
    table(
      ['기능', '설명'],
      [
        ['자동 캐싱', 'staleTime 30초, 같은 데이터 중복 요청 방지'],
        ['자동 갱신', '윈도우 포커스 복귀 시 refetch (모바일 탭 전환 대응)'],
        ['캐시 무효화', 'mutation 성공 시 관련 쿼리 자동 refetch'],
        ['로딩/에러 상태', 'isLoading, isError 자동 관리'],
        ['Query Key 팩토리', '일관된 캐시 키 관리 패턴'],
      ],
    ),
    code(
`// Query Key 팩토리 패턴
const reservationKeys = {
  all: ['reservations'],
  myList: (status?) => ['reservations', 'my', status],
  calendar: (year, month) => ['reservations', 'calendar', year, month],
};

// mutation 성공 시 캐시 자동 무효화
useMutation({
  mutationFn: createReservation,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: reservationKeys.all });
  },
});`, 'typescript'),
    divider(),

    // 5. App Router
    heading2('5. Next.js App Router 라우팅 설계'),
    code(
`src/app/
├── (public)/    ← 인증 불필요
├── (auth)/      ← 로그인/회원가입 (인증 시 리다이렉트)
├── (user)/      ← 고객 전용 (role: user) + 하단 탭바
├── (master)/    ← 무속인 전용 (role: master) + 마스터 탭바
├── (admin)/     ← 관리자 전용 (role: admin)
└── api/         ← 서버리스 API`, 'plain text'),
    richBullet([
      { text: 'Route Group () 활용: ', bold: true },
      { text: 'URL에 포함되지 않으면서 역할별 layout.tsx 분리' },
    ]),
    richBullet([
      { text: 'Middleware: ', bold: true },
      { text: '역할 기반 접근 제어, 미가입 유저 /join 리다이렉트' },
    ]),
    divider(),

    // 6. API Client
    heading2('6. 통합 API Client'),
    code(
`// 모든 서비스가 공유하는 단일 API 클라이언트
class ApiError extends Error {
  constructor(public status: number, message: string) { ... }
}

const apiClient = {
  get<T>(url): Promise<T>,
  post<T>(url, body): Promise<T>,
  patch<T>(url, body): Promise<T>,
  delete(url): Promise<void>,
};

// 에러 처리 한 곳에서 통합 관리
// 모든 서비스 파일이 동일한 인터페이스 사용`, 'typescript'),
    divider(),

    // 7. 채팅
    heading2('7. 실시간 채팅 (Polling)'),
    code(
`현재: React Query refetchInterval (5초 간격 폴링)
┌─────────┐  GET /messages (5초마다)  ┌──────────┐
│  Client  │◀──────────────────────────│  Server  │
└─────────┘                           └──────────┘

향후: Supabase Realtime 전환 가능 (WebSocket)`, 'plain text'),
    bullet('React Query의 refetchInterval: 5000 옵션으로 간단하게 구현'),
    bullet('Supabase Realtime 기능이 내장되어 있어 WebSocket 전환 경로 확보'),
    divider(),

    // 8. Zustand
    heading2('8. 상태 관리 역할 분담'),
    table(
      ['도구', '담당 영역', '예시'],
      [
        ['Zustand', '클라이언트 전역 상태', '로그인 여부, 유저 정보, masterId'],
        ['React Query', '서버 데이터', '예약 목록, 채팅 메시지, 기원 상품'],
      ],
    ),
    bullet('Zustand: Redux 대비 보일러플레이트 90% 감소, 단 하나의 파일로 관리'),
  ];
}

function buildPages() {
  return [
    heading2('고객 (User) 페이지'),
    divider(),

    heading3('/home — 홈'),
    bullet('소속된 무속인 정보 표시 (이름, 전문 분야, 프로필 이미지)'),
    bullet('카카오맵으로 무속인 위치 표시'),
    bullet('빠른 예약 / 기원 신청 바로가기'),
    bullet('알림 목록 (예약 승인, 거절 등)'),

    heading3('/reserve — 예약 신청'),
    bullet('캘린더 날짜 선택 → 시간대 선택 (09:00~23:00)'),
    bullet('이미 예약된 시간 비활성화 (실시간 가용 슬롯 조회)'),
    bullet('상담 유형 선택 (굿, 사주, 타로, 궁합, 작명 등)'),
    bullet('소요 시간 선택 (1~14시간, 종일)'),
    bullet('인원수, 메모, 자동 상담료 계산'),

    heading3('/reservations — 내 예약 목록'),
    bullet('상태별 필터 (전체 / 대기 / 확정 / 완료 / 취소)'),
    bullet('예약 카드: 날짜, 시간, 상담유형, 상태 배지'),
    bullet('대기 중 예약 취소 기능'),

    heading3('/prayer — 기원 서비스'),
    bullet('진행 중인 기원 표시 (촛불/연등 CSS 애니메이션)'),
    bullet('남은 일수, 진행률 프로그레스 바'),
    bullet('기원 신청 내역 목록'),

    heading3('/prayer/apply — 기원 신청'),
    bullet('무속인 등록 기원 상품 목록 (등/초 카테고리)'),
    bullet('상품 선택 → 옵션(기간/가격) 선택'),
    bullet('대상자, 기원 내용 입력'),

    heading3('/chat — 채팅'),
    bullet('1:1 채팅방 리스트, 안읽은 메시지 배지'),
    bullet('실시간 메시지 (5초 폴링)'),
    bullet('말풍선 UI (내 메시지 / 상대 메시지 구분)'),

    heading3('/profile — 내 프로필'),
    bullet('이름, 이메일, 전화번호 수정'),
    bullet('로그아웃'),

    divider(),
    heading2('무속인 (Master) 페이지'),
    divider(),

    heading3('/dashboard — 대시보드'),
    bullet('오늘의 예약 건수, 대기 중 예약'),
    bullet('이번 달 통계 (총 예약, 완료, 매출)'),
    bullet('미니 캘린더 (예약 있는 날 표시)'),

    heading3('/calendar — 캘린더'),
    bullet('월간 캘린더 뷰 (날짜별 예약 건수 점 표시)'),
    bullet('날짜 클릭 → 시간표 (09:00~23:00) 예약 블록 시각화'),
    bullet('빈 시간대 클릭 → 수동 예약 등록 모달'),
    bullet('예약 블록 클릭 → 상세 보기 + 상태 변경'),

    heading3('/master-reservations — 예약 관리'),
    bullet('전체 예약 리스트 (카드 형태)'),
    bullet('상태별 필터 탭 (전체/대기/확정/완료/취소·거절)'),
    bullet('대기 → 승인/거절, 확정 → 완료 처리'),
    bullet('온라인/수동 예약 구분 배지'),

    heading3('/prayer-manage — 기원 서비스 관리'),
    bullet('상품 설정 탭: 기원 상품 CRUD (카테고리, 옵션별 기간·가격)'),
    bullet('기원 현황 탭: 주문 목록, 상태 필터, 진행률 표시'),
    bullet('수동 기원 등록 (회원 검색 → 상품·옵션 선택)'),

    heading3('/schedule — 일정 관리'),
    bullet('영업 시간 탭: 요일별 시작~종료 시간, 휴무일 토글'),
    bullet('휴무일 탭: 특정 날짜 휴무 등록/삭제 (사유 입력)'),

    heading3('/members — 회원 관리'),
    bullet('소속 회원 목록 (이름, 이메일, 가입일)'),
    bullet('회원 내보내기 (탈퇴)'),

    heading3('/join-codes — 초대 코드'),
    bullet('초대 코드 생성 (최대 사용 횟수)'),
    bullet('활성/비활성 코드 목록, 코드 복사'),

    heading3('/master-profile — 프로필 편집'),
    bullet('상호명, 전문 분야, 경력, 소개글'),
    bullet('지역, 주소 (다음 주소 검색 API)'),
    bullet('기본 상담료, 전화번호'),
    bullet('정산 계좌 (은행, 계좌번호, 예금주)'),
    bullet('프로필/배경 이미지 업로드'),

    divider(),
    heading2('관리자 (Admin) 페이지'),
    divider(),

    heading3('/masters/approval — 무속인 승인'),
    bullet('가입 신청 무속인 목록'),
    bullet('상세 정보 확인 후 승인/거절'),
  ];
}

function buildApiEndpoints() {
  return [
    heading2('인증 (Auth)'),
    table(
      ['Method', 'Endpoint', '설명'],
      [
        ['POST', '/api/auth/signup', '회원가입'],
        ['POST', '/api/auth/login', '로그인'],
        ['POST', '/api/auth/logout', '로그아웃'],
        ['GET', '/api/auth/me', '내 정보 조회'],
        ['PATCH', '/api/auth/me', '내 정보 수정'],
      ],
    ),
    divider(),

    heading2('예약 (Reservations)'),
    table(
      ['Method', 'Endpoint', '설명'],
      [
        ['GET', '/api/reservations', '예약 목록'],
        ['POST', '/api/reservations', '예약 생성'],
        ['PATCH', '/api/reservations/[id]', '예약 상태 변경'],
        ['GET', '/api/reservations/available-slots', '가용 시간 조회'],
        ['GET', '/api/masters/me/reservations/calendar', '월간 캘린더 데이터'],
        ['GET', '/api/masters/me/reservations/day', '일별 예약 조회'],
        ['POST', '/api/masters/me/reservations/manual', '수동 예약 등록'],
      ],
    ),
    divider(),

    heading2('기원 서비스 (Prayer)'),
    table(
      ['Method', 'Endpoint', '설명'],
      [
        ['GET', '/api/prayer-products', '기원 상품 목록 (고객용)'],
        ['GET', '/api/masters/me/prayer-products', '내 기원 상품 (마스터용)'],
        ['POST', '/api/masters/me/prayer-products', '기원 상품 생성'],
        ['PATCH', '/api/masters/me/prayer-products/[id]', '기원 상품 수정'],
        ['DELETE', '/api/masters/me/prayer-products/[id]', '기원 상품 삭제'],
        ['GET', '/api/prayer-orders', '내 기원 주문 (고객용)'],
        ['POST', '/api/prayer-orders', '기원 신청'],
        ['GET', '/api/masters/me/prayer-orders', '기원 주문 (마스터용)'],
        ['POST', '/api/masters/me/prayer-orders', '수동 기원 등록'],
        ['PATCH', '/api/masters/me/prayer-orders/[id]', '기원 주문 상태 변경'],
      ],
    ),
    divider(),

    heading2('채팅 (Chat)'),
    table(
      ['Method', 'Endpoint', '설명'],
      [
        ['GET', '/api/chat/rooms', '채팅방 목록'],
        ['POST', '/api/chat/rooms', '채팅방 생성/조회'],
        ['GET', '/api/chat/rooms/[roomId]/messages', '메시지 조회'],
        ['POST', '/api/chat/rooms/[roomId]/messages', '메시지 전송'],
        ['GET', '/api/chat/unread', '안읽은 메시지 수'],
      ],
    ),
    divider(),

    heading2('일정 (Schedule)'),
    table(
      ['Method', 'Endpoint', '설명'],
      [
        ['GET', '/api/masters/me/schedule', '영업시간 + 휴무일'],
        ['PUT', '/api/masters/me/schedule', '영업시간 저장'],
        ['POST', '/api/masters/me/schedule/off-days', '휴무일 추가'],
        ['DELETE', '/api/masters/me/schedule/off-days', '휴무일 삭제'],
      ],
    ),
    divider(),

    heading2('회원 & 초대 (Members & Join Codes)'),
    table(
      ['Method', 'Endpoint', '설명'],
      [
        ['GET', '/api/masters/me/members', '회원 목록'],
        ['DELETE', '/api/masters/me/members/[id]', '회원 내보내기'],
        ['GET', '/api/masters/me/join-codes', '초대 코드 목록'],
        ['POST', '/api/masters/me/join-codes', '초대 코드 생성'],
        ['PATCH', '/api/masters/me/join-codes/[id]', '코드 비활성화'],
        ['POST', '/api/join', '초대 코드로 가입'],
      ],
    ),
    divider(),

    heading2('알림 & 마스터'),
    table(
      ['Method', 'Endpoint', '설명'],
      [
        ['GET', '/api/notifications', '알림 목록'],
        ['PATCH', '/api/notifications/[id]', '알림 읽음'],
        ['PATCH', '/api/notifications/read-all', '전체 읽음'],
        ['GET', '/api/masters/me', '마스터 프로필 조회'],
        ['PATCH', '/api/masters/me', '마스터 프로필 수정'],
        ['GET', '/api/masters/my-master', '소속 무속인 조회'],
        ['PATCH', '/api/admin/masters/[id]', '무속인 승인/거절'],
      ],
    ),
  ];
}

function buildDbSchema() {
  return [
    code(
`users ─────────┬── master_memberships ──── masters
               │                            │
               │                     ┌──────┴───────┐
               │                     │              │
          reservations          prayer_products  master_weekly_hours
               │                     │              master_off_days
               │              prayer_product_options
               │                     │
          notifications        prayer_orders
               │
          chat_rooms ── messages
               │
          join_codes`, 'plain text'),
    divider(),

    heading2('테이블 상세'),
    table(
      ['테이블', '역할', '주요 필드'],
      [
        ['users', '사용자', 'email, password_hash, role(user/master/admin)'],
        ['masters', '무속인 프로필', 'specialties, region, basePrice, bankInfo'],
        ['reservations', '예약', 'date, timeSlot, duration, status, source'],
        ['prayer_products', '기원 상품', 'category(등/초), name, options'],
        ['prayer_orders', '기원 주문', 'beneficiary, wish, status, dates'],
        ['chat_rooms', '채팅방', 'userId, masterId, lastMessage'],
        ['messages', '메시지', 'content, type(text/image/system), isRead'],
        ['master_memberships', '회원 연결', 'userId ↔ masterId'],
        ['join_codes', '초대 코드', 'code, maxUses, currentUses, status'],
        ['master_weekly_hours', '영업 시간', 'dayOfWeek, startTime, endTime'],
        ['master_off_days', '휴무일', 'date, reason'],
        ['notifications', '알림', 'type, title, message, isRead'],
      ],
    ),
  ];
}

function buildProjectStructure() {
  return [
    code(
`src/
├── app/                    # 페이지 & API 라우트
│   ├── (public)/           # 공개 페이지
│   ├── (auth)/             # 인증 페이지 (login, signup, join)
│   ├── (user)/             # 고객 페이지 (8개)
│   ├── (master)/           # 무속인 페이지 (10개)
│   ├── (admin)/            # 관리자 페이지 (1개)
│   └── api/                # API 엔드포인트 (30+개)
├── components/             # 재사용 컴포넌트
│   ├── ui/                 # Radix 기반 기본 UI
│   ├── common/             # 공통 (모달, 탭, 스켈레톤 등)
│   ├── chat/               # 채팅 관련
│   ├── prayer/             # 기원 관련 (애니메이션 포함)
│   ├── booking/            # 예약 관련
│   └── maps/               # 지도
├── hooks/                  # 커스텀 훅
│   └── queries/            # React Query 훅 (9개 모듈)
├── services/               # API 호출 서비스 (8개)
├── lib/                    # 유틸리티
│   ├── auth/               # JWT, 사용자 DB
│   ├── supabase/           # Supabase 클라이언트
│   ├── data/               # 데이터 접근 레이어 (8개)
│   └── utils/              # 포맷, 필터
├── types/                  # TypeScript 타입 정의 (10개)
├── stores/                 # Zustand 스토어
├── providers/              # React Query Provider
├── constants/              # 상수 (라우트, 지역 등)
└── middleware.ts           # 인증 & 라우트 가드`, 'plain text'),
  ];
}

function buildDecisions() {
  return [
    heading2('기술적 의사결정'),
    table(
      ['결정', '이유'],
      [
        ['Next.js API Routes (서버리스)', '별도 서버 없이 풀스택 → 비용 절감, 배포 단순화'],
        ['Supabase (PostgreSQL)', 'Firebase 대비 SQL 기반 → 복잡한 관계형 쿼리 가능'],
        ['JWT + HTTP-only 쿠키', '세션 서버 불필요 + XSS/CSRF 방어'],
        ['React Query', 'useState 서버 상태 관리의 캐싱·중복요청 문제 해결'],
        ['Zustand (vs Redux)', '인증 상태만 관리하므로 경량 솔루션으로 충분'],
        ['Tailwind CSS', '컴포넌트별 스타일 파일 불필요 + 빠른 UI 개발'],
        ['Route Groups ()', 'URL 오염 없이 역할별 레이아웃·접근제어 분리'],
        ['서비스 레이어 패턴', '컴포넌트 ↔ API 간 관심사 분리'],
        ['폴링 (채팅)', '초기 구현 비용 최소화, Realtime 전환 경로 확보'],
      ],
    ),
    divider(),

    heading2('보안 체크리스트'),
    checkbox('비밀번호 bcrypt 해싱 (salt rounds: 10)'),
    checkbox('JWT HTTP-only 쿠키 (XSS 방어)'),
    checkbox('sameSite: lax (CSRF 방어)'),
    checkbox('프로덕션 secure: true (HTTPS 강제)'),
    checkbox('server-only 모듈 (서버 코드 클라이언트 노출 차단)'),
    checkbox('Middleware 역할 기반 접근 제어'),
    checkbox('API Route별 인증 검증'),
    checkbox('환경변수로 시크릿 키 관리'),
  ];
}

// ══════════════════════════════════════
//  메인 실행
// ══════════════════════════════════════

async function main() {
  console.log('🚀 노션 포트폴리오 생성 시작...\n');

  try {
    // 1. 프로젝트 개요
    console.log('  📝 1/8 프로젝트 개요...');
    await createPage('프로젝트 개요', '📋', buildOverview());

    // 2. 기술 스택
    console.log('  📝 2/8 기술 스택...');
    await createPage('기술 스택', '🛠️', buildTechStack());

    // 3. 아키텍처 & 기술 상세
    console.log('  📝 3/8 아키텍처 & 기술 상세...');
    await createPage('아키텍처 & 기술 상세', '🏗️', buildArchitecture());

    // 4. 페이지별 기능 설명
    console.log('  📝 4/8 페이지별 기능 설명...');
    await createPage('페이지별 기능 설명', '📱', buildPages());

    // 5. API 엔드포인트
    console.log('  📝 5/8 API 엔드포인트...');
    await createPage('API 엔드포인트', '🔌', buildApiEndpoints());

    // 6. DB 스키마
    console.log('  📝 6/8 DB 스키마...');
    await createPage('DB 스키마', '🗄️', buildDbSchema());

    // 7. 프로젝트 구조
    console.log('  📝 7/8 프로젝트 구조...');
    await createPage('프로젝트 구조', '📁', buildProjectStructure());

    // 8. 기술적 의사결정 & 보안
    console.log('  📝 8/8 기술적 의사결정 & 보안...');
    await createPage('기술적 의사결정 & 보안', '⚖️', buildDecisions());

    console.log('\n✅ 완료! 노션에서 확인해주세요.');
  } catch (err) {
    console.error('\n❌ 에러 발생:', err.message);
    if (err.code === 'object_not_found') {
      console.error('   → 페이지 ID가 잘못되었거나, Integration이 해당 페이지에 연결되지 않았습니다.');
      console.error('   → 노션 페이지 → ··· → 연결 추가 → Integration 선택');
    }
    if (err.code === 'unauthorized') {
      console.error('   → NOTION_TOKEN이 잘못되었습니다. https://www.notion.so/my-integrations 확인');
    }
    process.exit(1);
  }
}

main();
