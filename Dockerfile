FROM oven/bun AS build

WORKDIR /app

# Cache packages installation
COPY package.json bun.lock ./

RUN bun install

COPY tsconfig.json ./
COPY ./src ./src

ENV NODE_ENV=production

RUN bun run build

FROM debian:12-slim

WORKDIR /app

COPY --from=build /app/dist/prox3 ./prox3
COPY sql ./sql

ENV NODE_ENV=production

EXPOSE 3000

CMD ["./prox3"]