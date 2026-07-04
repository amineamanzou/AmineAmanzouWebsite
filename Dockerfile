FROM wordpress:php8.2-apache

ARG VCS_REF=unknown

LABEL org.opencontainers.image.title="Amine Amanzou Website" \
  org.opencontainers.image.description="WordPress runtime for amineamanzou.fr" \
  org.opencontainers.image.source="https://github.com/amineamanzou/AmineAmanzouWebsite" \
  org.opencontainers.image.url="https://amineamanzou.fr" \
  org.opencontainers.image.revision="${VCS_REF}"

COPY docker/php/uploads.ini /usr/local/etc/php/conf.d/uploads.ini
COPY docker/apache/server-name.conf /etc/apache2/conf-enabled/server-name.conf
COPY wordpress/mu-plugins /usr/src/wordpress/wp-content/mu-plugins
