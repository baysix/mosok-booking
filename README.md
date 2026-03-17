# 무속은 안 어려워? 🔮

무속인과 고객을 연결하는 예약 플랫폼 하이브리드 웹앱

## 📋 프로젝트 개요

무속인을 쉽게 찾고, 온라인으로 예약하며, 신뢰할 수 있는 후기를 통해 선택할 수 있는 플랫폼입니다.

### 주요 기능

**고객 (Customer)**
- 지역별 무속인 검색 및 필터링
- 무속인 상세 정보 및 후기 확인
- 온라인 예약 및 결제
- 실시간 채팅 상담
- 후기 작성

**무속인 (Shaman)**
- 프로필 및 서비스 관리
- 예약 승인 및 일정 관리
- 수익 통계 확인
- 고객과의 채팅

**관리자 (Admin)**
- 무속인 승인 및 관리
- 사용자 관리
- 신고 처리
- 통계 대시보드

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (순수 Tailwind, DaisyUI 제거됨)
- **State Management**: Zustand
- **Font**: Noto Sans KR (Google Fonts)

### Backend
- **Database**: Supabase (PostgreSQL) - 현재 더미 데이터 사용
- **Authentication**: JWT 기반 (bcryptjs + HTTP-only Cookie)
- **Realtime**: Supabase Realtime (예정)
- **Storage**: Supabase Storage (예정)
- **Functions**: Supabase Edge Functions (예정)

### Hybrid App
- **Wrapper**: Capacitor 6
- **Platforms**: iOS, Android, Web

### Payment
- 토스페이먼츠
- 카카오페이

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- npm or yarn or pnpm

### 설치

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 Supabase, 토스페이먼츠, 카카오맵 API 키를 입력하세요

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

```
무속은안어려워/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/        # 인증 라우트
│   │   ├── (customer)/    # 고객용 라우트
│   │   ├── (shaman)/      # 무속인용 라우트
│   │   ├── (admin)/       # 관리자용 라우트
│   │   └── api/           # API Routes
│   ├── components/        # React 컴포넌트
│   │   ├── ui/           # shadcn/ui 컴포넌트
│   │   ├── common/       # 공통 컴포넌트
│   │   ├── shamans/      # 무속인 관련
│   │   ├── booking/      # 예약 관련
│   │   ├── chat/         # 채팅 관련
│   │   └── reviews/      # 후기 관련
│   ├── lib/              # 라이브러리 및 유틸
│   ├── hooks/            # 커스텀 훅
│   ├── services/         # API 서비스
│   ├── stores/           # 상태 관리
│   ├── types/            # TypeScript 타입
│   └── constants/        # 상수
└── supabase/             # Supabase 설정
    ├── functions/        # Edge Functions
    └── migrations/       # 데이터베이스 마이그레이션
```

## 🗓️ 개발 로드맵

- [x] **Phase 1**: 프로젝트 초기화 ✅
- [x] **Phase 2**: 인증 시스템 ✅ — JWT 로그인/회원가입/로그아웃, 테스트 계정 3종
- [x] **Phase 3**: 무속인 관리 ✅ — 프로필 등록, 검색/필터, 관리자 승인 (더미 데이터)
- [x] **UI/UX 리디자인** ✅ — 야놀자 스타일 순수 Tailwind, 모바일 WebView 대응
- [ ] **Phase 4**: 예약 시스템 👈 다음 단계
  - 예약 타입/모델 정의
  - 예약 생성/취소 API
  - 날짜/시간 선택 UI
  - 예약 목록 및 상태 관리
  - 무속인 측 예약 승인/거절
- [ ] **Phase 5**: 결제 통합 — 토스페이먼츠, 카카오페이
- [x] **Phase 6**: 실시간 채팅 ✅ — 1:1 채팅, 폴링 기반 (추후 Supabase Realtime 전환)
- [ ] **Phase 7**: 후기 시스템 — 별점/텍스트 리뷰, 사진 첨부
- [ ] **Phase 8**: Capacitor 통합 — iOS/Android 하이브리드 앱
- [ ] **Phase 9**: 푸시 알림 — FCM/APNs
- [ ] **Phase 10**: 관리자 페이지 — 대시보드, 사용자 관리, 신고 처리 (현재 무속인 승인만 구현)
- [ ] **Phase 11**: 테스트 & 최적화
- [ ] **Phase 12**: 배포

## 📝 라이센스

이 프로젝트는 개인 프로젝트입니다.

## 🤝 기여

현재는 개인 개발 프로젝트로 진행 중입니다.

## 📧 문의

프로젝트 관련 문의사항은 이슈를 통해 남겨주세요.
