FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile
COPY src ./src
RUN bun run build

FROM oven/bun:1-slim AS final
WORKDIR /app
COPY --from=build /app/dist/prox3 ./prox3

EXPOSE 3000
CMD ["./prox3"]
