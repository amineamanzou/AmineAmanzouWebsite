---
title: "ClickHouse pour l’observabilité : pourquoi ça scale et où ça casse"
locale: "fr"
articleSlug: "clickhouse-observabilite-scale"
translationKey: "clickhouse-observability-scale"
publishedAt: "2026-08-11"
label: "Observabilité / Architecture"
readTime: "12 min"
excerpt: "ClickHouse correspond bien aux données d’observabilité : colonnes, compression, agrégations et événements append-only. Les performances dépendent pourtant de décisions très concrètes sur le tri, les inserts, les parts et le sharding."
heroImage: "/blog/clickhouse-observabilite-scale/cover.webp"
heroImageAlt: "L’Ingénieur Peu Fiable ajoute un shard à une plateforme ClickHouse pendant que des petites parts s’accumulent"
pillar: "observability"
intent: "comparative"
primaryQuery: "ClickHouse observabilité"
relatedOffer: "diagnostic"
seoTitle: "ClickHouse pour l’observabilité : forces et limites"
seoDescription: "Pourquoi ClickHouse scale pour les logs et les traces : stockage colonnaire, ORDER BY, inserts, parts, merges, sharding et limites opérationnelles."
keywords: ["ClickHouse observabilité", "logs ClickHouse", "OpenTelemetry ClickHouse", "MergeTree", "ClickStack"]
proofLevel: "documentation"
---

Quand une démonstration ClickHouse se passe bien, le moteur donne une impression légèrement dangereuse.

On charge quelques milliards de lignes, on lance un `GROUP BY`, le résultat revient avant la fin de la phrase et quelqu’un commence à calculer combien d’outils pourraient être remplacés avant vendredi.

La performance est réelle. La conclusion demande un peu plus de travail.

ClickHouse possède une architecture très adaptée aux logs, aux traces et aux [événements structurés larges](/blog/wide-events-observabilite/). Elle explique une grande partie de son adoption dans les plateformes d’observabilité. Elle impose aussi une mécanique particulière : les requêtes doivent profiter de l’ordre physique, les écritures doivent arriver par lots et les parts doivent fusionner assez vite.

Comprendre cette mécanique aide davantage qu’un nouveau graphique « lignes par seconde ».

## Pourquoi les données d’observabilité lui vont bien

Un flux de télémétrie est principalement append-only.

Les applications ajoutent des logs et des spans. Elles mettent rarement à jour un événement précis plusieurs jours plus tard. La rétention supprime des fenêtres entières plutôt que quelques lignes choisies une par une.

Les événements sont également larges. Un span OpenTelemetry peut transporter l’identité du service, la route, le statut, la durée, les attributs de resource, les événements et les liens. Une requête d’enquête n’utilise pourtant qu’une petite partie de ces colonnes.

Le stockage colonnaire permet à ClickHouse de lire uniquement les colonnes demandées. La répétition des valeurs à l’intérieur d’une colonne améliore aussi la compression : `service.name`, `environment`, `region` ou `status_code` reviennent très souvent.

Enfin, les usages sont analytiques. L’astreinte filtre une fenêtre temporelle, groupe par service ou version, calcule des quantiles et cherche une population anormale. Ce profil correspond bien à un moteur OLAP vectorisé.

## Le wide event ne coûte pas comme une ligne orientée document

Dans une base orientée lignes, les champs d’un événement restent stockés ensemble. Lire trois champs peut entraîner la lecture physique d’un document beaucoup plus large.

ClickHouse range chaque colonne dans ses propres fichiers. Un événement de cent attributs ne force donc pas chaque requête à lire les cent attributs.

Cette propriété change la relation à la largeur. Ajouter un champ contextuel reste une décision de volume et de gouvernance, mais ce champ ne pénalise pas toutes les requêtes de la même façon.

La haute cardinalité profite d’un mécanisme similaire. ClickHouse ne construit pas automatiquement un index complet pour chaque valeur. Il utilise principalement un index primaire clairsemé organisé par granules. Les attributs comme `trace_id` ou `user_id` peuvent rester stockés sans créer une série temporelle par valeur.

Le moteur doit quand même retrouver ces lignes. C’est là que la clé d’ordre entre dans la pièce.

## `ORDER BY` dessine le chemin des requêtes

Dans les tables `MergeTree`, la clause `ORDER BY` détermine l’ordre physique des données sur disque. L’index primaire conserve des repères espacés, par défaut un repère pour chaque granule de 8 192 lignes.

Quand une requête filtre sur le début de cette clé, ClickHouse peut ignorer de grandes zones. Quand le filtre ne correspond pas à l’ordre, il lit beaucoup plus de granules.

Le schéma par défaut de l’exporter ClickHouse pour OpenTelemetry illustre ce compromis. La table de logs est ordonnée autour d’un bucket temporel, du nom de service et du timestamp. Les requêtes temporelles par service sont naturelles. Une recherche par `trace_id` ou attribut arbitraire peut demander un skip index, une projection, une table auxiliaire ou davantage de scan.

```sql
SELECT
  ServiceName,
  SpanAttributes['deployment.version'] AS version,
  quantile(0.95)(Duration) AS p95
FROM otel_traces
WHERE Timestamp >= now() - INTERVAL 30 MINUTE
  AND SpanAttributes['feature.flag'] = 'new-checkout'
GROUP BY ServiceName, version
ORDER BY p95 DESC;
```

Cette requête semble banale. Ses performances dépendent de la fenêtre temporelle, de la clé de tri, de la quantité de colonnes lues et de la distribution des attributs.

Un modèle d’observabilité doit donc commencer par les questions fréquentes :

- recherche temporelle par service ;
- récupération d’une trace complète ;
- comparaison entre versions ;
- agrégation par tenant ou feature flag ;
- recherche textuelle dans les logs ;
- dashboards récurrents.

Une seule disposition physique ne sera pas optimale pour tous ces chemins. Les projections, vues matérialisées et index de saut existent pour compléter le tri principal. Ils ajoutent à leur tour du stockage et du travail à l’écriture.

## Les petits inserts fabriquent une dette très concrète

Chaque insert dans une table `MergeTree` crée une part avec ses données, sa métadonnée et ses index. Les tâches de fond fusionnent ensuite les petites parts en parts plus grandes.

Si des centaines de producteurs envoient constamment de minuscules lots, les parts peuvent apparaître plus vite que les merges ne les absorbent. Le nombre de fichiers monte, la pression sur les merges augmente et ClickHouse finit par ralentir ou refuser des écritures avec `TOO_MANY_PARTS`.

La documentation recommande des lots d’au moins plusieurs milliers de lignes ou une fréquence d’insert maîtrisée. Les inserts asynchrones permettent au serveur de regrouper de petites écritures avant de créer les parts.

L’exporter ClickHouse dans OpenTelemetry Collector Contrib a également déplacé le batching dans sa `sending_queue`. Sa documentation recommande d’utiliser ce mécanisme interne, avec une taille minimale et un délai de flush, plutôt qu’un simple processeur `batch` placé avant l’exporter.

```yaml
exporters:
  clickhouse:
    endpoint: tcp://clickhouse:9000
    async_insert: true
    sending_queue:
      num_consumers: 10
      batch:
        min_size: 5000
        flush_timeout: 5s
```

Ces six lignes racontent une partie importante de l’exploitation. Le backend peut ingérer énormément de données, à condition de ne pas lui livrer chaque événement comme un colis individuel.

## Les merges consomment le travail différé

ClickHouse déplace une partie du coût vers l’arrière-plan.

Les parts fusionnent, les TTL suppriment les données arrivées en fin de rétention, les vues matérialisées alimentent d’autres tables et la réplication maintient les copies. La marge de CPU, de mémoire et d’I/O doit couvrir les requêtes visibles et ce travail différé.

Forcer régulièrement `OPTIMIZE TABLE ... FINAL` pour remettre la table « au propre » ressemble souvent à un symptôme. La commande peut consommer beaucoup de ressources et fusionner des parts que le moteur aurait traitées progressivement.

Les métriques utiles ne se limitent donc pas au débit d’ingestion :

- nombre et taille des parts actives ;
- backlog et durée des merges ;
- latence des inserts ;
- rejets et retries ;
- espace disque et vitesse de croissance ;
- granules et octets lus par les requêtes critiques ;
- latence par type de requête.

Une plateforme rapide qui ne montre pas son propre travail de fond prépare une astreinte assez ironique.

## Ajouter des shards ajoute aussi des choix

Le sharding distribue la capacité. Il introduit une topologie.

Une clé de sharding mal choisie produit des hotspots. Une distribution aléatoire équilibre les écritures, mais peut forcer davantage de shards à participer aux requêtes. Une distribution par tenant ou région limite certaines lectures, au prix d’un risque de déséquilibre.

Le rééquilibrage de données existantes demande aussi un plan. Ajouter un shard ne déplace pas magiquement les anciennes parts. Les équipes pré-provisionnent, changent les poids pour les nouvelles écritures ou organisent une migration avec double écriture.

La réplication et ClickHouse Keeper couvrent d’autres dimensions : disponibilité des métadonnées, quorum, remplacement d’un replica et comportement pendant les partitions réseau.

La forme du moteur reste reconnaissable quand la plateforme grandit. L’architecture autour du moteur continue d’évoluer.

## LogHouse montre la capacité et la complexité

Les chiffres publiés par ClickHouse sur sa plateforme interne LogHouse donnent un repère rare.

En juin 2026, l’équipe indique 431 PiB de données non compressées, 1,59 quadrillion de lignes, plus de trente régions et des pics de 80 GiB/s et 190 millions de lignes par seconde. Les données sont réparties dans 36 cellules ClickHouse sur trois clouds.

<figure>
  <img src="/blog/clickhouse-observabilite-scale/loghouse-scale.png" alt="Article ClickHouse présentant 431 PiB et 1,59 quadrillion de lignes dans LogHouse" loading="lazy" />
  <figcaption><a href="https://clickhouse.com/blog/a-quadrillion-rows-across-the-three-cloud-scaling-loghouse">ClickHouse, « A Quadrillion Rows across three Clouds: scaling LogHouse »</a>. Chiffres publiés par l’équipe qui exploite la plateforme.</figcaption>
</figure>

Le design a progressé par étapes : une instance par région, puis des geoshards, plusieurs cellules dans les régions chargées, des écritures isolées, des inserts asynchrones et une hiérarchie de tables pour les lectures globales.

Cette histoire confirme la capacité de ClickHouse. Elle documente aussi les composants construits pour atteindre ce niveau. Je la lis comme un retour d’architecture, pas comme la promesse que toute installation suivra la même courbe.

## L’exporter OpenTelemetry possède ses propres limites

Le composant `clickhouseexporter` de Collector Contrib accepte logs, traces, métriques et profils. Sa matrice de stabilité doit rester visible dans une décision d’architecture :

- logs et traces : beta ;
- métriques : alpha ;
- profils : development.

Le schéma par défaut accélère un démarrage et facilite un lab. Une plateforme durable peut choisir de posséder ses DDL, ses migrations et ses vues plutôt que de laisser chaque mise à jour de composant modifier implicitement la couche de stockage.

Les benchmarks publiés dans le README donnent des ordres de grandeur. Ils ne remplacent pas un test avec la largeur réelle des événements, la rétention, les requêtes, les codecs et le stockage de l’entreprise.

## Quand ClickHouse est un bon choix

Le moteur devient particulièrement intéressant lorsque plusieurs conditions se rencontrent :

- le volume rend le prix par Go ou l’indexation systématique douloureux ;
- les événements sont structurés et riches ;
- les équipes ont besoin d’agrégations et de corrélations arbitraires ;
- SQL est acceptable comme interface de puissance ;
- une équipe peut posséder le schéma, les SLO et les migrations ;
- la rétention longue apporte une valeur réelle.

À l’inverse, un petit volume, une équipe sans compétence base distribuée et un besoin principalement centré sur une recherche textuelle simple peuvent favoriser une solution managée plus immédiate.

Une plateforme d’observabilité contient également une UI, des alertes, des contrôles d’accès, une expérience de trace, des dashboards, une gestion des schémas et du support. ClickStack et HyperDX remplissent une partie de cet espace. La base seule ne remplace pas ces usages.

## Ce que je testerais avant de choisir

Je partirais d’un échantillon représentatif plutôt que d’un générateur de lignes uniformes.

Le protocole contiendrait :

1. la largeur et la cardinalité réelles des événements ;
2. plusieurs profils de requêtes issus des incidents ;
3. un pic d’ingestion et une période calme ;
4. la perte d’un collector ou d’un replica ;
5. l’accumulation de petites parts ;
6. un changement de schéma ;
7. une estimation de stockage compressé et de coût d’exploitation.

Je conserverais les versions, les DDL, les requêtes, les paramètres et les résultats. Un `SELECT count()` rapide sur un milliard de lignes fait une bonne démo. Une décision de plateforme a besoin de voir ce qui se passe quand la clé d’ordre ne correspond pas, qu’une region produit deux fois plus de trafic et que les merges ont une heure de retard.

ClickHouse scale parce que son architecture correspond au problème. Il casse aux endroits où cette architecture est mal alimentée, mal triée ou exploitée sans marge.

Dans le dernier article de la série, je vais utiliser cette conclusion pour construire une migration progressive. L’objectif consiste à tester le modèle unifié tout en gardant un chemin de retour et un backend actuel encore capable de répondre pendant la comparaison.

## Sources

- [ClickHouse — The definitive guide to query optimization](https://clickhouse.com/resources/engineering/clickhouse-query-optimisation-definitive-guide)
- [ClickHouse — Best practices for inserts](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [ClickHouse — A Quadrillion Rows across three Clouds: scaling LogHouse](https://clickhouse.com/blog/a-quadrillion-rows-across-the-three-cloud-scaling-loghouse)
- [OpenTelemetry Collector Contrib — ClickHouse Exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)
- [ClickHouse — ClickStack](https://clickhouse.com/blog/clickstack-a-high-performance-oss-observability-stack-on-clickhouse)
