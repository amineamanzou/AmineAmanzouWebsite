---
title: "Observabilité 2.0 : ClickHouse change-t-il vraiment les règles ?"
locale: "fr"
articleSlug: "observabilite-2-clickhouse"
translationKey: "observability-2-clickhouse"
publishedAt: "2026-07-28"
label: "Observabilité / Analyse"
readTime: "11 min"
excerpt: "Les billets de Mat Duggan et Charity Majors ont relancé le débat sur ClickHouse, les wide events et le stockage unifié. Le changement est réel, mais il déplace aussi une partie de la complexité."
heroImage: "/blog/observabilite-2-clickhouse/cover.webp"
heroImageAlt: "L’Ingénieur Peu Fiable compare deux articles devant trois silos de télémétrie réunis dans un stockage colonnaire"
pillar: "observability"
intent: "informational"
primaryQuery: "observabilité 2.0"
relatedOffer: "fractional_lead"
seoTitle: "Observabilité 2.0 : ce que ClickHouse change vraiment"
seoDescription: "Réaction technique aux articles de Mat Duggan et Charity Majors sur ClickHouse, les wide events, la cardinalité et le stockage unifié."
keywords: ["observabilité 2.0", "ClickHouse", "wide events", "stockage unifié", "OpenTelemetry"]
proofLevel: "documentation"
---

J’ai ouvert le billet de Mat Duggan avec le réflexe habituel du SRE devant un titre qui annonce qu’un outil est en train de gagner une guerre : chercher à quel moment l’architecture allait se transformer en campagne militaire.

Le texte est beaucoup plus intéressant que son titre.

Mat raconte dix années passées à exploiter des plateformes de logs. Il décrit ce qui arrive quand quelques services deviennent quelques centaines, que les volumes montent et que la même donnée doit servir au développeur, à l’astreinte, au support et à la direction. Son constat est direct : à grande échelle, ClickHouse garde une forme plus stable que les stacks qu’il a opérées.

Quelques jours plus tard, Charity Majors a repris l’article pour défendre une thèse plus large. Selon elle, le moteur colonnaire compte, mais la bascule se joue surtout dans la façon de traiter la télémétrie : une donnée riche, structurée, conservée avec son contexte, puis explorée à la lecture.

Les deux articles ont beaucoup circulé. Ils mettent le doigt sur un changement réel. Ils mélangent aussi témoignage de terrain, chiffres publics, positionnement produit et théorie de l’observabilité. J’ai donc essayé de séparer les couches avant d’en tirer une conclusion.

<figure>
  <img src="/blog/observabilite-2-clickhouse/mat-duggan-article.png" alt="En-tête de l’article ClickHouse is winning the Observability Wars de Mat Duggan" loading="lazy" />
  <figcaption><a href="https://matduggan.com/clickhouse-is-winning-the-observability-wars/">Mat Duggan, « ClickHouse is winning the Observability Wars »</a>, publié le 1er juillet 2026.</figcaption>
</figure>

## Ce que Mat Duggan a réellement observé

Le billet de Mat repose sur un retour d’expérience. Il compare l’évolution opérationnelle de plusieurs familles de stacks lorsque l’ingestion passe d’environ 1 To par jour à 5 puis 10 To par jour.

À petite échelle, presque tout fonctionne. Elasticsearch reste agréable pour la recherche textuelle. La stack LGTM fournit des composants spécialisés. Datadog retire une grande partie de l’exploitation du backend. ClickHouse demande déjà de réfléchir au schéma et aux clés d’ordre.

Quand le volume monte, les chemins divergent.

Elasticsearch accumule les décisions de shards, de tiers de stockage et de cycle de vie. LGTM distribue plusieurs systèmes qui possèdent chacun leurs propres mécanismes de réplication, de compaction et de cache. Datadog reste simple à opérer côté client, mais la facture pousse souvent l’équipe à construire une pipeline chargée de ne pas envoyer les données au produit qu’elle paie.

Dans son expérience, ClickHouse demande surtout davantage de capacité et de shards. Le langage de requête, le moteur et le modèle mental bougent moins.

Ce retour est précieux parce qu’il vient avec des cicatrices. Les montants mensuels et les seuils publiés restent toutefois des estimations liées à des architectures précises. Ils ne constituent pas un benchmark reproductible entre offres managées, contrats négociés et déploiements self-hosted.

Je garde donc deux informations séparées :

- Mat a exploité plusieurs de ces architectures et décrit une différence de trajectoire ;
- les chiffres exacts ne peuvent pas être transposés automatiquement à une autre entreprise.

Cette séparation évite de transformer une expérience solide en loi universelle.

## La lecture de Charity Majors

Charity déplace le débat.

Une base colonnaire plus rapide ne suffit pas si l’organisation continue de traiter logs, métriques et traces comme trois produits sans tissu commun. On peut stocker chaque signal dans ClickHouse et reproduire exactement les mêmes silos, simplement avec une meilleure compression.

Sa définition de l’Observability 2.0 repose sur une source de vérité composée d’événements structurés larges. Chaque unité de travail conserve assez de contexte pour être découpée ensuite par version, client, région, feature flag, route, résultat ou identifiant de déploiement.

Le pivot méthodologique se voit dans le moment où les décisions sont prises.

Dans une architecture très agrégée, l’équipe décide à l’écriture quelles dimensions survivront. Elle choisit les labels d’une métrique, le niveau d’un log, les traces échantillonnées et les index à construire. Une question oubliée ce jour-là restera souvent impossible pendant l’incident.

Avec des événements riches et un moteur analytique adapté, davantage de décisions passent à la lecture. L’équipe conserve le détail puis construit l’agrégation utile à la question du moment.

<figure>
  <img src="/blog/observabilite-2-clickhouse/charity-majors-article.png" alt="En-tête de l’article de Charity Majors consacré à ClickHouse et à l’Observability 2.0" loading="lazy" />
  <figcaption><a href="https://charity.wtf/p/have-you-heard-clickhouse-is-winning">Charity Majors, « Have you heard? ClickHouse is winning the observability wars! »</a>, publié en juillet 2026.</figcaption>
</figure>

## Pourquoi ClickHouse correspond à ce modèle

Les données d’observabilité possèdent une forme favorable à un moteur analytique colonnaire.

Elles arrivent en continu, sont rarement mises à jour ligne par ligne et contiennent beaucoup de valeurs répétées : nom de service, environnement, région, statut, route ou message d’erreur. Une requête utilise souvent quelques colonnes au milieu d’un événement qui peut en contenir des dizaines ou des centaines.

ClickHouse stocke ces colonnes séparément. Une requête qui lit `service.name`, `http.response.status_code` et une durée n’a pas besoin de parcourir physiquement tous les autres attributs. Le tri des données et l’index clairsemé permettent aussi d’ignorer des blocs entiers lorsque les filtres correspondent à la clé d’ordre.

Cette architecture rend la haute cardinalité moins effrayante. Conserver un `trace_id`, un `user_id` pseudonymisé, un `build_id` ou un ensemble de feature flags ne provoque pas automatiquement le même coût qu’un index inversé construit pour chaque valeur.

Le gain dépasse le stockage. Les ingénieurs peuvent agréger, grouper et corréler avec SQL, sur les colonnes utiles à l’enquête.

## Le passage à l’échelle ne se résume pas à ajouter des shards

Le raccourci fonctionne bien dans un article. En production, la base réclame quand même son tribut.

La clé `ORDER BY` détermine la disposition physique des données. Une mauvaise clé oblige le moteur à lire beaucoup plus de granules. La corriger après avoir accumulé plusieurs pétaoctets ressemble moins à un changement de configuration qu’à un projet de migration.

Les petits inserts produisent des parts. Si elles arrivent plus vite que les merges ne peuvent les regrouper, la pression se déplace vers le stockage et les tâches de fond. ClickHouse recommande le batching ou les inserts asynchrones pour cette raison.

Le sharding ajoute aussi des décisions :

- quelle dimension distribue les écritures ;
- comment contenir le blast radius ;
- comment rééquilibrer les données ;
- quelles requêtes doivent toucher une cellule, une région ou l’ensemble du parc ;
- comment préserver la disponibilité pendant une panne de Keeper, de réseau ou de stockage objet.

ClickHouse documente lui-même ces contraintes dans l’évolution de LogHouse. La plateforme interne est passée de 19 PiB à plus de 100 PB, puis à 431 PiB de données non compressées. Pour y arriver, l’équipe a construit des geoshards, des cellules isolées, des inserts asynchrones et une hiérarchie de tables. C’est une belle preuve de capacité. C’est aussi la preuve qu’un système à cette échelle ne grandit pas avec un bouton `+ shard`.

## OpenTelemetry ne choisit pas la base

Une partie du débat finit par reprocher à OpenTelemetry de ne pas résoudre le coût de l’observabilité.

Cette attente lui donne une responsabilité qu’il n’a jamais eue.

OpenTelemetry définit des APIs, des SDKs, un protocole, des conventions sémantiques et une pipeline de collecte. Il aide à produire et transporter une télémétrie portable. Il ne décide ni du prix du stockage, ni de la clé d’ordre, ni de la rétention, ni de l’interface d’exploration.

On peut envoyer une excellente télémétrie OpenTelemetry vers un backend qui détruit son contexte. On peut aussi produire des événements très pauvres et les stocker dans ClickHouse à une vitesse impressionnante.

Le résultat dépend des deux côtés :

1. une instrumentation qui conserve le contexte utile ;
2. un backend capable de l’explorer sans punir chaque nouvelle dimension.

Le cas LogHouse apporte ici une nuance intéressante. ClickHouse a gardé OpenTelemetry pour une partie de ses signaux, puis développé SysEx pour extraire directement les tables système à très grande échelle. Cette spécialisation montre une limite d’un chemin générique pour une charge extrême. Elle ne rend pas le standard inutile pour le reste du système.

## Ce qui change vraiment dans la méthode

Le mouvement derrière l’Observability 2.0 me paraît plus important que son numéro de version.

Pendant longtemps, les discussions de plateforme commençaient par les signaux et les outils : quelle base pour les logs, quelle TSDB pour les métriques, quel backend pour les traces. Le modèle unifié commence par l’unité de travail et les questions que l’équipe devra poser.

Une requête arrive. Quelle version traite cette requête ? Quel tenant est concerné ? Quelle règle produit a été appliquée ? Quel feature flag était actif ? Quel appel a ralenti ? Quel résultat l’utilisateur a reçu ?

Cette manière de penser rapproche l’observabilité du développement. Elle permet de vérifier une release, de comparer un canary, d’expliquer une régression à un segment précis ou de relier une décision technique à un effet métier.

Elle augmente aussi la responsabilité de l’équipe. Conserver davantage de contexte demande une gouvernance des données, des règles sur les PII, une rétention cohérente et un contrôle des requêtes coûteuses. La cardinalité cesse d’être seulement une limite du vendor ; elle devient une donnée d’architecture à maîtriser.

## Mon avis après les deux articles

Mat Duggan a raison sur un point opérationnel : toutes les plateformes ne vieillissent pas de la même façon quand le volume est multiplié par dix.

Charity Majors a raison d’élargir le cadre : remplacer Elasticsearch par ClickHouse sans changer le modèle de données laisse une grande partie de la valeur sur la table.

ClickHouse apporte une fondation particulièrement adaptée aux événements larges, aux agrégations et aux volumes importants. Cette fondation ne fournit pas toute l’observabilité. Il reste l’instrumentation, les conventions, l’expérience de requête, les SLO de la pipeline, la gouvernance et l’équipe qui se réveille quand les parts commencent à s’accumuler.

Le changement intéressant tient dans l’ordre des décisions : conserver le contexte, standardiser ce qui peut l’être, puis dériver les vues utiles. Les outils suivent cette méthode. Ils ne la remplacent pas.

Dans la suite de cette série, je vais descendre d’un niveau : à quoi ressemble un wide event utile, pourquoi ClickHouse l’exécute efficacement et comment tester ce modèle sans jeter toute sa stack actuelle dans un ravin.

## Sources

- [Mat Duggan — ClickHouse is winning the Observability Wars](https://matduggan.com/clickhouse-is-winning-the-observability-wars/)
- [Charity Majors — Have you heard? ClickHouse is winning the observability wars!](https://charity.wtf/p/have-you-heard-clickhouse-is-winning)
- [Honeycomb — Observability 2.0 vs. Observability 1.0](https://www.honeycomb.io/blog/one-key-difference-observability1dot0-2dot0)
- [ClickHouse — Scaling our observability platform beyond 100 petabytes](https://clickhouse.com/blog/scaling-observability-beyond-100pb-wide-events-replacing-otel)
- [ClickHouse — A Quadrillion Rows across three Clouds: scaling LogHouse](https://clickhouse.com/blog/a-quadrillion-rows-across-the-three-cloud-scaling-loghouse)
- [OpenTelemetry specification overview](https://opentelemetry.io/docs/specs/otel/overview/)
