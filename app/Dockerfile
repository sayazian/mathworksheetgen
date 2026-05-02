FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2.10-alpine

WORKDIR /srv

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist ./dist

CMD ["/bin/sh", "-c", "cat > /srv/dist/env.js <<EOF\nwindow.__MATH_WORKSHEET_CONFIG__ = {\n  VITE_SUPABASE_URL: \"${VITE_SUPABASE_URL}\",\n  VITE_SUPABASE_PUBLISHABLE_KEY: \"${VITE_SUPABASE_PUBLISHABLE_KEY}\",\n  VITE_SUPABASE_FUNCTIONS_URL: \"${VITE_SUPABASE_FUNCTIONS_URL}\",\n  VITE_USE_MOCK_API: \"${VITE_USE_MOCK_API}\"\n};\nEOF\ncaddy run --config /etc/caddy/Caddyfile --adapter caddyfile"]
