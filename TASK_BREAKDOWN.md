# Task Breakdown

## Milestone 1: Project definition

- Finalize PRD assumptions.
- Write architecture doc.
- Capture early workflow notes in `AI_WORKFLOW.md`.

Stop and review:
- Confirm the anonymous ownership model is acceptable for v1.

## Milestone 2: Project scaffold

- Initialize React + TypeScript + Vite app.
- Set up formatting, linting, and testing baseline.
- Add environment variable handling and deploy-ready config.

Stop and review:
- Walk through React project structure and TypeScript basics in repo context.

## Milestone 3: Data and backend foundation

- Set up Supabase project and schema.
- Create worksheet persistence layer.
- Add backend endpoints for create/get/update visibility.

Stop and review:
- Validate relational design and server/client responsibility split.

## Milestone 4: Worksheet generation flow

- Build topic submission form.
- Add server-side LLM call.
- Validate and normalize generated worksheet content.
- Persist generated worksheets and return editable access.

Stop and review:
- Inspect prompt quality and failure handling before adding polish.

## Milestone 5: Worksheet viewing and sharing

- Build worksheet detail page.
- Show problems, answer key, and explanations.
- Implement private-by-default behavior.
- Implement public sharing toggle and public view rules.

Stop and review:
- Refactor if permission logic or page state has become hard to reason about.

## Milestone 6: Quality pass

- Add critical-path tests.
- Tighten loading, error, and empty states.
- Improve README and ADR coverage.

Stop and review:
- Verify the app is understandable to a stranger and defensible in an
  interview.

## Milestone 7: Deployment and wrap-up

- Deploy to Railway.
- Verify production environment variables and end-to-end flow.
- Finish README.
- Run the retrospective and critique the learning gaps.
