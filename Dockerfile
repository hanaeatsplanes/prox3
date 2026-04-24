FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile --production
COPY src ./src
RUN bun run build

FROM debian:12-slim AS final
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/dist/prox3 ./prox3
COPY sql ./sql

EXPOSE 3000
CMD ["./prox3"]
