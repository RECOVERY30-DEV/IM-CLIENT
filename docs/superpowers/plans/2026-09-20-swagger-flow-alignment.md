# Swagger Flow Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the client follow the live IM Swagger contract while retaining the Figma screen count and flow.

**Architecture:** Keep the current Next.js route structure and proxy. Create or reuse the Swagger V1 snapshot before advancing from the condition screen, route comparison completion from Swagger job status, and give `UNCERTAIN` a distinct existing-flow screen. Existing review, decision, proof, retry, and consultation endpoints remain the source of truth.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest.

**Spec:** Live Swagger at `https://im.recovery-30.shop/swagger-ui/index.html` retrieved on 2026-09-20.

## Global Constraints

- Swagger is the sole API and exception-handling contract.
- Figma governs screen count and navigation flow only; Notion wireframes do not govern UI or APIs.
- Live mode writes only through the existing `/api/im/*` proxy.
- Primary write actions remain disabled during their request.

## Review Focus

- Missing `applicationId` sends no live write request.
- Repeated V1-save taps do not create duplicate posts.
- Completed `UNCERTAIN` comparisons go to their own screen.
- Failed jobs retry through the Swagger retry endpoint.
- `PROCEED` creates a signature session before the decision request.

---

### Task 1: Save V1 through Swagger

**Files:** `components/condition-check-flow.tsx`, `shared/types/im.ts`, `test/components/condition-check-flow.test.tsx`

- [ ] Write a failing component test: live condition CTA sends one `POST applications/{applicationId}/pre-conditions` with `Idempotency-Key` and is disabled during the request.
- [ ] Run `pnpm vitest run test/components/condition-check-flow.test.tsx`; expect failure because the current CTA links directly to a comparison ID.
- [ ] Add `SavePreConditionCommand` typing and construct the body from the retrieved V1 response. Save through `requestImApi`, then continue to the returned API flow only after success.
- [ ] Re-run the component test and then the complete test suite.
- [ ] Commit `feat: save V1 condition through Swagger API`.

### Task 2: Route comparison jobs from Swagger status

**Files:** `components/condition-check-flow.tsx`, `app/comparison/[comparisonId]/uncertain/page.tsx`, `test/components/condition-check-flow.test.tsx`

- [ ] Write failing tests for completed ordinary and `UNCERTAIN` comparison jobs.
- [ ] Run `pnpm vitest run test/components/condition-check-flow.test.tsx`; expect failure because completion is manually advanced and no uncertain route exists.
- [ ] Use `GET comparisons/{comparisonId}` result: completed ordinary jobs advance to summary, `UNCERTAIN` jobs advance to uncertain; failed jobs retain retry/consultation actions using Swagger.
- [ ] Re-run the component test and the full suite.
- [ ] Commit `feat: route comparison states from Swagger job status`.

### Task 3: Protect Swagger actions and deploy

**Files:** `components/condition-check-flow.tsx`, `test/components/condition-check-flow.test.tsx`, `README.md` if public entry behavior changes.

- [ ] Write a failing test that asserts signature session creation precedes a `PROCEED` decision and that the action remains single-submission.
- [ ] Verify it fails, then retain the existing Swagger sequence for signature session, decision, proof, retry, consultation, and proof verification.
- [ ] Re-run `pnpm test:run`, `pnpm typecheck`, and `pnpm build`.
- [ ] Deploy the linked Vercel project and confirm public HTTP 200.
- [ ] Commit `test: cover Swagger decision flow` and push the tested main branch.
