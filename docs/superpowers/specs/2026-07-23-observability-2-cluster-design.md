# Cluster éditorial « Observability 2.0 »

## Objectif

Publier quatre articles bilingues entre le 28 juillet et le 20 août 2026 afin de profiter du débat déclenché par Mat Duggan et Charity Majors, puis de transformer ce trafic conjoncturel en autorité durable sur l’observabilité, OpenTelemetry et l’architecture des plateformes de télémétrie.

Le cluster reste agnostique des vendors. ClickHouse sert de cas technique documenté, pas de produit à promouvoir.

## Calendrier

| Publication | Français | Anglais |
| --- | --- | --- |
| Observabilité 2.0 : ClickHouse change-t-il vraiment les règles ? | 2026-07-28 | 2026-07-30 |
| Wide events : instrumenter une requête sans détruire son contexte | 2026-08-04 | 2026-08-06 |
| ClickHouse pour l’observabilité : pourquoi ça scale et où ça casse | 2026-08-11 | 2026-08-13 |
| Migrer vers une observabilité unifiée sans remplacer toute sa stack | 2026-08-18 | 2026-08-20 |

## Ligne éditoriale

### Article 1 — réaction

Le texte part de la lecture des deux billets viraux. Il distingue trois niveaux :

- le témoignage opérationnel de Mat Duggan ;
- la théorie du stockage unifié et des wide events défendue par Charity Majors ;
- les faits techniques documentés par ClickHouse et OpenTelemetry.

La position d’Amine est nuancée : le moteur colonnaire change bien l’économie et la méthode d’exploration, mais « ajouter des shards » ne supprime ni le design de schéma, ni les petits inserts, ni les merges, ni Keeper, ni les migrations de données, ni le besoin de limiter le blast radius. OpenTelemetry standardise le transport et la sémantique ; il ne choisit pas l’architecture de stockage.

### Article 2 — instrumentation

L’article explique comment conserver le contexte d’une requête dans un événement structuré large : identité de déploiement, feature flags, tenant, route, résultat, latence et corrélation. Il montre ce qui doit rester dans les resources, spans, events et logs OpenTelemetry, sans inventer un nouveau format propriétaire.

### Article 3 — architecture

L’article explique pourquoi ClickHouse convient aux flux append-heavy et aux agrégations sur peu de colonnes, puis documente ses limites : clés d’ordre, partitions, index clairsemé, petits inserts, parts, merges, sharding, réplication et coût d’exploitation.

### Article 4 — migration

L’article propose une migration progressive : requêtes et décisions à préserver, pilote borné, double export temporaire, comparaison de résultats, bascule par usage, rétention et sortie. La migration ne devient jamais un remplacement global effectué en une nuit.

## Stratégie SEO

Chaque article cible une intention distincte :

1. `observabilité 2.0` / `observability 2.0`
2. `wide events observabilité` / `wide events observability`
3. `ClickHouse observabilité` / `ClickHouse observability`
4. `migration observabilité unifiée` / `unified observability migration`

L’article 1 sert de hub. Chaque satellite renvoie vers lui et vers les deux autres articles lorsque le lien aide la progression. Une seule offre commerciale est déclarée par publication.

## Direction visuelle

Chaque paire bilingue réutilise une couverture sans texte générée dans la direction artistique de *The Unreliable Engineer* :

- personnage humain avec man bun, barbe, lunettes rondes et chemise en flanelle rouge et noire ;
- ligne claire, encrage noir, aplats saturés et expressions théâtrales ;
- aucune esthétique photo, 3D ou corporate.

Chaque article contient également une preuve ou une illustration fonctionnelle :

1. captures attribuées des billets de Mat Duggan et Charity Majors ;
2. diagramme localisé d’un wide event et extrait de configuration ;
3. capture attribuée des chiffres LogHouse et diagramme des contraintes ClickHouse ;
4. configuration de double export et séquence de migration localisée.

Les captures ne servent pas de décoration. Elles sont accompagnées d’une légende, d’un texte alternatif et d’un lien vers la source. Les logos restent limités aux interfaces réellement capturées ou aux marques nécessaires pour comprendre un flux.

## Composant de code

Les blocs `pre > code` des articles reçoivent un traitement commun :

- fond graphite et grille technique discrète ;
- barre supérieure rouge, jaune et verte ;
- label de fichier ou de langage quand il est fourni ;
- débordement horizontal accessible ;
- contraste compatible WCAG AA ;
- adaptation mobile sans modifier le contenu copiable.

## Contrôles

- niveaux de preuve explicites et sources primaires ;
- validation de la voix française avant adaptation anglaise ;
- vérification indépendante de l’anglais ;
- textes alternatifs et légendes sur chaque image ;
- `npm run check:content`, `npm run check`, `npm run build` et `npm run check:seo` ;
- contrôle navigateur des huit routes aux dates simulées.
