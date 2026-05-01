# Supabase Setup

This project is structured to use the real Supabase backend by default.
Frontend-only mock mode is still available as an explicit local-development
option by setting `VITE_USE_MOCK_API=true`.

## Prerequisites

- A container runtime compatible with Docker APIs
- Node.js 20 or later

Supabase's current local development docs recommend using the CLI through `npx`
or installing it as a local dev dependency, then running `supabase init` and
`supabase start` for local development. Source:
[Local Development & CLI](https://supabase.com/docs/guides/local-development),
[Supabase CLI](https://supabase.com/docs/guides/cli/getting-started).

## Local Supabase workflow

From the repo root:

```bash
npx supabase init
npx supabase start
```

That starts the local Supabase stack. Supabase's docs currently say the local
stack is viewable at `http://localhost:54323`.

## Hosted project link

This repo is configured for the hosted Supabase project:

```text
juxtmkfewfywpccaylso
```

To link the CLI after logging in:

```bash
npx supabase login
npx supabase link --project-ref juxtmkfewfywpccaylso
```

## Apply migrations

This repo already contains the worksheet migration in:

- [supabase/migrations/20260429220500_create_worksheets.sql](/Users/sahar/Work/Projects/mathworksheetgen/supabase/migrations/20260429220500_create_worksheets.sql)

After `npx supabase start`, apply local migrations with:

```bash
npx supabase db reset
```

That recreates the local database from the checked-in migrations.

## Function secrets

Create a local function env file from the checked-in example:

```bash
cp supabase/.env.example supabase/functions/.env
```

Then set:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Supabase docs state that `supabase functions serve` automatically loads
`supabase/functions/.env` by default, and that custom env files can be passed
with `--env-file`. Source:
[Environment Variables](https://supabase.com/docs/guides/functions/secrets).

## Serve the Edge Function locally

```bash
npx supabase functions serve worksheets
```

That exposes the worksheet function locally. If you are also running the full
local stack, the functions endpoint is typically:

```text
http://127.0.0.1:54321/functions/v1
```

## Frontend env for real backend mode

Create the frontend env file:

```bash
cp app/.env.example app/.env
```

For local Supabase development, set:

```text
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<your local anon or publishable key>
VITE_SUPABASE_FUNCTIONS_URL=http://127.0.0.1:54321/functions/v1
VITE_USE_MOCK_API=false
```

For a hosted Supabase project, set:

```text
VITE_SUPABASE_URL=https://juxtmkfewfywpccaylso.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your hosted publishable or anon key>
VITE_USE_MOCK_API=false
```

The frontend now sends the project key when invoking the function. Supabase's
deployment docs show Edge Functions being invoked with an `Authorization` header
using the project's anon or publishable key. Sources:
[Deploy to Production](https://supabase.com/docs/guides/functions/deploy),
[Securing Edge Functions](https://supabase.com/docs/guides/functions/auth).

## Push secrets to a hosted project

For a linked hosted project, Supabase docs currently recommend:

```bash
npx supabase secrets set --env-file supabase/.env
```

This makes the secrets available to deployed Edge Functions.

## Deploy the function

```bash
npx supabase functions deploy worksheets
```

If your project is linked, this deploys the checked-in worksheet function to
the hosted project.

## Current limitation

The app can be tested locally in explicit mock mode. Real end-to-end Supabase
testing depends on:

- a working local container runtime or hosted Supabase project
- your actual Supabase publishable key
- your OpenAI API key
