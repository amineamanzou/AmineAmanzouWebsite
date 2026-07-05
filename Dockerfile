FROM node:26-alpine AS build
WORKDIR /app

ARG SITE_URL=https://amineamanzou.fr
ARG BASE_PATH=/

COPY package.json package-lock.json* ./
RUN npm ci

COPY astro.config.mjs tsconfig.json ./
COPY public ./public
COPY src ./src

RUN SITE_URL="${SITE_URL}" BASE_PATH="${BASE_PATH}" npm run build

FROM golang:1.26.4-alpine AS caddy-build
WORKDIR /src

RUN apk add --no-cache ca-certificates git
RUN CGO_ENABLED=0 go install -trimpath -ldflags="-s -w -X github.com/caddyserver/caddy/v2.CustomVersion=v2.11.4" github.com/caddyserver/caddy/v2/cmd/caddy@v2.11.4

FROM alpine:3.22
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

ENTRYPOINT ["/usr/bin/caddy"]
CMD ["run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
