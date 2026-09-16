# Calendrier SEO bilingue — septembre 2026 à février 2027

La source de vérité est [`src/data/editorial-calendar.json`](../../src/data/editorial-calendar.json). Ce document décrit son mode d’emploi ; il ne duplique pas les 30 briefs.

Les sujets 27 à 30 constituent une série de réaction rapide ajoutée en juillet 2026. Leurs identifiants restent après les 26 sujets du calendrier initial afin de préserver les références déjà utilisées dans le suivi éditorial.

## Statuts

Chaque sujet passe par les états `planned` → `researched` → `drafted-fr` → `voice-reviewed-fr` → `adapted-en` → `human-approved` → `scheduled` → `published`.

Une page d’article ne doit entrer dans `src/content/articles` qu’après recherche, contrôle du niveau de preuve, validation de la voix française et review humaine. L’anglais est adapté pour un lecteur anglophone ; ce n’est pas une traduction ligne à ligne.

## Cadence

- Brief et sources préparés quatorze jours avant la publication française.
- Publication française le mardi, adaptation anglaise le jeudi.
- Un artefact concret et un seul CTA vers l’offre déclarée dans `relatedOffer`.
- Les contenus de décembre sont recherchés, validés et programmés avant les congés.

## Préparer plusieurs publications sur GitHub

Les fichiers bilingues peuvent être ajoutés à `src/content/articles` et fusionnés sur `main` avant leur date de publication. Le champ `publishedAt` contrôle leur visibilité :

- avant cette date, l’article n’est présent ni dans les index, ni dans le sitemap, ni dans les routes statiques ;
- le jour prévu, le workflow `Deploy Production` reconstruit le site à `05:17 UTC` et publie les articles devenus éligibles ;
- la comparaison utilise la date civile `Europe/Paris` ; le modèle actuel programme un jour, pas une heure précise ;
- les deux langues peuvent avoir des dates différentes. Entre le mardi français et le jeudi anglais, seule la version française est indexée.

Pour prévisualiser localement une publication future sans modifier son frontmatter :

```bash
PUBLICATION_DATE=2026-09-01 npm run dev
```

Pour reproduire son build et son inventaire SEO :

```bash
PUBLICATION_DATE=2026-09-01 npm run build
PUBLICATION_DATE=2026-09-01 npm run check:seo
```

## Contrôle avant intégration

1. Requête principale et intention explicites.
2. Sources primaires conservées dans le brief.
3. Niveau de preuve choisi : `documentation`, `lab`, `experience` ou `hypothesis`.
4. Artefact vérifié et image accompagnée d’un texte alternatif utile.
5. Copy française passée par la validation de voix et `npm run validate:style` dans le projet éditorial.
6. Adaptation anglaise relue indépendamment.
7. `npm run check:content`, `npm run check`, `npm run build` et `npm run check:seo` au vert.

## Pilotage toutes les quatre semaines

Suivre Search Console et PostHog par pilier : indexation, impressions non brandées, position moyenne, clics article → offre et clics vers l’email préqualifié. Le calendrier organise la production ; il ne promet pas un classement.
