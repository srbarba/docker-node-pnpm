ARG NODE_VARIANT=20.12.2-alpine3.19@sha256:5cf32127b55467ea639dc805a13c6f51b2facebc5eb11f9c5d49e3059f3c0aa4

FROM node:$NODE_VARIANT as install
ARG PNPM_VERSION=8.15.6
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

FROM node:$NODE_VARIANT
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY --from=install $PNPM_HOME $PNPM_HOME
CMD echo $PATH