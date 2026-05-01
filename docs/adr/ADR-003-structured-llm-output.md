# ADR-003: Require Structured Output for Worksheet Generation

## Status

Accepted

## Context

The product depends on server-generated worksheet content being saved and
rendered by the frontend in a fixed shape:

- title
- subtitle
- problems
- answers
- explanations

Free-form model text would force brittle parsing and increase the chance of
saving malformed data.

## Decision

Use structured LLM output with schema validation before persisting worksheets.

The current implementation uses the OpenAI Responses API with structured JSON
output and validates the final object shape in the Edge Function.

## Why

- It matches the stable frontend data contract.
- It reduces parsing ambiguity.
- It makes malformed generations easier to reject or fall back from.

## Alternatives considered

### Free-form text plus manual parsing

Pros:

- lower initial implementation effort

Cons:

- much more fragile
- harder to test
- more likely to save invalid worksheet records

### Rule-based generation only

Pros:

- deterministic
- easy to validate

Cons:

- not flexible enough for broad topic coverage
- does not satisfy the LLM integration goal of the project

## Consequences

Positive:

- Cleaner client/server contract
- Safer persistence path
- Easier future testing around response shape

Negative:

- Still depends on prompt quality for content quality
- Requires model and API support for structured outputs
- A fallback path is still necessary for missing secrets or malformed responses
