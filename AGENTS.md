# Repository instructions

## Language

- Write pull request titles and descriptions, commit messages, source-code identifiers and comments, tests, and engineering documentation in English.
- Only user-facing website content is bilingual French/English. Keep translated content and existing public URLs intact when changing engineering text.

## Public repository boundary

- Keep this file limited to public contributor rules. Never add personal routines, private infrastructure details, prompts, agent transcripts, or editorial strategy here.
- Keep internal plans, specifications, research, production briefs, and editorial calendars outside this public repository. Local ignored copies are not a backup; retain the authoritative material in private storage.
- Do not commit internal material under docs/, content/, prototypes/, or agent workspace directories. Never force-add ignored files to bypass this boundary, including files produced by skills or plugins.
- src/content/ contains website articles, not private planning. Files committed there are publicly readable, including articles scheduled for a future date.
- Publication timing comes from article frontmatter. Keep new French/English translation pairs on the same publication date.
- Before committing, run node scripts/checks/public-repository.mjs and inspect the staged diff for private material. Removing a file does not erase Git history.
