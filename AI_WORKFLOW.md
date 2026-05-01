# AI Workflow Log

## Entry 1: Prompt-first project setup

Pattern used: spec-first planning.

Why it fits:
- The project prompt explicitly prioritizes scope control and learning over
  immediate coding.
- Writing the PRD before scaffolding reduces the chance of building extra
  features too early.

What we did:
- Read the repo prompt in full before proposing work.
- Asked clarifying questions that materially changed scope.
- Converted the answers into concrete v1 constraints before creating any app
  code.

What changed because of clarification:
- Authentication moved out of v1.
- Output is browser-first and intentionally simple.
- Answer keys and short explanations are required.
- Shipping speed and free infrastructure are top priorities.
- Deployment target changed from Vercel to Railway based on user preference.

What to watch:
- Anonymous-first plus private-by-default creates a design tension around
  ownership. We will likely resolve that with share/edit tokens in v1, then
  replace or supplement it with real auth later.
- User preference can reasonably override the "default simplest platform"
  recommendation, but we should verify platform pricing and deployment limits
  before depending on them.

## Entry 2: Scaffold before feature work

Pattern used: thin vertical scaffold.

Why it fits:
- The repo needed a real React and TypeScript baseline before any worksheet
  behavior could be implemented.
- Replacing the starter demo immediately avoids teaching from irrelevant Vite
  example code.

What we did:
- Scaffolded a Vite React TypeScript app in `app/`.
- Added a minimal testing baseline with Vitest and Testing Library.
- Replaced the starter UI with an app shell shaped around the worksheet flow.
- Added `.env.example` to make the API boundary explicit before backend work.
- Later changed mock mode to an explicit opt-in so missing backend config does
  not silently produce fake worksheets.

What to watch:
- This shell uses local component state only. That is deliberate. We should not
  introduce heavier client-state patterns until the simple fetch-driven version
  becomes painful enough to justify them.

## Entry 3: Backend seam before LLM integration

Pattern used: backend seam first.

Why it fits:
- The project needs persistence, visibility rules, and ownership before it
  needs fancy generation quality.
- A stable request and response shape lets us defer the LLM call without
  blocking frontend progress.

What we did:
- Added a SQL migration for a `worksheets` table with private/public visibility
  and hashed edit tokens.
- Added a Supabase Edge Function that creates worksheet records and updates
  visibility.
- Kept a mock fallback in the frontend so the UI remains usable before secrets
  and deployment wiring are in place.

What to watch:
- The current server-side worksheet generator is deliberately fake. That is not
  a bug. It is a placeholder seam for the later LLM milestone.

## Entry 4: URL-based state before routing

Pattern used: smallest navigation primitive.

Why it fits:
- The product needs reopen-by-URL behavior before it needs a full routing setup.
- Using query parameters keeps the moving parts small while the app still has
  a single main screen.

What we did:
- Added URL-based worksheet loading using `?worksheet=` and optional
  `?editToken=`.
- Added a `GET` path to the worksheet function for direct record retrieval.
- Expanded the mock storage so local development still behaves like persisted
  records, not just a single in-memory preview.

What to watch:
- Query params are good enough for v1, but if the app grows to multiple screens
  we should move to explicit routes rather than stretching this pattern too far.

## Entry 5: Structured outputs before free-form generation

Pattern used: schema-first LLM integration.

Why it fits:
- The product already had a stable worksheet data shape, so the model should be
  constrained to that shape instead of relying on prompt wording alone.
- Structured output lets us reject malformed generations without changing the
  frontend contract.

What we did:
- Added an OpenAI Responses API call in the Supabase function.
- Used structured JSON output for the worksheet payload shape.
- Initially kept deterministic server fallback for development safety. This was
  later removed from the real Supabase generation path once topic alignment
  became the higher priority.

What to watch:
- Production generation now depends on wiring `OPENAI_API_KEY` and testing the
  real model behavior on a range of math topics.

## Entry 6: Validate topic alignment, not just JSON shape

Pattern used: generate-then-judge.

Why it fits:
- A well-formed worksheet can still be the wrong worksheet.
- Topic alignment is a semantic quality check, not just a schema check.

What we did:
- Added a second LLM pass that reviews whether the generated worksheet truly
  matches the requested topic.
- Added one retry path so an off-topic draft can be regenerated with reviewer
  feedback.
- Removed deterministic fallback from the real Supabase generation path. The
  server now either produces an LLM-generated aligned worksheet or returns an
  error.

What to watch:
- This is stronger than keyword matching, but it still does not create a
  mathematical correctness guarantee. It improves topical relevance first.
