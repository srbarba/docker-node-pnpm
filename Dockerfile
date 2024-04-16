ARG NODE_VARIANT=20.12.2@sha256:844b41cf784f66d7920fd673f7af54ca7b81e289985edc6cd864e7d05e0d133c
ARG PNPM_VERSION=8.15.6

FROM node:$NODE_VARIANT
ARG PNPM_VERSION
RUN corepack enable && corepack use pnpm@$PNPM_VERSION
