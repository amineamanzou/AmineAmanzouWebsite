---
title: "Wide events : instrumenter une requête sans détruire son contexte"
locale: "fr"
articleSlug: "wide-events-observabilite"
translationKey: "wide-events-observability"
publishedAt: "2026-08-04"
label: "OpenTelemetry / Instrumentation"
readTime: "10 min"
excerpt: "Un wide event conserve le contexte d’une unité de travail pour permettre des questions imprévues. OpenTelemetry fournit déjà une grande partie des briques, à condition de placer chaque information au bon endroit."
heroImage: "/blog/wide-events-observabilite/cover.webp"
heroImageAlt: "L’Ingénieur Peu Fiable rassemble le contexte d’une requête dans un événement structuré large"
pillar: "opentelemetry"
intent: "informational"
primaryQuery: "wide events observabilité"
relatedOffer: "otel_sprint"
seoTitle: "Wide events et OpenTelemetry : guide d’instrumentation"
seoDescription: "Construire des wide events avec OpenTelemetry : ressources, spans, logs, cardinalité, contexte métier et exemple d’instrumentation."
keywords: ["wide events", "OpenTelemetry", "événements structurés", "haute cardinalité", "instrumentation"]
proofLevel: "documentation"
---

Pendant un incident, je finis souvent par chercher une dimension qui n’existe pas.

Le dashboard montre que la latence a augmenté. La trace confirme qu’un appel vers la base prend plus de temps. Puis quelqu’un demande si le problème touche uniquement la nouvelle version mobile, les clients européens qui utilisent une feature flag précise ou les requêtes passées par le canary.

À cet instant, la qualité de la réponse dépend d’une décision prise plusieurs semaines plus tôt : est-ce que ce contexte a survécu à l’instrumentation et au stockage ?

Les wide events essaient de rendre cette situation moins aléatoire. L’idée consiste à décrire une unité de travail avec un événement structuré assez riche pour répondre à des questions qui n’étaient pas toutes connues au moment du développement.

Le terme paraît nouveau. Une grande partie des briques existe déjà dans OpenTelemetry. [Le premier article de cette série](/blog/observabilite-2-clickhouse/) pose le changement de méthode ; celui-ci descend dans l’instrumentation.

<figure>
  <img src="/blog/wide-events-observabilite/wide-event-anatomy-fr.svg" alt="Une requête traverse trois services et rassemble le contexte de resource, de span, de log et de métier dans un wide event" loading="lazy" />
  <figcaption>Un wide event conserve les dimensions utiles pendant l’exécution, avant que le contexte ne se disperse.</figcaption>
</figure>

## Un événement large décrit une unité de travail

Prenons une requête de paiement.

Elle arrive sur une version donnée du service, dans une région et un environnement précis. Elle appartient à un tenant. Elle transporte un panier, passe par une règle antifraude, consulte un prestataire, applique éventuellement une feature flag et produit un résultat.

Un événement utile peut conserver :

- l’identité stable du service et du déploiement ;
- la route et la méthode ;
- le tenant ou un identifiant utilisateur pseudonymisé ;
- la version du client ;
- les feature flags évaluées ;
- le statut métier du paiement ;
- la durée totale et celles des dépendances ;
- l’identifiant de trace ;
- le résultat du canary ou du rollback.

Cette largeur ne signifie pas que chaque champ doit devenir un label de métrique. Elle signifie que le backend peut retrouver le contexte lorsque la question le demande.

Une métrique agrégée répond rapidement à « combien de paiements échouent ? ». L’événement riche permet ensuite de demander « quelles versions, quels tenants et quelles règles antifraude sont surreprésentés dans ces échecs ? ».

## OpenTelemetry possède déjà plusieurs niveaux de contexte

OpenTelemetry ne stocke pas un document JSON géant sans structure. Son modèle sépare plusieurs responsabilités.

### La resource décrit ce qui produit la télémétrie

Une resource identifie l’entité observée : service, version, environnement, pod, conteneur, cluster ou région.

Ces attributs décrivent la source et restent stables pendant la durée de vie de la resource. `service.name`, `service.version` et `deployment.environment.name` appartiennent naturellement à ce niveau.

Mettre un `user.id` ou un `order.id` dans la resource serait une erreur. Leur valeur change à chaque requête et ferait exploser le nombre de resources.

### Le span décrit une opération avec une durée

Un span représente une opération : requête HTTP, appel de base, publication dans une queue ou traitement d’un job.

Ses attributs portent le contexte utile à cette opération. La convention HTTP peut décrire la route, la méthode, le statut et certaines informations réseau. Des attributs applicatifs ajoutent le tenant, la version du client ou le résultat métier quand ils servent réellement l’enquête.

Le span possède également un statut, des événements ponctuels et des liens vers d’autres spans. Il est déjà très proche d’un événement large : structuré, corrélé et rattaché à une unité de travail.

### Le log décrit un événement ponctuel

Le modèle de logs OpenTelemetry contient un timestamp, un corps, une sévérité, des attributs, une resource et éventuellement un `trace_id` et un `span_id`.

Cette corrélation compte énormément. Un événement métier ou une erreur détaillée peut rester un log autonome tout en rejoignant la requête qui l’a produit.

Un log sans identifiant de trace, sans resource et avec un corps entièrement libre demande beaucoup plus de reconstruction au backend. Le moteur peut l’ingérer très vite ; l’astreinte continuera quand même à jouer au puzzle.

## Un exemple de wide event

Voici une représentation simplifiée d’un événement de fin de requête. Les noms applicatifs qui ne relèvent pas encore des conventions sémantiques utilisent un namespace propre à l’organisation.

```json
{
  "timestamp": "2026-08-04T09:42:18.231Z",
  "trace_id": "7af0…9c21",
  "span_id": "18bc…42d0",
  "service.name": "checkout-api",
  "service.version": "2026.08.04-3",
  "deployment.environment.name": "production",
  "http.request.method": "POST",
  "http.route": "/checkout",
  "http.response.status_code": 502,
  "enduser.pseudo_id": "usr_8f1…",
  "acme.tenant.id": "tenant_42",
  "acme.client.version": "ios-9.14.0",
  "acme.feature_flags": ["new-fraud-score", "async-receipt"],
  "acme.payment.provider": "provider-b",
  "acme.payment.outcome": "upstream_timeout",
  "duration_ms": 842
}
```

Le préfixe `acme` est volontairement fictif. Il montre où une organisation doit documenter ses attributs en attendant qu’une convention stable existe.

L’événement ne contient pas le nom complet, l’adresse email, le numéro de carte ou le contenu du panier. Conserver le contexte ne donne pas une permission de stocker les données personnelles disponibles.

## La cardinalité devient utile quand elle répond à une question

`service.name` possède peu de valeurs. `trace_id` en possède presque autant que de traces. `user.id`, `session.id`, `order.id` ou `build.id` montent également très vite.

Dans un système de métriques, ajouter ces dimensions à chaque série peut créer un volume ingérable. Dans un stockage d’événements colonnaire, elles restent des colonnes ou des attributs consultables.

Cette capacité ne rend pas chaque champ gratuit.

La haute cardinalité augmente le volume, influence la compression, change les chemins de requête et peut exposer des informations sensibles. Elle mérite une décision explicite :

- quelle enquête ce champ débloque ;
- combien de temps il doit rester ;
- s’il peut être haché ou pseudonymisé ;
- quelles équipes peuvent le requêter ;
- si le backend l’indexe, le trie ou le parcourt seulement à la demande.

J’aime bien garder une règle simple : une dimension doit survivre parce qu’elle aide une décision, un diagnostic ou une preuve. « On l’a déjà dans l’objet » ne suffit pas.

## Les wide events ne suppriment pas les métriques

Le discours autour de l’Observability 2.0 donne parfois l’impression que les métriques deviennent inutiles.

Les compteurs et histogrammes restent excellents pour l’alerte, les tendances, la capacité et les SLO. Leur structure bornée permet des calculs prévisibles et rapides.

Le changement concerne leur rôle. Une métrique peut signaler une anomalie sans porter tout le contexte nécessaire à son explication. Les événements riches prennent le relais pour découper le phénomène.

OpenTelemetry décrit d’ailleurs une relation possible entre ces modèles. Les métriques peuvent être dérivées de flux de spans ou de logs. Les exemplars peuvent rattacher un point agrégé à une trace. Le backend peut construire une vue temporelle à partir des événements conservés.

L’équipe évite alors de demander au même signal d’être simultanément une alarme compacte et un dossier d’enquête complet.

## Un événement par requête ne suffit pas toujours

Une requête distribuée traverse plusieurs services. Chaque hop peut produire son propre span riche. La trace relie ces unités.

Pour un job long, une seule ligne finale peut arriver trop tard. Des événements intermédiaires ou des « pulses » documentent l’avancement, les retries et les checkpoints.

Pour une queue, le producteur et le consommateur vivent parfois dans des traces différentes. Les span links conservent la relation causale sans fabriquer un parent artificiel.

Le modèle doit suivre la réalité de l’exécution. Un énorme événement final qui tente d’embarquer tout le système devient aussi difficile à produire qu’à gouverner.

## Les pièges que je regarderais en review

Le premier piège consiste à copier toutes les données métier dans la télémétrie. Une instrumentation utile sélectionne du contexte ; elle ne duplique pas la base de production.

Le deuxième consiste à inventer des attributs sans registre. `customer`, `customer_id`, `tenant`, `account.id` et `user.company` finissent par décrire la même chose dans cinq équipes. La requête unifiée redevient une chasse aux synonymes.

Le troisième consiste à enrichir uniquement dans le Collector. Le Collector peut ajouter l’environnement, le cluster ou des métadonnées Kubernetes. Il connaît rarement la décision métier qui vient d’être prise dans le code.

Le quatrième consiste à attendre l’incident pour vérifier les attributs. Une instrumentation mérite des tests : présence des resources, conformité des noms, absence de PII, corrélation trace-log et stabilité du volume.

## Ce que je mettrais en place

Je commencerais par une seule unité de travail importante, par exemple le checkout, la création de compte ou un déploiement.

Je listerais les questions qui reviennent pendant les incidents et les reviews de release. Je classerais ensuite le contexte entre resource, attribut de span, événement de span, log corrélé et métrique.

Puis je vérifierais cinq choses sur de vraies données :

1. retrouver une requête précise ;
2. grouper les erreurs par version et feature flag ;
3. passer de l’alerte à quelques traces représentatives ;
4. supprimer ou masquer les identifiants sensibles ;
5. mesurer le volume ajouté et le coût de requête.

Cette boucle produit un wide event utilisable. Ajouter trois cents champs avant d’avoir écrit une seule requête produit surtout un document très large que personne n’ouvre.

Dans l’article suivant, je passe de l’événement au moteur : pourquoi ClickHouse sait lire ce type de données rapidement, et à quels endroits la mécanique commence à réclamer une équipe qui comprend les parts, les merges et les clés d’ordre.

## Sources

- [OpenTelemetry — Logs Data Model](https://opentelemetry.io/docs/specs/otel/logs/data-model/)
- [OpenTelemetry — Resource Data Model](https://opentelemetry.io/docs/specs/otel/resource/data-model/)
- [OpenTelemetry — Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
- [OpenTelemetry — Metrics Data Model](https://opentelemetry.io/docs/specs/otel/metrics/data-model/)
- [Honeycomb — Observability 2.0 vs. Observability 1.0](https://www.honeycomb.io/blog/one-key-difference-observability1dot0-2dot0)
