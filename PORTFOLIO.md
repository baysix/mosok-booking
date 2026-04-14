# 무속 솔로 부킹 — 포트폴리오

> 무속인(점술사) 전용 예약·상담·기원 관리 플랫폼
> 1인 무속인이 고객 예약, 기원 서비스, 채팅 상담, 일정 관리를 하나의 앱에서 운영할 수 있는 올인원 SaaS

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | 무속 솔로 부킹 (Musok Solo Booking) |
| **유형** | 풀스택 웹 애플리케이션 (모바일 퍼스트) |
| **개발 기간** | 2025.03 ~ |
| **개발 인원** | 1인 (기획·디자인·프론트·백엔드·DB) |
| **배포** | Vercel |

### 핵심 기능 요약
- **고객(User)**: 예약 신청, 기원 서비스 신청, 1:1 채팅, 예약/기원 현황 조회
- **무속인(Master)**: 예약 승인/거절/완료, 수동 예약 등록, 캘린더 관리, 기원 상품 생성·주문 관리, 일정(영업시간·휴무) 설정, 회원 초대·관리, 채팅 응대
- **관리자(Admin)**: 무속인 가입 승인/거절

---

## 기술 스택

### Core Framework
| 기술 | 버전 | 역할 |
|------|------|------|
| **Next.js** | 16.2 | App Router 기반 풀스택 프레임워크 |
| **React** | 19.0 | UI 렌더링 |
| **TypeScript** | 5.9 | 정적 타입 시스템 |

### 상태 관리 & 데이터 페칭
| 기술 | 역할 |
|------|------|
| **TanStack React Query** v5 | 서버 상태 관리 (캐싱, 자동 갱신, 낙관적 업데이트) |
| **Zustand** | 클라이언트 전역 상태 (인증 정보) |

### 데이터베이스 & 인증
| 기술 | 역할 |
|------|------|
| **Supabase** (PostgreSQL) | 클라우드 데이터베이스 |
| **Jose** (JWT) | JSON Web Token 생성·검증 |
| **bcryptjs** | 비밀번호 해싱 |

### UI & 스타일링
| 기술 | 역할 |
|------|------|
| **Tailwind CSS** | 유틸리티 퍼스트 스타일링 |
| **Radix UI** | 접근성 기반 헤드리스 UI 컴포넌트 |
| **Lucide React** | 아이콘 시스템 |

### 외부 서비스
| 기술 | 역할 |
|------|------|
| **카카오맵 SDK** | 지도 표시 & 마커 |
| **Daum 주소 API** | 주소 검색 (우편번호) |
| **Toss Payments** | 결제 연동 (예정) |

---

## 아키텍처 & 기술 상세

### 1. 별도 백엔드 서버 없는 풀스택 구조 (Serverless API)

```
┌─────────────────────────────────────────────┐
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
                    │  클라우드 DB        │
                    └─────────────────────┘
```

**핵심 포인트:**
- Express/NestJS 같은 별도 백엔드 서버 없이, Next.js의 **API Routes** (`/api/*`)가 서버 역할 수행
- 각 API Route는 Vercel에서 **서버리스 함수(Lambda)**로 자동 배포
- 프론트엔드와 백엔드가 **하나의 프로젝트**에서 관리 → 타입 공유, 배포 단순화
- 별도 서버 운영 비용 0원 (Vercel 무료 티어)

---

### 2. JWT 기반 인증 시스템 (서버리스 환경)

```
[회원가입/로그인]
    │
    ▼
API Route에서 비밀번호 검증 (bcryptjs)
    │
    ▼
JWT 토큰 생성 (jose 라이브러리, HS256)
    │
    ▼
HTTP-only 쿠키로 토큰 저장 (auth-token)
    │  ✅ JavaScript로 접근 불가 → XSS 공격 방어
    │  ✅ sameSite: 'lax' → CSRF 공격 방어
    │  ✅ secure: true (프로덕션) → HTTPS 강제
    ▼
매 요청마다 Middleware에서 토큰 검증
    │
    ▼
역할(role) 기반 접근 제어
    ├── user → /home, /reserve, /reservations ...
    ├── master → /dashboard, /calendar, /schedule ...
    └── admin → /masters/approval
```

**세션 갱신 최적화:**
- 토큰 만료 7일 설정
- Middleware에서 **잔여 기간 < 6일일 때만** 토큰 갱신
- 매 요청마다 갱신하지 않아 **불필요한 쿠키 쓰기 최소화**

**server-only 모듈:**
- JWT 생성/검증 코드에 `import 'server-only'` 적용
- 서버 전용 코드가 클라이언트 번들에 포함되는 것을 **빌드 타임에 차단**

---

### 3. 3-Layer 아키텍처 (관심사 분리)

```
┌─────────────────────────────────────────┐
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
└─────────────────────────────────────────┘
```

**예시 — 예약 생성 데이터 흐름:**
```
사용자 "예약하기" 클릭
  → useCreateReservation() (React Query mutation)
    → reservationService.createReservation(data) (Service)
      → apiClient.post('/api/reservations', data) (API Client)
        → POST /api/reservations (API Route)
          → reservationsData.createReservation() (Data Layer)
            → Supabase INSERT → PostgreSQL
          → notificationsData.create() (알림 생성)
        ← 201 Created + 예약 데이터 반환
      ← 응답 파싱
    ← 캐시 무효화 (invalidateQueries)
  → UI 자동 갱신 (리스트 refetch)
```

---

### 4. React Query 서버 상태 관리

| 기능 | 설명 |
|------|------|
| **자동 캐싱** | staleTime 30초, 같은 데이터 중복 요청 방지 |
| **자동 갱신** | 윈도우 포커스 복귀 시 refetch (모바일 탭 전환 대응) |
| **캐시 무효화** | mutation 성공 시 관련 쿼리 자동 refetch |
| **로딩/에러 상태** | `isLoading`, `isError` 자동 관리 |
| **Query Key 팩토리** | 일관된 캐시 키 관리 패턴 |

```typescript
// Query Key 팩토리 패턴
const reservationKeys = {
  all: ['reservations'],
  myList: (status?) => ['reservations', 'my', status],
  masterList: (status?) => ['reservations', 'master', status],
  calendar: (year, month) => ['reservations', 'calendar', year, month],
};

// mutation 성공 시 관련 캐시 자동 무효화
useMutation({
  mutationFn: createReservation,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: reservationKeys.all });
  },
});
```

---

### 5. Next.js App Router 라우팅 설계

```
src/app/
├── (public)/          ← 인증 불필요
├── (auth)/            ← 로그인/회원가입 (인증 시 리다이렉트)
├── (user)/            ← 고객 전용 (role: user)
│   └── layout.tsx     ← 하단 탭바 포함
├── (master)/          ← 무속인 전용 (role: master)
│   └── layout.tsx     ← 마스터 하단 탭바 포함
├── (admin)/           ← 관리자 전용 (role: admin)
└── api/               ← 서버리스 API
```

**Route Group `()` 활용:**
- 괄호 폴더는 **URL에 포함되지 않음** → `/home` (not `/(user)/home`)
- 역할별 **layout.tsx 분리** → 고객용 탭바 vs 마스터용 탭바
- Middleware에서 **역할 기반 접근 제어** 자동 적용

---

### 6. 통합 API Client

```typescript
// 모든 서비스가 공유하는 단일 API 클라이언트
class ApiError extends Error {
  constructor(public status: number, message: string) { ... }
}

const apiClient = {
  get<T>(url): Promise<T>,
  post<T>(url, body): Promise<T>,
  patch<T>(url, body): Promise<T>,
  delete(url): Promise<void>,
};
```

**장점:**
- 에러 처리 로직 **한 곳에서 통합 관리**
- 모든 서비스 파일이 동일한 인터페이스 사용
- `ApiError` 클래스로 HTTP 상태 코드 기반 에러 구분

---

### 7. 컴포넌트 설계 패턴

**공통 컴포넌트 (재사용):**
| 컴포넌트 | 용도 |
|----------|------|
| `BaseModal` | 모바일 바텀시트 / 데스크톱 센터 모달 통합 |
| `StatusTabs` | 제네릭 상태 필터 탭 (예약 상태, 주문 상태 등) |
| `EmptyState` | 빈 상태 안내 (아이콘 + 메시지 + 액션 버튼) |
| `ListSkeleton` | 로딩 스켈레톤 (card / row / simple 변형) |
| `Toast` | 토스트 알림 (success / error / info) |

**페이지 분리 패턴:**
```
page.tsx (메인 로직 + 레이아웃)
└── _components/
    ├── SomeModal.tsx      ← 모달 분리
    ├── SomeTab.tsx        ← 탭 콘텐츠 분리
    └── SomePicker.tsx     ← 입력 위젯 분리
```
- `_components/` 폴더는 Next.js가 라우트로 인식하지 않는 **프라이빗 폴더**
- 해당 페이지에서만 사용하는 컴포넌트를 페이지 옆에 배치

---

### 8. Zustand 인증 상태 관리

```typescript
// 전역 인증 스토어 (authStore.ts)
interface AuthState {
  user: User | null;
  masterId: string | null;
  isLoading: boolean;
  initialized: boolean;  // 초기 인증 확인 완료 여부
}
```

**왜 Zustand인가?**
- Redux 대비 **보일러플레이트 90% 감소**
- 단 하나의 파일로 전역 상태 관리
- React Query와 역할 분담:
  - Zustand → **인증 상태** (로그인 여부, 유저 정보)
  - React Query → **서버 데이터** (예약, 주문, 채팅 등)

---

### 9. 실시간 채팅 (Polling → Realtime 전환 가능)

```
현재: 5초 간격 폴링
┌─────────┐  GET /messages (5초마다)  ┌──────────┐
│  Client  │◀──────────────────────────│  Server  │
└─────────┘                           └──────────┘

향후: Supabase Realtime 전환 가능
┌─────────┐  WebSocket (실시간)       ┌──────────┐
│  Client  │◀═════════════════════════│ Supabase │
└─────────┘                           └──────────┘
```

- React Query의 `refetchInterval: 5000` 옵션으로 구현
- Supabase에 Realtime 기능이 내장되어 있어 향후 WebSocket 전환 용이

---

### 10. DB 스키마 설계 (13개 테이블)

```
users ─────────┬── master_memberships ──── masters
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
          join_codes
```

| 테이블 | 역할 | 주요 필드 |
|--------|------|-----------|
| **users** | 사용자 | email, password_hash, role(user/master/admin) |
| **masters** | 무속인 프로필 | specialties, region, basePrice, bankInfo |
| **reservations** | 예약 | date, timeSlot, duration, status, source(online/manual) |
| **prayer_products** | 기원 상품 | category(등/초), name, options |
| **prayer_orders** | 기원 주문 | beneficiary, wish, status, startDate, endDate |
| **chat_rooms** | 채팅방 | userId, masterId, lastMessage |
| **messages** | 메시지 | content, type(text/image/system), isRead |
| **master_memberships** | 회원 연결 | userId ↔ masterId |
| **join_codes** | 초대 코드 | code, maxUses, currentUses, status |
| **master_weekly_hours** | 영업 시간 | dayOfWeek, startTime, endTime |
| **master_off_days** | 휴무일 | date, reason |
| **notifications** | 알림 | type, title, message, isRead |

---

## 페이지별 기능 설명

### 고객(User) 페이지

#### `/home` — 홈
- 소속된 무속인 정보 표시 (이름, 전문 분야, 프로필 이미지)
- 카카오맵으로 무속인 위치 표시
- 빠른 예약 / 기원 신청 바로가기
- 알림 목록 (예약 승인, 거절 등)

#### `/reserve` — 예약 신청
- 캘린더 날짜 선택 → 시간대 선택 (09:00~23:00, 1시간 단위)
- 이미 예약된 시간은 비활성화 (실시간 가용 슬롯 조회)
- 상담 유형 선택 (굿, 사주, 타로 등)
- 소요 시간 선택 (1~14시간, 종일)
- 인원수, 메모 입력
- 자동 상담료 계산 (기본가 × 시간)

#### `/reservations` — 내 예약 목록
- 상태별 필터 (전체 / 대기 / 확정 / 완료 / 취소)
- 예약 카드: 날짜, 시간, 상담유형, 상태 배지
- 대기 중 예약 취소 기능

#### `/prayer` — 기원 서비스
- 진행 중인 기원 표시 (촛불/연등 애니메이션)
- 남은 일수, 진행률 프로그레스 바
- 기원 신청 내역 목록

#### `/prayer/apply` — 기원 신청
- 무속인이 등록한 기원 상품 목록 (등/초 카테고리)
- 상품 선택 → 옵션(기간/가격) 선택
- 대상자, 기원 내용 입력

#### `/chat` — 채팅 목록
- 1:1 채팅방 리스트
- 마지막 메시지, 읽지 않은 메시지 수 표시
- 탭바에 전체 안읽은 메시지 배지

#### `/chat/[roomId]` — 채팅방
- 실시간 메시지 (5초 폴링)
- 텍스트 메시지 전송
- 말풍선 UI (내 메시지 / 상대 메시지 구분)

#### `/profile` — 내 프로필
- 이름, 이메일, 전화번호 수정
- 로그아웃

---

### 무속인(Master) 페이지

#### `/dashboard` — 대시보드
- 오늘의 예약 건수, 대기 중 예약
- 이번 달 통계 (총 예약, 완료, 매출)
- 미니 캘린더 (예약 있는 날 표시)
- 최근 예약 리스트

#### `/calendar` — 캘린더
- 월간 캘린더 뷰 (날짜별 예약 건수 점 표시)
- 날짜 클릭 → 해당일 시간표 (09:00~23:00)
- 시간대별 예약 현황 시각화 (예약 블록)
- 빈 시간대 클릭 → 수동 예약 등록 모달
- 예약 블록 클릭 → 상세 보기 + 상태 변경

#### `/master-reservations` — 예약 관리
- 전체 예약 리스트 (카드 형태)
- 상태별 필터 탭 (전체/대기/확정/완료/취소·거절)
- 대기 중: 승인/거절 버튼
- 확정: 상담 완료 처리 버튼
- 온라인/수동 예약 구분 배지
- 수동 예약 등록 모달

#### `/prayer-manage` — 기원 서비스 관리
- **상품 설정 탭**: 기원 상품 CRUD (이름, 설명, 카테고리, 옵션별 기간·가격)
- **기원 현황 탭**: 주문 목록, 상태 필터 (대기/진행/완료/취소), 진행률 표시
- 수동 기원 등록 (회원 검색 → 상품 선택 → 옵션 선택)

#### `/schedule` — 일정 관리
- **영업 시간 탭**: 요일별 시작~종료 시간 설정, 휴무일 토글
- **휴무일 탭**: 특정 날짜 휴무 등록 (사유 입력), 삭제

#### `/members` — 회원 관리
- 소속 회원 목록 (이름, 이메일, 가입일)
- 회원 내보내기 (탈퇴)

#### `/join-codes` — 초대 코드
- 초대 코드 생성 (최대 사용 횟수 설정)
- 활성/비활성 코드 목록
- 코드 비활성화
- 코드 복사

#### `/master-profile` — 프로필 편집
- 상호명, 전문 분야 (다중 선택 + 커스텀 입력)
- 경력, 소개글
- 지역, 주소 (다음 주소 검색 API)
- 기본 상담료, 전화번호
- 정산 계좌 정보 (은행, 계좌번호, 예금주)
- 프로필/배경 이미지 업로드

#### `/master-mypage` — 마이페이지
- 프로필 미리보기
- 메뉴 네비게이션 (프로필 편집, 일정, 기원, 초대코드 등)

#### `/master-chat` — 채팅 (무속인 측)
- 고객별 채팅방 목록
- 채팅 기능 (고객 채팅과 동일)

---

### 관리자(Admin) 페이지

#### `/masters/approval` — 무속인 승인 관리
- 가입 신청한 무속인 목록
- 상세 정보 확인 후 승인/거절

---

## Middleware 인증 흐름

```
요청 수신
  │
  ▼
쿠키에서 JWT 추출 → jose 라이브러리로 검증
  │
  ├── 토큰 없음/만료 → 로그인 페이지 리다이렉트
  │
  ├── role: user  → /dashboard 접근 시 → /home 리다이렉트
  ├── role: master → /home 접근 시 → /dashboard 리다이렉트
  ├── role: admin → /masters/approval 접근 허용
  │
  ├── user인데 masterId 없음 (미가입) → /join 리다이렉트
  │
  └── 토큰 잔여 < 6일 → 새 토큰 발급 (쿠키 갱신)
```

---

## API 엔드포인트 전체 목록

### 인증 (Auth)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/auth/me` | 내 정보 조회 |
| PATCH | `/api/auth/me` | 내 정보 수정 |

### 예약 (Reservations)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/reservations` | 예약 목록 |
| POST | `/api/reservations` | 예약 생성 |
| PATCH | `/api/reservations/[id]` | 예약 상태 변경 |
| GET | `/api/reservations/available-slots` | 가용 시간 조회 |
| GET | `/api/masters/me/reservations/calendar` | 월간 캘린더 데이터 |
| GET | `/api/masters/me/reservations/day` | 일별 예약 조회 |
| POST | `/api/masters/me/reservations/manual` | 수동 예약 등록 |

### 기원 서비스 (Prayer)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/prayer-products` | 기원 상품 목록 (고객용) |
| GET | `/api/masters/me/prayer-products` | 내 기원 상품 (마스터용) |
| POST | `/api/masters/me/prayer-products` | 기원 상품 생성 |
| PATCH | `/api/masters/me/prayer-products/[id]` | 기원 상품 수정 |
| DELETE | `/api/masters/me/prayer-products/[id]` | 기원 상품 삭제 |
| GET | `/api/prayer-orders` | 내 기원 주문 (고객용) |
| POST | `/api/prayer-orders` | 기원 신청 |
| GET | `/api/masters/me/prayer-orders` | 기원 주문 (마스터용) |
| POST | `/api/masters/me/prayer-orders` | 수동 기원 등록 |
| PATCH | `/api/masters/me/prayer-orders/[id]` | 기원 주문 상태 변경 |

### 채팅 (Chat)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/chat/rooms` | 채팅방 목록 |
| POST | `/api/chat/rooms` | 채팅방 생성/조회 |
| GET | `/api/chat/rooms/[roomId]/messages` | 메시지 조회 |
| POST | `/api/chat/rooms/[roomId]/messages` | 메시지 전송 |
| GET | `/api/chat/unread` | 안읽은 메시지 수 |

### 일정 (Schedule)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/masters/me/schedule` | 영업시간 + 휴무일 |
| PUT | `/api/masters/me/schedule` | 영업시간 저장 |
| POST | `/api/masters/me/schedule/off-days` | 휴무일 추가 |
| DELETE | `/api/masters/me/schedule/off-days` | 휴무일 삭제 |

### 회원 & 초대 (Members & Join Codes)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/masters/me/members` | 회원 목록 |
| DELETE | `/api/masters/me/members/[id]` | 회원 내보내기 |
| GET | `/api/masters/me/join-codes` | 초대 코드 목록 |
| POST | `/api/masters/me/join-codes` | 초대 코드 생성 |
| PATCH | `/api/masters/me/join-codes/[id]` | 코드 비활성화 |
| POST | `/api/join` | 초대 코드로 가입 |

### 알림 & 기타
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/notifications` | 알림 목록 |
| PATCH | `/api/notifications/[id]` | 알림 읽음 처리 |
| PATCH | `/api/notifications/read-all` | 전체 읽음 |
| GET | `/api/masters/me` | 마스터 프로필 조회 |
| PATCH | `/api/masters/me` | 마스터 프로필 수정 |
| GET | `/api/masters/my-master` | 소속 무속인 조회 |
| PATCH | `/api/admin/masters/[id]` | 무속인 승인/거절 |

---

## 프로젝트 구조

```
src/
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
└── middleware.ts           # 인증 & 라우트 가드
```

---

## 주요 기술적 의사결정

| 결정 | 이유 |
|------|------|
| Next.js API Routes (서버리스) | 별도 서버 없이 풀스택 → 비용 절감, 배포 단순화 |
| Supabase (PostgreSQL) | Firebase 대비 SQL 기반 → 복잡한 관계형 쿼리 가능 |
| JWT + HTTP-only 쿠키 | 세션 서버 불필요 + XSS/CSRF 방어 |
| React Query | useState로 서버 상태 관리 시 캐싱·중복요청·에러처리 직접 구현 필요 → 자동화 |
| Zustand (vs Redux) | 인증 상태만 관리하므로 경량 솔루션으로 충분 |
| Tailwind CSS | 컴포넌트별 스타일 분리 불필요 + 빠른 UI 개발 |
| Route Groups `()` | URL 오염 없이 역할별 레이아웃·접근제어 분리 |
| 서비스 레이어 패턴 | 컴포넌트 ↔ API 간 관심사 분리, 테스트 용이 |
| 폴링 (채팅) | 초기 구현 비용 최소화, Realtime 전환 경로 확보 |

---

## 보안 체크리스트

- [x] 비밀번호 bcrypt 해싱 (salt rounds: 10)
- [x] JWT HTTP-only 쿠키 (XSS 방어)
- [x] sameSite: 'lax' (CSRF 방어)
- [x] 프로덕션 secure: true (HTTPS 강제)
- [x] server-only 모듈 (서버 코드 클라이언트 노출 차단)
- [x] Middleware 역할 기반 접근 제어
- [x] API Route별 인증 검증
- [x] 환경변수로 시크릿 키 관리
