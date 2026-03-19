FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY packages/ingestion/package.json ./packages/ingestion/
COPY packages/privacy/package.json ./packages/privacy/
COPY workers/package.json ./workers/
RUN npm install

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/workers
CMD ["node", "--loader", "tsx", "src/index.ts"]
