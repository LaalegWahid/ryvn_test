FROM node:20-slim

WORKDIR /app

COPY package*.json ./

# Reproducible install from the lockfile; no dev deps needed at runtime.
RUN npm ci --omit=dev

COPY . .

EXPOSE 3001

# Env vars (SUPABASE_URL, SUPABASE_KEY) are provided at runtime via
# --env-file or -e, NOT baked into the image. See .dockerignore.
CMD ["node", "server.js"]
