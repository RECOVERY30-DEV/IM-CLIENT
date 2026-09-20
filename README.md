# iM 조건체크 Client

사전조회 조건(V1)과 전자약정 직전 최종조건(V2)을 비교하는 모바일 우선 클라이언트입니다.

## Requirements

- Node.js 22.22.1 이상
- pnpm 10

## Start

```bash
pnpm install
pnpm dev
```

## Environment

Copy `.env.example` to `.env.local` before using the backend.

```bash
IM_API_BASE_URL=https://im.recovery-30.shop
NEXT_PUBLIC_DEMO_MODE=true
```

- `true` keeps the end-to-end presentation flow on deterministic demo data.
- Set `NEXT_PUBLIC_DEMO_MODE=false` to request the backend through the server-side
  `/api/im/*` proxy. The home screen then expects an `applicationId`, for example
  `/?applicationId=123`. Comparison pages receive their backend IDs from the route:
  `/comparison/{comparisonId}`, `/comparison/{comparisonId}/review`, and
  `/decision/{decisionId}`.
- `IM_API_BASE_URL` is intentionally server-only; do not prefix it with `NEXT_PUBLIC_`.

In live mode the client loads comparison progress, summary, item details, and review
gates from the API; it saves reviews, issues a signature session before a PROCEED
decision, supports retry/consultation handling, and re-verifies proof records.

## Quality commands

```bash
pnpm check
pnpm test:run
pnpm build
```

`frontprep` provides the ESLint, Prettier, Vitest, Husky, commitlint and GitHub
Actions baseline. The product code adds no component-library dependency.

## Main routes

- `/` — saved pre-condition (V1)
- `/comparison/[comparisonId]` — comparison progress
- `/comparison/[comparisonId]/summary` — cost-impact summary
- `/comparison/[comparisonId]/items/[itemId]` — individual change review
- `/comparison/[comparisonId]/review` — mandatory review gate
- `/decision/[decisionId]` — decision/proof receipt
- `/expired` — expired pre-condition
