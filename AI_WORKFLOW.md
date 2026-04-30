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
