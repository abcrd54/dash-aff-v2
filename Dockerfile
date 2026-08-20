FROM oven/bun:1-slim AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1-slim
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN mkdir -p /app/public/css && bun run build:css

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["bun", "run", "start"]
