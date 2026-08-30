---
title: "Monitoring ou observabilité : ce que la différence change en production"
locale: "fr"
articleSlug: "monitoring-vs-observabilite-production"
translationKey: "monitoring-vs-observability-production"
publishedAt: "2026-09-08"
label: "Observabilité / Production"
readTime: "9 min"
excerpt: "Le monitoring détecte et suit des conditions connues. L’observabilité devient utile quand l’équipe doit expliquer un comportement qu’elle n’avait pas prévu de mettre dans un dashboard."
heroImage: "/blog/monitoring-vs-observabilite-production/hero-known-unknown-questions.svg"
heroImageAlt: "Comparaison entre un écran de monitoring qui signale un symptôme et une enquête d’observabilité qui suit une requête"
pillar: "observability"
intent: "comparative"
primaryQuery: "monitoring vs observabilité"
relatedOffer: "diagnostic"
seoTitle: "Monitoring vs observabilité : différence en production"
seoDescription: "Monitoring, logs, métriques et traces : comprendre ce que l’observabilité ajoute réellement pendant un incident et comment évaluer son système."
keywords: ["monitoring vs observabilité", "observabilité", "monitoring", "production", "OpenTelemetry"]
proofLevel: "documentation"
---

Une review peut afficher un inventaire complet de dashboards, plusieurs outils d’APM et une page entière d’alertes.

Puis je demande pourquoi une transaction précise a ralenti après le dernier déploiement.

La réponse devient beaucoup moins visible que le symptôme.

Le monitoring n’est pas absent. Il fonctionne même parfois très bien : CPU, mémoire, erreurs HTTP, saturation des pools, disponibilité des endpoints. L’équipe sait qu’un symptôme existe. Elle ne sait simplement pas encore reconstruire le chemin qui l’a produit.

C’est à cet endroit que la différence entre monitoring et observabilité cesse d’être un débat de vocabulaire.

## Le monitoring répond à des questions préparées

Un système de monitoring collecte, agrège et affiche des informations choisies à l’avance.

On décide de suivre le taux d’erreur, la latence, le nombre de requêtes, la saturation, la taille d’une queue ou l’espace disque. On configure ensuite des dashboards et des seuils pour voir leur évolution.

Cette préparation est une force.

Quand une équipe connaît les conditions dangereuses d’un système, elle ne devrait pas attendre qu’un humain explore des traces pour les détecter. Une sonde synthétique peut confirmer que le parcours de connexion répond. Une métrique peut montrer qu’un budget d’erreur brûle trop vite. Une alerte peut réveiller la personne d’astreinte parce qu’une action immédiate est nécessaire.

Le chapitre *Monitoring Distributed Systems* du livre SRE de Google sépare déjà deux questions : qu’est-ce qui est cassé, et pourquoi ? Le premier signal décrit souvent un symptôme visible par l’utilisateur. Le second demande d’explorer des causes intermédiaires.

Le monitoring est particulièrement efficace pour la première question lorsque l’équipe a correctement choisi ce qu’elle voulait mesurer.

## L’observabilité commence quand la question n’était pas prévue

En production, les incidents respectent rarement le découpage des dashboards.

La latence n’augmente peut-être que pour les clients d’une région, sur une version mobile, avec une feature flag et un prestataire de paiement précis. Le taux d’erreur global reste acceptable. Les CPU sont verts. La base répond.

Le support possède pourtant dix tickets qui racontent le même symptôme.

Pour enquêter, l’équipe doit pouvoir partir d’un résultat utilisateur et traverser les couches du système : requête, service, dépendance, déploiement, configuration, queue, base, réseau et événement métier. Elle a besoin de dimensions qui n’étaient pas toutes connues lors de la création du dashboard.

Cette capacité correspond à ce que je cherche derrière le mot observabilité : poser une question nouvelle sur l’état interne d’un système à partir des signaux qu’il expose.

OpenTelemetry classe actuellement ces signaux en traces, métriques, logs et baggage, avec les profils qui progressent également dans l’écosystème. Aucun de ces formats ne garantit l’observabilité à lui seul.

Une trace sans attribut métier peut rester muette. Un log sans identité de service ni `trace_id` devient un texte isolé. Une métrique avec une cardinalité incontrôlée peut coûter très cher sans aider l’enquête. Installer un Collector ne corrige pas automatiquement ces choix.

## Un dashboard vert peut décrire un système qui échoue

Les dashboards agrègent volontairement.

Cette propriété rend les tendances lisibles, mais elle peut aussi effacer une population minoritaire. Si 2 % des transactions échouent sur un segment important, la moyenne globale peut rester rassurante. Si une requête passe par cinq services, chaque équipe peut afficher un composant vert pendant que le parcours complet dépasse la latence acceptable.

Je regarde donc le dashboard comme une entrée dans l’enquête, pas comme un verdict.

Un écran de service devrait au minimum permettre de passer :

- du symptôme utilisateur vers quelques requêtes représentatives ;
- d’un changement de latence vers les versions et déploiements concernés ;
- d’une erreur vers ses logs corrélés et la dépendance appelée ;
- d’un volume anormal vers la source, le tenant ou le chemin qui l’a généré ;
- d’un SLO menacé vers les événements qui consomment le budget d’erreur.

Si chaque transition demande d’ouvrir un autre outil, de changer manuellement la fenêtre temporelle et de recopier trois identifiants, l’équipe possède plusieurs produits de monitoring. Elle ne possède pas encore une expérience d’enquête cohérente.

## Les logs, métriques et traces ne se remplacent pas

Les comparaisons marketing cherchent souvent un signal gagnant.

Sur le terrain, leurs rôles se complètent.

Les métriques répondent vite à des questions agrégées : combien, à quelle vitesse, avec quelle évolution et quel budget consommé. Elles conviennent bien aux alertes, aux tendances et à la capacité.

Les traces suivent une unité de travail entre plusieurs composants. Elles aident à comprendre où le temps est dépensé, quelle dépendance a répondu et quel chemin une requête a réellement suivi.

Les logs conservent des événements et des détails que l’application choisit d’émettre. Ils restent précieux pour les erreurs, les décisions métier, les changements d’état et les investigations qui nécessitent du texte ou une structure plus libre.

La qualité vient des relations entre ces signaux. Un exemplar relie une mesure agrégée à une trace. Un `trace_id` rattache un log à l’opération qui l’a produit. Des attributs de resource cohérents permettent de comparer le même service dans deux environnements.

Sans ces relations, l’équipe assemble le puzzle à la main pendant l’incident.

## L’observabilité se vérifie avec des questions

Je me méfie d’un audit qui commence par compter les agents installés.

Je préfère prendre quelques situations concrètes :

1. retrouver une transaction signalée par le support ;
2. expliquer une hausse de latence apparue après un déploiement ;
3. mesurer quelles populations sont touchées par une erreur ;
4. distinguer un problème de code, de dépendance ou de capacité ;
5. vérifier qui possède le service et quelle action est attendue ;
6. estimer le coût d’un nouveau champ, d’un deuxième export ou d’une rétention plus longue.

Ensuite seulement, je regarde les outils.

Cette méthode révèle des manques que les inventaires cachent : propagation de contexte cassée, attributs incohérents, rétention trop courte, logs non structurés, absence de signal côté utilisateur, permissions qui bloquent l’astreinte ou dashboard sans lien avec une décision.

Elle révèle aussi ce qui fonctionne déjà. Une équipe n’a pas besoin de remplacer une stack entière lorsque ses métriques détectent correctement les symptômes et que quelques améliorations de corrélation suffisent à rendre les enquêtes plus rapides.

## Le passage à l’observabilité est un travail de système

Acheter une plateforme peut accélérer la collecte, le stockage et l’exploration. Ce n’est pas la même chose que rendre une organisation observable.

Il faut encore décider :

- quels résultats utilisateurs méritent un SLI ;
- quel contexte doit être produit dans le code ;
- quels enrichissements appartiennent au Collector ;
- quelles données personnelles ne doivent pas entrer dans la télémétrie ;
- combien de temps conserver chaque signal ;
- comment relier les changements de production aux symptômes ;
- qui agit quand un signal se dégrade.

Dans le SRE Workbook, Google place les métriques SLI au premier plan du dashboard lorsqu’une alerte liée au SLO se déclenche. Ces métriques montrent que le service viole son objectif. Les autres signaux servent ensuite à comprendre pourquoi.

Cette progression est plus utile qu’une opposition entre deux mots.

Le monitoring garde les conditions connues sous surveillance. L’observabilité réduit le coût des questions qui arrivent sans avoir été prévues. Une plateforme de production sérieuse a besoin des deux, reliés par le même contexte et par des décisions que l’équipe sait réellement prendre.

## Sources

- [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Google SRE Workbook — Monitoring](https://sre.google/workbook/monitoring/)
- [OpenTelemetry — Signals](https://opentelemetry.io/docs/concepts/signals/)
- [OpenTelemetry — Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
- [OpenTelemetry — Metrics Data Model](https://opentelemetry.io/docs/specs/otel/metrics/data-model/)
- [OpenTelemetry — Logs Data Model](https://opentelemetry.io/docs/specs/otel/logs/data-model/)
