# Railway Deployment

This app is deployable to Railway as a static single-page app served by Caddy.

The deployment setup lives in:

- [app/Dockerfile](/Users/sahar/Work/Projects/mathworksheetgen/app/Dockerfile)
- [app/Caddyfile](/Users/sahar/Work/Projects/mathworksheetgen/app/Caddyfile)

This follows Railway's current guidance for React/Vite SPAs:

- use a multi-stage Dockerfile for production builds
- serve the built `dist` directory with Caddy
- configure SPA fallback routing so shared or refreshed URLs still resolve to
  `index.html`

Sources:

- [Deploy a React App](https://docs.railway.com/guides/react)
- [Configure SPA Routing](https://docs.railway.com/guides/spa-routing-configuration)
- [Deploying a Monorepo](https://docs.railway.com/guides/monorepo)
- [Dockerfiles](https://docs.railway.com/deploy/dockerfiles)

## Railway service configuration

This repo is an isolated monorepo. The frontend lives in [app](/Users/sahar/Work/Projects/mathworksheetgen/app), so the Railway service should use:

- Root Directory: `/app`

Railway's monorepo docs say isolated projects should be deployed by setting the
service root directory to the project subfolder.

## Required Railway variables

Set these on the Railway frontend service:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_USE_MOCK_API`

Optional:

- `VITE_SUPABASE_FUNCTIONS_URL`

Use:

- `VITE_USE_MOCK_API=true` if you want a frontend-only demo
- `VITE_USE_MOCK_API=false` if you want the deployed frontend to call the real
  Supabase function

Important:

- Vite variables are compiled into the frontend build, so changing these values
  requires a redeploy.

## Deployment steps in Railway

1. Create a new Railway project.
2. Choose `Deploy from GitHub repo`.
3. Select this repository.
4. Open the created service settings.
5. Set `Root Directory` to `/app`.
6. Add the required `VITE_` variables.
7. Deploy the service.
8. In `Settings -> Networking`, generate a domain.

## Recommended production mode

For a real deployment, use:

- `VITE_USE_MOCK_API=false`
- hosted Supabase project URL
- hosted Supabase publishable key

If your Supabase Edge Function is hosted on the same Supabase project as
`VITE_SUPABASE_URL`, you usually do not need `VITE_SUPABASE_FUNCTIONS_URL`.

## Health and routing

The Caddy config includes:

- `/health` returning `200 ok`
- SPA fallback with `try_files {path} /index.html`

That matters because the app uses client-side URLs like:

- `/?worksheet=<id>`

Without SPA fallback, route refreshes and shared links can fail on deploy.
