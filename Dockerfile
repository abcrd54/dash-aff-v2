FROM oven/bun:1-slim AS deps
WORKDIR /app
COPY package.json bun.lock ./
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN bun install --frozen-lockfile

FROM oven/bun:1-slim
WORKDIR /app

RUN apt-get update && apt-get install -y \
  chromium \
  libnss3 libnspr4 libatk-bridge2.0-0 libdrm2 libxkbcommon0 \
  libgbm1 libasound2 libxcomposite1 libxdamage1 libxrandr2 \
  libcups2 libpango-1.0-0 libcairo2 libatk1.0-0 \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN mkdir -p /app/public/css && bun run build:css

ENV NODE_ENV=production
ENV PORT=4000
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

EXPOSE 4000

CMD ["bun", "run", "start"]