# ---- deps: install all dependencies ----
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---- builder: build the standalone output ----
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time.
# Override these with --build-arg for a real deployment; defaults target
# the APIs running on the host's localhost.
ARG NEXT_PUBLIC_NOTES_API=http://localhost:3001
ARG NEXT_PUBLIC_PERSON_API=http://localhost:3002
ENV NEXT_PUBLIC_NOTES_API=$NEXT_PUBLIC_NOTES_API
ENV NEXT_PUBLIC_PERSON_API=$NEXT_PUBLIC_PERSON_API

RUN npm run build

# ---- runner: minimal image with just the standalone server ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
