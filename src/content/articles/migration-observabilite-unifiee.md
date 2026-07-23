---
title: "Migrer vers une observabilité unifiée sans remplacer toute sa stack"
locale: "fr"
articleSlug: "migration-observabilite-unifiee"
translationKey: "unified-observability-migration"
publishedAt: "2026-08-18"
label: "OpenTelemetry / Migration"
readTime: "12 min"
excerpt: "Une migration vers des wide events et un stockage unifié peut commencer par un usage borné, une double écriture et des requêtes comparées. Le chemin de sortie doit exister avant la bascule."
heroImage: "/blog/migration-observabilite-unifiee/cover.webp"
heroImageAlt: "L’Ingénieur Peu Fiable sécurise un pont de migration entre trois silos de télémétrie et un stockage unifié"
pillar: "opentelemetry"
intent: "informational"
primaryQuery: "migration observabilité unifiée"
relatedOffer: "otel_sprint"
seoTitle: "Migrer vers une observabilité unifiée avec OpenTelemetry"
seoDescription: "Plan de migration progressive vers des wide events et ClickHouse : pilote, double export OpenTelemetry, validation, bascule et rollback."
keywords: ["migration observabilité", "stockage unifié", "OpenTelemetry Collector", "double export", "ClickHouse"]
proofLevel: "documentation"
---

Les migrations d’observabilité commencent souvent par un diagramme très propre.

À gauche, l’ancienne stack. À droite, la nouvelle. Une flèche entre les deux. Le jour du cutover, la flèche devient verte et tout le monde rentre chez soi.

En production, l’ancienne stack porte des alertes, des dashboards, des habitudes d’astreinte, des exports réglementaires et trois requêtes que personne n’a documentées parce qu’elles « ont toujours été là ». La nouvelle stack ne remplace rien tant qu’elle ne sait pas prendre ces décisions en charge.

Le passage vers des [wide events](/blog/wide-events-observabilite/) et un [stockage unifié](/blog/observabilite-2-clickhouse/) gagne donc à commencer comme une expérience contrôlée. OpenTelemetry aide à dupliquer temporairement le flux. La valeur se mesure ensuite sur des enquêtes, des coûts et des opérations réelles.

## Commencer par les décisions, pas par les outils

Avant de déployer un nouvel exporter, je ferais l’inventaire des décisions prises avec la stack actuelle.

Pendant un incident :

- quelle alerte ouvre l’enquête ;
- quel dashboard confirme l’impact ;
- quelle requête isole un service ou une version ;
- comment l’équipe retrouve une trace ou un utilisateur affecté ;
- quelles données servent au postmortem.

Pendant une release :

- comment comparer le canary et la population stable ;
- comment relier une régression à un build ou une feature flag ;
- quel signal déclenche un rollback.

Pour la plateforme :

- quelles rétentions sont contractuelles ;
- quelles données contiennent des PII ;
- quels exports alimentent le support, la sécurité ou la finance ;
- quelles équipes possèdent les schémas et les coûts.

Cette liste devient le protocole de migration. Un backend nouveau peut ingérer cent pour cent des données et rester inutilisable s’il ne reproduit aucune de ces décisions.

## Choisir un premier périmètre borné

Je commencerais rarement par les quatre signaux et tous les services.

Les logs d’un domaine coûteux peuvent fournir un premier pilote. Les traces d’un parcours critique peuvent tester la corrélation et la haute cardinalité. Un seul cluster ou environnement réduit le blast radius.

Le choix dépend de la douleur actuelle :

- facture de logs trop élevée ;
- rétention trop courte ;
- recherche d’un `trace_id` lente ;
- impossibilité de grouper par tenant ou version ;
- corrélation laborieuse entre logs et traces.

Le pilote doit posséder une question mesurable. « Installer ClickHouse » décrit une activité. « Retrouver en moins de trente secondes les erreurs du nouveau checkout par version et tenant, sur trente jours » décrit un résultat.

## Garder le format de collecte portable

OpenTelemetry apporte une frontière utile.

Les applications émettent des données selon les APIs et conventions OpenTelemetry. Les Collectors reçoivent OTLP, enrichissent, filtrent et exportent vers plusieurs destinations. Le backend actuel et le candidat peuvent ainsi observer le même flux sans réinstrumenter chaque service pour un vendor différent.

Cette portabilité ne vient pas automatiquement. Les attributs custom, transformations OTTL, dépendances à une UI et schémas SQL doivent rester documentés. Un exporter ouvert réduit le verrouillage du transport ; il ne supprime pas le coût de sortie des données et des usages.

## Utiliser une double écriture temporaire

Le Collector permet de référencer plusieurs exporters dans une pipeline. Chaque exporter doit posséder sa propre queue et ses retries afin qu’un backend lent n’utilise pas immédiatement toute la mémoire du Collector.

L’exemple suivant duplique logs et traces vers un backend OTLP actuel et vers ClickHouse. Il reste volontairement partiel : les endpoints, certificats, secrets et limites doivent être adaptés au déploiement.

```yaml
extensions:
  file_storage:
    directory: /var/lib/otelcol/storage

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  otlp/current:
    endpoint: current-backend.internal:4317
    sending_queue:
      storage: file_storage
      batch: {}

  clickhouse:
    endpoint: tcp://clickhouse.internal:9000?secure=true
    database: observability
    async_insert: true
    sending_queue:
      storage: file_storage
      num_consumers: 10
      batch:
        min_size: 5000
        flush_timeout: 5s

service:
  extensions: [file_storage]
  pipelines:
    logs/migration:
      receivers: [otlp]
      exporters: [otlp/current, clickhouse]
    traces/migration:
      receivers: [otlp]
      exporters: [otlp/current, clickhouse]
```

La queue persistante limite la perte lors d’un redémarrage. Elle ne crée pas une transaction distribuée entre les deux backends. Une destination peut accepter un lot pendant que l’autre le rejette.

La comparaison doit donc surveiller :

- les événements acceptés et refusés par exporter ;
- la profondeur et l’âge des queues ;
- les retries et les échecs permanents ;
- les écarts de comptage ;
- la latence entre émission et disponibilité.

Le double export augmente temporairement le réseau, le CPU et le stockage. Il possède une date de fin.

## Vérifier la maturité du chemin choisi

Le dépôt Collector Contrib affiche actuellement les niveaux suivants pour le ClickHouse exporter : beta pour les logs et les traces, alpha pour les métriques, development pour les profils.

<figure>
  <img src="/blog/migration-observabilite-unifiee/otel-clickhouse-exporter-github.png" alt="README GitHub de l’exporter ClickHouse indiquant les niveaux de stabilité des signaux OpenTelemetry" loading="lazy" />
  <figcaption><a href="https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter">État documenté de l’exporter ClickHouse dans OpenTelemetry Collector Contrib</a>. La maturité varie selon le signal.</figcaption>
</figure>

Ce statut influence le périmètre. Un pilote logs et traces possède un chemin plus mûr qu’une migration simultanée des métriques et des profils.

Je figerais les versions du Collector, de l’exporter et du serveur pendant le test. Je conserverais les DDL créés et vérifierais les changements de schéma avant chaque montée de version.

Une distribution comme ClickStack fournit une intégration plus opinionated avec une UI et des schémas adaptés. Elle mérite le même inventaire : version, composants, chemins de mise à jour et responsabilités d’exploitation.

## Comparer des réponses, pas seulement des volumes

Deux backends peuvent recevoir le même nombre de spans et donner des résultats différents.

Les transformations de schéma, les timestamps, les types numériques, le sampling et les attributs peuvent modifier les agrégations. Une migration fiable rejoue des requêtes issues du terrain :

1. taux d’erreur par service et version ;
2. p95 par route sur une fenêtre précise ;
3. traces d’un tenant affecté ;
4. erreurs associées à une feature flag ;
5. corrélation log-trace par identifiants ;
6. comptage des événements pendant une perte réseau.

Pour chaque requête, je conserverais :

- le résultat attendu ;
- la latence à froid et à chaud ;
- le nombre de lignes et d’octets lus ;
- les différences de sémantique ;
- la facilité avec laquelle un ingénieur d’astreinte retrouve le chemin.

Le dernier point compte. Une requête SQL très puissante peut rester un échec si seules deux personnes savent l’écrire à 3 h du matin.

## Tester les pannes avant la bascule

La période de double écriture offre une fenêtre rare : le backend actuel reste disponible pendant qu’on casse le candidat.

Je testerais au minimum :

- ClickHouse indisponible ;
- queue du Collector pleine ;
- restart avec données persistées ;
- arrivée d’un schéma inattendu ;
- trop de petites parts ;
- perte d’un replica ;
- requête globale coûteuse pendant un pic d’ingestion ;
- expiration de données par TTL.

Chaque scénario doit produire une chronologie : ce qui a été perdu, retardé, dupliqué ou récupéré.

Une promesse d’at-least-once implique des doublons possibles. Le schéma et les requêtes doivent les tolérer ou les identifier. Une queue persistante implique un disque à dimensionner et à surveiller. Un retry implique une limite pour éviter qu’un backend mort ne transforme le Collector en stockage permanent.

## Migrer les usages par vagues

Une fois le flux validé, les usages peuvent basculer dans un ordre contrôlé.

Je commencerais par l’exploration ad hoc et les investigations, parce qu’elles profitent immédiatement des événements riches. Les dashboards non critiques viennent ensuite. Les alertes et SLO changent plus tard, après comparaison des fenêtres et des agrégations.

Les exports réglementaires et suppressions ciblées méritent un chantier séparé. Un moteur append-only et une rétention par TTL ne répondent pas automatiquement aux demandes de suppression individuelles.

Chaque vague possède :

- un propriétaire ;
- des requêtes de validation ;
- une période d’observation ;
- un critère de rollback ;
- une date d’arrêt dans l’ancien backend.

Sans date d’arrêt, le double run devient une architecture permanente. L’entreprise paie deux plateformes et une pipeline de comparaison que plus personne n’ose supprimer.

## Préparer la sortie avant l’entrée

La migration doit documenter comment quitter le nouveau backend.

Les points à conserver incluent :

- instrumentation et conventions indépendantes ;
- configurations Collector versionnées ;
- DDL et migrations de schéma ;
- requêtes critiques sous forme de tests ;
- format d’export des données ;
- durée et coût d’un backfill ;
- procédure pour réactiver l’ancien chemin pendant la fenêtre de transition.

L’OpenTelemetry Collector facilite le reroutage des nouveaux événements. Les données historiques restent un autre problème. Exporter plusieurs pétaoctets demande du temps, du réseau et un format de destination.

Le coût de sortie doit entrer dans le choix initial, pendant que tout le monde est encore enthousiaste.

## Un plan en quatre phases

Je résumerais la migration ainsi.

### 1. Observer

Inventorier les décisions, les requêtes, les volumes, les rétentions, les PII et les propriétaires.

### 2. Dupliquer

Envoyer un périmètre borné vers les deux backends avec queues indépendantes, métriques de pipeline et versions figées.

### 3. Comparer

Rejouer les enquêtes, mesurer les écarts, casser le candidat et corriger l’instrumentation ou le schéma.

### 4. Basculer

Déplacer les usages par vagues, conserver un rollback temporaire, puis arrêter réellement l’ancien chemin.

Cette progression paraît moins spectaculaire qu’un diagramme avant/après. Elle donne surtout un endroit précis où s’arrêter lorsque les données, les requêtes ou l’exploitation ne sont pas prêtes.

## Ce que cette série change dans ma lecture

Les discussions autour de l’Observability 2.0 décrivent une évolution crédible : conserver davantage de contexte, unifier la source de vérité et dériver les vues à la lecture.

ClickHouse rend ce modèle accessible à des volumes qui auraient auparavant poussé beaucoup d’équipes vers l’agrégation ou la suppression précoce. OpenTelemetry rend le chemin de collecte plus portable.

Le succès dépend ensuite d’un travail moins viral : nommer les attributs, protéger les données, choisir les clés d’ordre, surveiller les queues, tester les pannes et retirer l’ancienne stack.

C’est là que la théorie devient une plateforme.

## Sources

- [OpenTelemetry — Collector configuration](https://opentelemetry.io/docs/collector/configuration/)
- [OpenTelemetry Collector Contrib — ClickHouse Exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)
- [ClickHouse — Integrating OpenTelemetry](https://clickhouse.com/docs/use-cases/observability/integrating-opentelemetry)
- [ClickHouse — ClickStack](https://github.com/ClickHouse/ClickStack)
- [OpenTelemetry — File Storage Extension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/storage/filestorage)
