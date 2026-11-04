FROM node:22-bookworm-slim AS build

RUN corepack enable

WORKDIR /workspace/frontend
COPY . .
RUN pnpm install
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}
RUN pnpm build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html
EXPOSE 80