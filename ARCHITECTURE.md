# Architecture Overview

## Stack choice

- Frontend: React + TypeScript + Vite
- Backend platform: Supabase
- Deployment: Railway for the web app
- LLM integration: server-side call from a backend endpoint, not directly from
  the browser

Why this stack:
- It matches the required frontend.
- It keeps infrastructure consolidated on a single deployment platform.
- It still exposes real product concerns: persistence, API design, and
  permission rules.

## Main components

- React frontend
  - Topic input form
  - Worksheet detail page
  - Share/private controls
- App backend layer
  - Receives generation requests
  - Calls the LLM
  - Validates and stores worksheet output
  - Checks visibility and edit permissions
- Supabase Postgres
  - Stores worksheets and share/edit tokens
- External LLM provider
  - Generates worksheet problems, answers, and brief explanations

## Data flow

1. User enters a topic in the React app.
2. Frontend sends a request to the backend generation endpoint.
3. Backend builds the prompt and calls the LLM.
4. Backend validates the response shape.
5. Backend saves the worksheet in Postgres as private by default.
6. Backend returns the saved worksheet record and an edit token.
7. User can revisit the worksheet page and optionally switch it to public.
8. Public viewers can open only worksheets marked public.

## Data model (initial)

### worksheets

- id
- topic
- content_json
- visibility (`private` or `public`)
- edit_token_hash
- created_at
- updated_at

Notes:
- `content_json` holds the generated problems, answer key, and explanations for
  v1.
- Without auth, ownership is represented by an unguessable edit token rather
  than a user account.

## Security and permissions

- New worksheets are private by default.
- A private worksheet can be viewed or updated only by someone who has the edit
  token.
- A public worksheet can be viewed by anyone with the link.
- The browser never calls the LLM provider directly with a secret key.

## Known simplifications

- No authentication in v1.
- No PDF pipeline in v1.
- No separate microservices or queueing system unless generation latency forces
  the issue later.

## Deployment note

- Railway can host the web app directly from the repo, including environment
  variables for the running service.
- Current Railway pricing is usage-based with a limited free tier, so production
  deployment may require moving to a paid Hobby plan if free-tier restrictions
  become a problem.
