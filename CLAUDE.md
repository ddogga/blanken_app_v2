# blanken-web

영어 빈칸채우기 퀴즈 학습 서비스 **blanken**의 웹 프론트엔드.
백엔드는 별도 레포(Kotlin + Spring Boot)이며, 이 레포는 정적 SPA만 담당한다.

## 0. 작업 방식 (가장 먼저 지킬 것)

**코드를 수정하기 전에 반드시 사용자에게 먼저 묻는다.** 승인 없이 파일을 편집하지 않는다.

- **질문에는 답만 한다.** "어떻게 해야 해?", "이게 맞아?", "이거 동작할까?", "어떻게 하는 게 좋을까?" 는 **설명을 요청한 것이지 코드를 고쳐달라는 뜻이 아니다.**
  답을 하면서 필요하면 코드 예시를 **메시지 안에** 보여주고, 파일에 반영할지는 사용자가 정한다.
- **편집해도 되는 경우는 사용자가 명시적으로 요청했을 때뿐이다.** "구현해줘", "수정해줘", "정리해줘", "추가해줘" 처럼 행위를 지시한 경우.
  그 경우에도 **요청한 범위를 벗어나는 파일은 건드리지 않는다.** 범위 밖에 손댈 필요가 생기면 먼저 말하고 승인을 받는다.
- **읽기·조사·빌드·테스트 실행은 물어보지 않아도 된다.** 파일을 바꾸지 않는 행위는 자유롭게 한다.
  단, 앱을 띄우거나 DB에 데이터를 넣고 지우는 것처럼 **상태를 바꾸는 검증**은 미리 알린다.
- 고칠 곳을 발견하면 **고치지 말고 보고한다.** 어디가 왜 문제인지, 어떻게 고치면 되는지까지만 제시한다.

## 로드맵 (모든 설계 판단의 전제)

1. **현재**: Vite + React + TypeScript 웹으로 먼저 서비스한다.
2. **추후**: React Native(Expo)로 앱을 만든다.
   - 이때 `types/`, `api/`, `domain/`, `hooks/`, `stores/`는 **그대로 복사해 재사용**하고,
     `pages/`, `components/`(화면 레이어)만 RN 컴포넌트로 다시 작성하는 것이 목표다.
   - 따라서 **재사용 대상 레이어에는 웹(DOM) 의존 코드가 절대 들어가면 안 된다.**

## 기술 스택

- Node 24 LTS (`.nvmrc` 참고), npm
- Vite + React + TypeScript (strict)
- 라우팅: React Router
- 서버 상태: TanStack Query
- 클라이언트 상태: Zustand
- HTTP: axios
- 스타일: Tailwind CSS (추후 RN 전환 시 NativeWind로 클래스 문법 최대한 유지)
- 린트/포맷: ESLint + Prettier

새 라이브러리를 추가하기 전에 반드시 먼저 제안하고 이유를 설명할 것. 임의로 설치하지 않는다.

## 폴더 구조와 레이어 규칙

```
src/
├── types/       DTO·도메인 타입. 순수 TS             [RN 재사용]
├── domain/      순수 비즈니스 로직 (채점, blank 처리 등) [RN 재사용]
├── platform/    브라우저 전용 API 래퍼               [RN 전환 시 이 폴더만 교체]
├── api/         axios 인스턴스 + 엔드포인트 함수       [RN 재사용]
├── hooks/       TanStack Query 훅, 커스텀 훅          [RN 재사용]
├── stores/      Zustand 스토어                       [RN 재사용]
├── components/  재사용 UI 컴포넌트                    [웹 전용 → RN 전환 시 재작성]
├── pages/       라우트 단위 화면                      [웹 전용 → RN 전환 시 재작성]
└── main.tsx
```

### 규칙 1. 로직은 컴포넌트 밖에 둔다

- 컴포넌트(`pages/`, `components/`)는 **데이터를 받아 그리고, 이벤트를 훅에 전달하는 일만** 한다.
- 채점, 정답 비교, 문장의 blank 처리, 진행률 계산 같은 로직은 `domain/`의 **순수 함수**로 작성한다.
  (입력 → 출력만 있고 React·DOM·네트워크에 의존하지 않는 함수)
- 상태 + 로직 조합(예: 퀴즈 풀이 세션 진행)은 `hooks/`의 커스텀 훅으로 만든다.
- 컴포넌트 안에서 `fetch`/axios를 직접 호출하지 않는다. 반드시 `api/` 함수를 `hooks/`의 TanStack Query 훅으로 감싸서 쓴다.
- `useEffect`로 데이터를 불러오지 않는다. 서버 데이터는 TanStack Query를 사용한다.

```tsx
// ❌ 금지: 로직과 API 호출이 컴포넌트에 섞임
function QuizPlay() {
  useEffect(() => {
    fetch("/api/...");
  }, []);
  const ok = input.trim().toLowerCase() === quiz.answer.toLowerCase();
}

// ✅ 권장
// domain/grading.ts      → export const isCorrect = (input, answer) => ...
// hooks/useQuizSession.ts → 세션 상태 + isCorrect 사용
// pages/QuizPlayPage.tsx  → useQuizSession()의 결과를 그리기만 함
```

### 규칙 2. 브라우저 전용 API는 직접 호출하지 않는다

- `localStorage`, `sessionStorage`, `window`, `document`, `navigator`, `location` 등은
  **`platform/` 안의 래퍼에서만** 사용한다.
- `types/`, `domain/`, `api/`, `hooks/`, `stores/`에서는 위 API를 import·참조하지 않는다.
  이 레이어들은 RN에서 그대로 돌아가야 하기 때문이다.
- 래퍼는 RN에서 같은 시그니처로 구현할 수 있도록 **비동기(Promise) 인터페이스**로 만든다.
  (RN의 저장소 API는 비동기이므로, 웹에서 동기로 짜두면 전환 시 호출부를 전부 고쳐야 한다)

```ts
// platform/storage.ts
export const tokenStorage = {
  get: async (): Promise<string | null> => localStorage.getItem("accessToken"),
  set: async (token: string) => localStorage.setItem("accessToken", token),
  clear: async () => localStorage.removeItem("accessToken"),
};
// RN 전환 시 이 파일만 expo-secure-store 구현으로 교체
```

- 라우팅 이동도 페이지/컴포넌트 레이어에서만 처리한다. 훅은 `navigate`를 직접 호출하지 말고
  성공/실패 결과를 반환하거나 콜백(`onSuccess`)을 받는다. (React Router → Expo Router 교체 대비)

### 규칙 3. 타입

- `types/`의 DTO 타입은 백엔드 응답 필드명과 정확히 일치시킨다.
- `any` 사용 금지. 불가피하면 `unknown` 후 좁힌다.
- API 함수는 반환 타입을 명시한다.

## 서버 연동

- 개발 환경: Vite 프록시로 `/api` → `http://localhost:8080` (CORS 회피). 백엔드에 CORS 설정을 추가하지 않는다.
- 베이스 URL은 `import.meta.env.VITE_API_BASE_URL`에서 읽는다.
  단, `import.meta.env` 참조는 `api/` 의 axios 인스턴스 생성부 한 곳에서만 한다.
- `VITE_` 환경변수는 빌드 결과물에 노출된다. 비밀값(키, 시크릿)을 넣지 않는다.
- 인증: JWT. 토큰은 `platform/storage`로 저장하고, axios 인터셉터에서 헤더 주입·401 처리를 일괄로 한다.
- 앱 전체가 로그인 전제다. 비로그인 상태로 진입할 수 있는 화면은 로그인/회원가입뿐이다.

## 도메인 규칙 (프론트 관련)

- 채점은 **클라이언트에서** 한다. 퀴즈 세션 시작 시 정답을 프리페치하고, 입력값과 실시간 대조한다.
- 오답 입력 시 정답 여부만 알리고 무제한 재입력을 허용한다. 사용자가 '포기'해야만 오답으로 기록한다.
- 좋아요 수, 랭킹 등 신뢰가 필요한 값은 **서버 값을 그대로 표시**한다. 클라이언트에서 계산·보정하지 않는다.
  (낙관적 업데이트는 가능하나, 이후 서버 응답으로 덮어쓴다)
- 이어풀기 세션은 서버에서 24시간 유지된다. 만료 시 처음부터 시작한다.

## 스타일

- Tailwind 유틸리티 클래스만 사용한다. 별도 CSS 파일·인라인 `style`은 꼭 필요할 때만.
- 반응형은 **모바일 우선**(기본 = 모바일, `md:` 이상에서 확장)으로 작성한다.
- 웹 전용 CSS 기능(hover 전용 인터랙션, 복잡한 grid 등)에 핵심 UX를 의존하지 않는다.

## 명령어

```bash
npm run dev      # 개발 서버 (localhost:5173)
npm run build    # 타입체크 + 프로덕션 빌드 → dist/
npm run lint     # ESLint
npx prettier --write .
```

## 작업 방식

- 작업 완료 전 `npm run build`와 `npm run lint`가 통과하는지 확인한다.
- 사용자는 백엔드 개발자이며 React는 처음이다. React 고유 개념(훅 규칙, 리렌더링, 의존성 배열 등)이
  등장하면 **왜 그렇게 동작하는지** 짧게 설명한다.
- 위 레이어 규칙을 어기는 편이 훨씬 간단한 상황이면, 임의로 어기지 말고 먼저 알린다.
