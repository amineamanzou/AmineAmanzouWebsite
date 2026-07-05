# Product

## Purpose

`amineamanzou.fr` is Amine Amanzou's public portfolio for SRE, observability,
cloud reliability and technical leadership work.

The site must make three things obvious quickly:

- Amine is a Site Reliability Engineer and observability expert.
- His work improves reliability, incident response, deployment safety and cloud
  cost visibility.
- The next action is to read the freelance capability statement, download the
  matching FR/EN PDF, or contact him.

## Audience

Primary audience:

- Engineering managers, SRE leads, infrastructure leads, CTOs and technical
  decision-makers looking for senior SRE / observability expertise.
- Recruiters and mission sponsors evaluating concrete experience in production,
  observability, DevOps and cloud infrastructure.

Secondary audience:

- Technical peers who want a quick, credible view of Amine's track record.
- People arriving from `aminespired.fr`, GitHub, LinkedIn or legacy profile links.

## Content Contract

The site is static and public. It may contain portfolio content, public proof
points, public PDFs and public links. It must not contain private infrastructure
topology, runtime secrets, WordPress state, database dumps or mutable uploads.

The v1 content is migrated from the public WordPress site:

- home page positioning and proof;
- freelance capability statement, missions, experience and education;
- public PDF downloads;
- public profile image;
- contact links.

The phone number and WordPress contact form are intentionally not migrated.

## Success Criteria

- The first viewport clearly communicates SRE / observability positioning.
- `/dossier/` is readable as a freelance capability statement, not a dumped
  WordPress page.
- `/en/` exposes the English version with the English PDF download.
- `/contact/` has simple public contact links without backend dependencies.
- Legacy `/blog/` and `/articles/` routes redirect cleanly.
- The site builds as a static Astro app and is packaged in a signed GHCR image.
