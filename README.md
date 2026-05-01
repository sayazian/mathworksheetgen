# Math Worksheet Generator

Math Worksheet Generator is a learning project and portfolio project: a
full-stack web app that lets a user enter a math topic and receive a worksheet
with problems, an answer key, and brief explanations.

The project is intentionally scoped to a narrow v1. The goal is not to build a
full teacher platform. The goal is to demonstrate a real product shape with
frontend state, persistence, an LLM integration, and a private/public sharing
model.

## Current status

Implemented:

- React + TypeScript + Vite frontend scaffold in [app](/Users/sahar/Work/Projects/mathworksheetgen/app)
- Worksheet request UI and worksheet preview
- URL-based worksheet reopening
- Private/public visibility toggle
- Token-based ownership model for anonymous v1 usage
- Supabase migration for worksheet persistence
- Supabase Edge Function for create/get/update visibility
- Server-side OpenAI worksheet generation with structured output fallback
- Mock mode for local frontend development without backend secrets

Not implemented yet:

- Real user authentication
- PDF export
- Advanced worksheet customization
- Production deployment on Railway
- End-to-end verification against a real Supabase project in this repo

## Repo structure

- [PRD.md](/Users/sahar/Work/Projects/mathworksheetgen/PRD.md): product scope and non-goals
- [ARCHITECTURE.md](/Users/sahar/Work/Projects/mathworksheetgen/ARCHITECTURE.md): system overview
- [TASK_BREAKDOWN.md](/Users/sahar/Work/Projects/mathworksheetgen/TASK_BREAKDOWN.md): milestone plan
- [AI_WORKFLOW.md](/Users/sahar/Work/Projects/mathworksheetgen/AI_WORKFLOW.md): record of prompting and workflow choices
- [SUPABASE_SETUP.md](/Users/sahar/Work/Projects/mathworksheetgen/SUPABASE_SETUP.md): local and hosted Supabase setup notes
- [app](/Users/sahar/Work/Projects/mathworksheetgen/app): React frontend
- [supabase](/Users/sahar/Work/Projects/mathworksheetgen/supabase): migrations and Edge Function code
- [docs/adr](/Users/sahar/Work/Projects/mathworksheetgen/docs/adr): architecture decision records

## Running the frontend in mock mode

This is the fastest way to see the app without backend setup.

```bash
cd /Users/sahar/Work/Projects/mathworksheetgen/app
npm install
npm run dev
```

Then open the local Vite URL, usually `http://localhost:5173`.

Mock mode is enabled by default in [app/.env.example](/Users/sahar/Work/Projects/mathworksheetgen/app/.env.example) through:

```text
VITE_USE_MOCK_API=true
```

In mock mode:

- worksheets are generated locally
- worksheet URLs still work
- ownership tokens are simulated in browser storage

## Running checks

From [app](/Users/sahar/Work/Projects/mathworksheetgen/app):

```bash
npm run lint
npm run test
npm run build
```

## Moving to a real backend

Use [SUPABASE_SETUP.md](/Users/sahar/Work/Projects/mathworksheetgen/SUPABASE_SETUP.md).

At a high level:

1. Set up Supabase CLI and local or hosted project access
2. Apply the migration in [supabase/migrations/20260429220500_create_worksheets.sql](/Users/sahar/Work/Projects/mathworksheetgen/supabase/migrations/20260429220500_create_worksheets.sql)
3. Configure:
   - frontend env in `app/.env`
   - function env in `supabase/functions/.env`
4. Provide:
   - Supabase publishable key
   - OpenAI API key
5. Serve or deploy the `worksheets` Edge Function

## Key technical decisions

- Backend platform: Supabase
- Frontend: React + TypeScript + Vite
- Deployment target: Railway
- Anonymous v1 ownership: edit token instead of auth
- LLM location: server-side only, never in the browser
- Response shape: structured worksheet content before persistence

See:

- [ADR-001 Supabase Backend](/Users/sahar/Work/Projects/mathworksheetgen/docs/adr/ADR-001-supabase-backend.md)
- [ADR-002 Anonymous Ownership Tokens](/Users/sahar/Work/Projects/mathworksheetgen/docs/adr/ADR-002-anonymous-ownership-tokens.md)
- [ADR-003 Structured LLM Output](/Users/sahar/Work/Projects/mathworksheetgen/docs/adr/ADR-003-structured-llm-output.md)

## Learning angle

This repo is deliberately not just app code. It also captures how the project
was shaped:

- scope was fixed before coding
- architecture choices were documented early
- workflow decisions were logged while building

That is intentional. The project is meant to teach repeatable AI-assisted
development, not only produce a working demo.
