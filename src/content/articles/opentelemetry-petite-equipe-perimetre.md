---
title: "OpenTelemetry dans une petite équipe : par quoi je commence"
locale: "fr"
articleSlug: "opentelemetry-petite-equipe-perimetre"
translationKey: "opentelemetry-petite-equipe-perimetre"
publishedAt: "2026-12-31"
label: "Observability / Engineering"
readTime: "5 min"
excerpt: "L’ordre dans lequel je mets en place OpenTelemetry dans une petite équipe, ce qu’on construit trop tôt, l’erreur que j’ai faite sur les métriques et la pile minimale pour démarrer."
heroImage: "/blog/opentelemetry-petite-equipe-perimetre/cover.webp"
heroImageAlt: "L’Ingénieur Peu Fiable montre du doigt trois cases numérotées : des logs et un signal de santé, une cascade de traces, puis une fenêtre de navigateur"
pillar: "opentelemetry"
intent: "informational"
primaryQuery: "opentelemetry petite equipe perimetre"
relatedOffer: "diagnostic"
seoTitle: "OpenTelemetry dans une petite équipe : par quoi je commence"
seoDescription: "L’ordre dans lequel je mets en place OpenTelemetry dans une petite équipe, ce qu’on construit trop tôt, l’erreur que j’ai faite sur les métriques et la pile minimale pour démarrer."
keywords: ["opentelemetry", "OpenTelemetry", "opentelemetry petite equipe perimetre"]
proofLevel: "experience"
---

J’ai accompagné comme cloud engineer une startup portugaise qui fait de l’e-commerce dans le frais. Il fallait déployer leur SaaS sur GCP, une architecture trois tiers, le conteneuriser et le poser sur des machines pour mettre leur solution à l’épreuve. Avec leur lead dev, j’ai mis en place une base OpenTelemetry pour l’observabilité.

L’autre petite équipe que je connais bien, c’est moi, sur ma propre infrastructure. Dans les deux cas, je m’y prends dans le même ordre.

## L’ordre que je suis

Il faut commencer par les basiques. Déployer OpenTelemetry, activer la surveillance de la santé des collecteurs, puis configurer le transfert des logs et celui des métriques.

Vient ensuite le tracing. On ajoute l’auto-instrumentation, puis on identifie les enjeux métier sur lesquels un incident fait mal, et on s’assure que le tracing est bien fait à cet endroit précis.

Prenons une boutique en ligne comme la leur. Elle doit surveiller l’état des paniers, le nombre d’abandons et la latence du service de paiement, parce que c’est un fournisseur externe comme Stripe. On a commencé par l’auto-instrumentation, très bien. Mais sur ces segments-là, il faut absolument ajouter de l’instrumentation manuelle pour obtenir quelque chose d’adapté aux enjeux du client.

En dernier arrive ce qui se passe côté utilisateur : le RUM, les statistiques de visite, le comportement de quelqu’un qui vient de rencontrer un bug. Ça vient dans un second temps.

<figure>
  <img src="/blog/opentelemetry-petite-equipe-perimetre/setup-order-fr.svg" alt="Schéma en trois étapes : les basiques avec les logs et les métriques, puis le tracing avec de l’instrumentation manuelle sur les parcours métier, puis le côté utilisateur ; les dashboards ne viennent pas au début" loading="lazy" />
  <figcaption>Les trois étapes, dans l’ordre.</figcaption>
</figure>

## Ce qu’on construit trop tôt

Les dashboards. Toutes les équipes commencent par là, et j’ai déjà écrit qu’il vaut mieux [définir ses SLO d’abord](/blog/slo-avant-dashboards/).

Aujourd’hui, à l’époque des agents, on n’a plus forcément besoin d’un dashboard figé qui restreint la vision. On peut créer un dashboard à la demande en interrogeant l’IA, et ne garder que ceux qui sont revenus plusieurs fois.

Une petite équipe a mieux à faire : des alertes actionnables, un budget maîtrisé et [moins de bruit](/blog/reduire-fatigue-alerte/). Moins on est nombreux, plus le bruit pèse sur chacun.

## L’erreur que j’ai faite sur les métriques

Ce que j’ai surconstruit, ce sont les métriques. On veut bien faire, on veut tout garder, et on se retrouve à relever des millions de métriques sans regarder leur cardinalité. Souvent, les indicateurs RED suffisent pour connaître la santé d’un service : le débit, les erreurs et la durée.

Ça m’est arrivé sur mon infrastructure perso. J’ai fait plusieurs cycles de nettoyage. J’ai demandé à un agent de relire mes dernières investigations d’incident et de repérer les métriques qui n’étaient que du bruit, celles qui n’apportaient de réponse ni à une investigation ni à une action. Puis on a épuré.

## La pile minimale

Si je démarrais aujourd’hui, je prendrais un simple Prometheus avec Grafana pour les métriques. C’est le moyen le plus simple et le plus rapide.

Le jour où j’ai des clients en production et que je dois suivre de plus près ce qui se passe, je migre vers une solution tout-en-un qui couvre tous les signaux, comme [Dash0 ou ClickHouse](/blog/clickhouse-dash0-tsuga-conseil/).

## OpenTelemetry n’est pas trop compliqué

Ce n’est pas un agent haut de gamme où tout est pris en charge sans rien configurer, je suis d’accord. Mais le projet est mûr, et la documentation est abondante.

Une petite équipe peut même aller plus loin que la plupart des PME et des entreprises de la tech, en construisant sa propre distribution du [Collector](https://opentelemetry.io/docs/collector/) avec les receivers et les exporters qu’il lui faut. Avec l’IA, quelques personnes ont aujourd’hui la productivité pour le faire.

S’occuper d’OpenTelemetry n’est pas le plus difficile. Le plus difficile, c’est ce qui arrive dans le backend : contrôler le budget de ce qu’on observe par rapport à ce que ça rapporte, ou à ce dont ça protège.

On rend l’observabilité compliquée en parlant sans cesse de nouveaux signaux. Dans une startup, ce n’est pas ce qu’on attaque au départ. Le mantra, c’est « keep it simple, stupid ». Quand on le suit, les configurations OpenTelemetry restent très basiques, et il n’y a pas besoin de transformations ultra complexes pour arriver à ses fins.
