ARG NODE_VARIANT=20.12.2-alpine3.19@sha256:e18f74fc454fddd8bf66f5c632dfc78a32d8c2737d1ba4e028ee60cfc6f95a9b

FROM node:$NODE_VARIANT as install
ARG PNPM_VERSION=8.15.6
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@$PNPM_VERSION && npm cache clean --force