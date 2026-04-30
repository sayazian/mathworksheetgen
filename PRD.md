# Product Requirements Document

## Product

Math Worksheet Generator is a web app that lets anyone enter a math topic and
receive a simple worksheet with problems, an answer key, and brief
explanations.

The goal for v1 is to ship the smallest credible product that demonstrates a
real full-stack workflow: form input, persistence, LLM-backed generation, and a
public sharing path. Authentication and advanced document export are explicitly
out of scope for the first version.

## Problem

Creating practice material by hand is repetitive. For a learner or teacher who
just wants a quick worksheet for a topic like fractions or linear equations,
the overhead of writing problems, solutions, and short explanations is higher
than it should be.

## Target User

Primary user for v1: any visitor on the public internet who wants to generate a
math worksheet quickly without creating an account.

## Goals

- Generate a worksheet from a user-provided math topic.
- Include an answer key and brief explanations for each answer.
- Persist generated worksheets so they can be viewed again later.
- Keep worksheets private by default.
- Allow a worksheet owner to opt into public sharing via a link.
- Ship with the simplest backend/deployment path that still gives real product
  shape and supports deployment on Railway.

## User Stories

- As a visitor, I can enter a math topic and request a worksheet.
- As a visitor, I can view the generated worksheet in a simple browser-friendly
  format.
- As a visitor, I can see the answer key and brief explanations with the
  worksheet.
- As a visitor, I can revisit a worksheet by its saved URL.
- As a worksheet creator, my worksheet is private by default.
- As a worksheet creator, I can make a worksheet public and share the public
  link.

## Functional Scope

### In scope for v1

- Single input flow to generate a worksheet from a topic.
- Server-side worksheet generation via an LLM call.
- Stored worksheet record with:
  - topic
  - generated problems
  - answer key
  - brief explanations
  - visibility state
  - creation metadata
- Worksheet detail page.
- Public share toggle or equivalent share action.
- Basic validation and error states.

### Out of scope for v1

- User authentication and accounts.
- Per-user worksheet libraries or dashboards.
- PDF export or advanced print layout.
- Rich worksheet customization such as grade level, problem count sliders, or
  formatting presets.
- Editing generated worksheets.
- Payment, quotas, moderation dashboards, or analytics-heavy features.

## Non-Goals

- Build a full teacher platform.
- Optimize for perfect pedagogy across all math domains.
- Support collaborative authoring.
- Build a complex admin system.

## Success Criteria

- A new visitor can generate a worksheet in one session without onboarding.
- The worksheet includes usable problems, answer key entries, and short
  explanations.
- Saved worksheets can be opened reliably by URL.
- Private/public behavior works as designed for v1.
- The app is deployed publicly and runnable from documented setup steps.

## Risks and Open Questions

- Without auth in v1, "ownership" and private/public behavior will need a
  lightweight mechanism such as unguessable edit tokens. This is acceptable for
  v1 but weaker than real accounts.
- LLM output quality may vary by topic, so prompt design and response
  validation will matter.
- If printability becomes important, we may need a narrow HTML print stylesheet
  before considering PDF export.
- Railway is acceptable for deployment, but its current free tier has tighter
  limits than some static-first hosts. We should expect to validate costs and
  deployment constraints before calling the stack "free" in the README.
