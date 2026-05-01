# ADR-002: Use Edit Tokens for Anonymous Worksheet Ownership

## Status

Accepted

## Context

The project requires worksheets to be private by default and optionally
shareable publicly, but user accounts were explicitly moved out of v1.

That creates a direct tension:

- we need some notion of ownership
- we do not have authenticated users

## Decision

Represent worksheet ownership with an unguessable edit token.

Implementation direction:

- each worksheet gets a public id
- each worksheet also gets a secret edit token
- only the token hash is stored in the database
- private access or visibility changes require the token

## Why

- It satisfies the private/public requirement without introducing auth flows.
- It removes onboarding friction for the first release.
- It keeps the v1 permission model understandable.

## Alternatives considered

### Add full authentication now

Pros:

- stronger long-term ownership model
- cleaner permissions story eventually

Cons:

- adds complexity and scope before the core generation flow is validated
- slows the learning project significantly

### Make everything public

Pros:

- simplest implementation

Cons:

- violates the stated product requirement
- removes an important real-world permission constraint from the portfolio

## Consequences

Positive:

- Anonymous-first flow remains simple
- Private/public behavior exists in v1
- Ownership can later migrate to real accounts

Negative:

- Losing the token means losing owner access
- Anyone with the token can act as the owner
- This is weaker than account-based authorization and should not be treated as
  the final design
