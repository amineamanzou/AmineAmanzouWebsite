FROM node:26-alpine@sha256:e88a35be04478413b7c71c455cd9865de9b9360e1f43456be5951032d7ac1a66 AS build
WORKDIR /app

ARG SITE_URL=https://amineamanzou.fr
ARG BASE_PATH=/
ARG VCS_REF=unknown
ARG PUBLIC_BROWSER_OBSERVABILITY_ENABLED=false
ARG PUBLIC_BROWSER_OBSERVABILITY_URL=
ARG PUBLIC_BROWSER_OBSERVABILITY_API_KEY=
ARG PUBLIC_BROWSER_SERVICE_NAME=amineamanzou-frontend
ARG PUBLIC_BROWSER_SITE_NAME=amineamanzou.fr
ARG PUBLIC_DEPLOYMENT_ENVIRONMENT=production

COPY package.json package-lock.json* ./
RUN npm ci && npm audit --omit=dev --audit-level=high

COPY astro.config.mjs tsconfig.json ./
COPY public ./public
COPY scripts ./scripts
COPY src ./src

RUN SITE_URL="${SITE_URL}" \
  BASE_PATH="${BASE_PATH}" \
  PUBLIC_BROWSER_OBSERVABILITY_ENABLED="${PUBLIC_BROWSER_OBSERVABILITY_ENABLED}" \
  PUBLIC_BROWSER_OBSERVABILITY_URL="${PUBLIC_BROWSER_OBSERVABILITY_URL}" \
  PUBLIC_BROWSER_OBSERVABILITY_API_KEY="${PUBLIC_BROWSER_OBSERVABILITY_API_KEY}" \
  PUBLIC_BROWSER_SERVICE_NAME="${PUBLIC_BROWSER_SERVICE_NAME}" \
  PUBLIC_BROWSER_SERVICE_VERSION="${VCS_REF}" \
  PUBLIC_BROWSER_SITE_NAME="${PUBLIC_BROWSER_SITE_NAME}" \
  PUBLIC_DEPLOYMENT_ENVIRONMENT="${PUBLIC_DEPLOYMENT_ENVIRONMENT}" \
  npm run build \
  && if [ "${PUBLIC_BROWSER_OBSERVABILITY_ENABLED}" = "true" ]; then \
    npm run check:browser-observability -- --mode=on; \
  else \
    npm run check:browser-observability -- --mode=off; \
  fi \
  && npm run review:site

FROM golang:1.26.5-alpine@sha256:0178a641fbb4858c5f1b48e34bdaabe0350a330a1b1149aabd498d0699ff5fb2 AS caddy-build
WORKDIR /src

RUN apk add --no-cache ca-certificates git
RUN CGO_ENABLED=0 go install -trimpath -ldflags="-s -w -X github.com/caddyserver/caddy/v2.CustomVersion=v2.11.4" github.com/caddyserver/caddy/v2/cmd/caddy@v2.11.4

FROM alpine:3.22@sha256:14358309a308569c32bdc37e2e0e9694be33a9d99e68afb0f5ff33cc1f695dce
WORKDIR /srv

ARG VCS_REF=unknown
LABEL org.opencontainers.image.title="Amine Amanzou Website" \
  org.opencontainers.image.description="Static Astro portfolio for amineamanzou.fr" \
  org.opencontainers.image.source="https://github.com/amineamanzou/AmineAmanzouWebsite" \
  org.opencontainers.image.url="https://amineamanzou.fr" \
  org.opencontainers.image.revision="${VCS_REF}"

RUN apk add --no-cache ca-certificates mailcap tzdata \
  && addgroup -S caddy \
  && adduser -S -D -H -h /srv -s /sbin/nologin -G caddy caddy \
  && mkdir -p /config /data /etc/caddy /srv \
  && chown -R caddy:caddy /config /data /etc/caddy /srv

COPY --from=caddy-build /go/bin/caddy /usr/bin/caddy
COPY ops/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

ENV XDG_CONFIG_HOME=/config \
  XDG_DATA_HOME=/data

USER caddy
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1

ENTRYPOINT ["/usr/bin/caddy"]
CMD ["run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
