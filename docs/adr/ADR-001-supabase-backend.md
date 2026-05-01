# ADR-001: Use Supabase as the Initial Backend Platform

## Status

Accepted

## Context

The project needs:

- persistence
- a relational database
- server-side API execution
- a practical path to public deployment

The learning prompt also emphasizes scope control and avoiding unnecessary
infrastructure work.

## Decision

Use Supabase as the initial backend platform for v1.

Specifically:

- Postgres stores worksheet records
- Edge Functions handle create/get/update operations
- the frontend talks to Supabase-hosted HTTP functions

## Why

- It keeps the stack smaller than building a custom backend plus separate
  managed database.
- It still exposes real backend concerns: schema design, HTTP boundaries,
  secrets, and deployment.
- It is sufficient for the current permission model and LLM orchestration.

## Alternatives considered

### Custom Node backend plus Postgres

Pros:

- more explicit backend learning
- full control over app server structure

Cons:

- more setup and deployment surface
- slower path to shipping
- adds operational work before product behavior is proven

### Fully local-only mock backend

Pros:

- fastest initial development

Cons:

- does not satisfy the persistence and deployment goals
- pushes the real backend complexity too far downstream

## Consequences

Positive:

- Faster path to a real full-stack system
- Simpler hosted deployment story
- Reasonable fit for anonymous v1 sharing

Negative:

- Some backend behavior is platform-shaped rather than framework-shaped
- Local development depends on Supabase CLI and a Docker-compatible runtime
- Production secrets and function deployment add platform-specific steps
