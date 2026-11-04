FROM node:22-bookworm-slim

RUN corepack enable

WORKDIR /workspace/backend
COPY . .
RUN pnpm install

EXPOSE 3000
CMD ["pnpm", "exec", "tsx", "src/server.ts"]