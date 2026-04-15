FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile --production
COPY src ./src
RUN bun build ./src/index.ts --production --minify --drop=debugger --target=bun --outfile dist/index.js

FROM oven/bun:1-slim AS final
WORKDIR /app
COPY --from=build /app/dist/index.js ./index.js
COPY sql ./sql

EXPOSE 3000
CMD ["bun", "run", "index.js"]
