# iM 조건체크 클라이언트 설계

## 목표

사전조회 조건(V1)과 전자약정 직전의 최종조건(V2)을 비교해, 사용자가 비용·조건 변경을 이해하고 확인한 뒤 약정 여부를 결정할 수 있는 모바일 우선 웹 클라이언트를 만든다. 제공된 Figma 보드(`Hglcm6D0cuZGSkZjInwxO7`, node `651:5435`)와 iM Server Swagger 계약을 구현 기준으로 사용한다.

## 기술과 초기 설정

- Next.js 16 App Router + TypeScript + pnpm 10.
- Tailwind, 품질 검사, Vitest, Git hooks, GitHub Actions는 `@mingyeongbin/frontprep`이 관리한다. 별도의 UI 프레임워크나 상태 관리 라이브러리는 추가하지 않는다.
- 서버 주소는 브라우저에 노출하지 않고 Next Route Handler가 `/api/im/*` 요청을 `IM_API_BASE_URL`로 프록시한다.
- 기본값은 데모 모드다. `NEXT_PUBLIC_DEMO_MODE=false`와 유효한 `IM_API_BASE_URL`을 설정하면 실제 API만 사용하며, 통신 오류를 예시 데이터로 위장하지 않는다.

## 화면과 경로

| 경로 | 역할 | API |
| --- | --- | --- |
| `/` | V1 사전조건 안내 및 만료 상태 | `GET /api/applications/{applicationId}/pre-conditions/latest` |
| `/comparison/[comparisonId]` | V1·V2 자동 비교 진행 | `GET /api/comparisons/{comparisonId}` 폴링 |
| `/comparison/[comparisonId]/summary` | 변경 요약·비용 영향·핵심 변경 | `GET /summary`, `GET /items` |
| `/comparison/[comparisonId]/items/[itemId]` | 항목별 V1/V2와 변경 이유 확인 | `GET /items/{itemId}`, `POST :review` |
| `/comparison/[comparisonId]/review` | 필수 확인 게이트와 약정/재검토/상담 결정 | `GET /review-gate`, `POST signature-sessions`, `POST decisions`, `POST consultation-referrals` |
| `/decision/[decisionId]` | 약정 후 증빙 및 재검증 상태 | `GET /decisions/{decisionId}/proof`, `GET /proof/{proofId}`, `POST :verify` |

V1이 만료된 경우에는 별도 만료 상태를 보여 주고 새 조회를 안내한다. 비교 Job 실패와 API 통신 오류에는 재시도·상담 진입을 제공한다.

## UI 원칙

- Figma의 밝은 배경, 청록색 primary, 부드러운 둥근 카드, 좁은 모바일 컨테이너와 하단 고정 CTA를 재현한다.
- 비교 결과는 `SAME`, `BETTER`, `WORSE`, `STRUCTURAL_CHANGE`, `UNKNOWN`을 색상만으로 구분하지 않고 텍스트 배지와 금액/퍼센트 변화로 함께 설명한다.
- `PROCEED`는 Review Gate가 `allReviewed`일 때만 활성화하고, 서명 세션을 먼저 발급한 후 결정을 전송한다.
- 데모 데이터는 화면 검토용이며 실제 API가 활성화된 운영 모드에서는 대체하지 않는다.

## 데이터 경계와 오류 처리

- API의 공통 응답 래퍼(`success`, `data`, `error`)를 한 곳에서 해석한다.
- 클라이언트는 서버가 돌려주는 금액·판정값을 표시할 뿐 대출 조건을 재계산하거나 승인 여부를 판단하지 않는다.
- `IM_API_BASE_URL`은 Vercel 서버 환경변수로만 설정한다. 브라우저는 same-origin 프록시만 호출한다.
- POST 요청은 사용자의 화면 액션으로만 발생한다. 데모에서는 같은 인터페이스를 로컬 상태로 재현한다.

## 검증

- 금액/날짜/상태 포맷과 API 응답 해석은 단위 테스트한다.
- frontprep의 검사 명령, TypeScript 검사, 프로덕션 빌드, 주요 모바일 화면의 브라우저 확인을 완료한 뒤 Vercel CLI에 연결한다.
