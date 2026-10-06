# Development image: toolchain only. Source is bind-mounted by docker-compose.
FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@11.0.9 --activate
WORKDIR /repo
