# AmineAmanzouWebsite

WordPress runtime image for `amineamanzou.fr`.

This public repository contains only the application build surface:

- the WordPress image definition
- app-owned PHP and Apache config
- app-owned WordPress mu-plugin code
- the GitHub Actions workflow that builds, scans, signs, and publishes the image

Runtime promotion is handled by private infrastructure outside this repository.

Persistent WordPress state and runtime credentials are intentionally absent:

- MariaDB data
- `wp-content`
- uploads
- SQL dumps
- SMTP/API credentials

## Local Validation

Build the release image:

```bash
docker build -t ghcr.io/amineamanzou/amineamanzou-website:local .
```

## Production Flow

GitHub Actions builds and publishes a signed image. Runtime promotion,
environment wiring, persistence, and host-level deployment are managed by
private infrastructure outside this repository.
