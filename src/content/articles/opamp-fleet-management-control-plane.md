---
title: "Le control plane OpenTelemetry que je construirais"
locale: "fr"
articleSlug: "opamp-fleet-management-control-plane"
translationKey: "opamp-fleet-management-control-plane"
publishedAt: "2026-07-14"
label: "OpAMP / Control plane"
readTime: "6 min"
excerpt: "Après cinq articles et un lab complet, voici le control plane OpenTelemetry que je construirais : pipeline-first, identité stable, rollouts sûrs, observabilité et sortie prévue dès le départ."
sourceUrl: "https://www.linkedin.com/pulse/le-control-plane-opentelemetry-que-je-construirais-amine-amanzou-bnmee"
heroImage: "/blog/opamp-fleet-management-control-plane/article-05-cover-control-plane.png"
heroImageAlt: "Blueprint d'un control plane OpenTelemetry centré sur les pipelines"
---

Je tourne autour de ce sujet depuis un an et demi.

Des boîtes m'ont demandé de tester leur solution. J'ai vu des inventaires propres, des formulaires de configuration bien rangés et des collectors qui remontaient en vert. J'ai aussi eu un échange de consulting avec des VC qui regardaient le marché de l'observabilité avant d'investir.

La question finissait toujours par revenir: si tu devais construire le produit, tu mettrais quoi dedans ?

Après ce lab, je commencerais par un écran assez ingrat.

Je voudrais voir un pipeline de bout en bout: quel agent collecte quoi, quelles transformations sont appliquées, où les données partent, quelle équipe en est responsable, combien ce chemin coûte et ce qui risque de casser si je le modifie.

Tant que le produit ne sait pas répondre à ça, ajouter un nouveau formulaire revient surtout à mieux organiser la plomberie.

## Partir du pipeline, pas de la table d'agents

La plupart des interfaces commencent par l'inventaire. C'est logique: une ligne par agent, un statut, une version, quelques labels. On obtient vite quelque chose de montrable.

Le travail réel commence quand une équipe demande pourquoi ses logs n'arrivent plus, pourquoi les volumes ont doublé ou qui a ajouté un exporter vers une destination sensible.

À ce moment-là, la ligne verte aide peu.

Je veux suivre le chemin complet: receiver, processor, exporter, destination. Je veux voir les volumes, les erreurs, les règles de sampling, les transformations, les données sensibles et le propriétaire de chaque étape.

![La topologie que le produit doit rendre lisible](/blog/opamp-fleet-management-control-plane/article-05-pipeline-topology.png)

Si une configuration ajoute une deuxième sortie pour les mêmes logs, l'impact volume doit apparaître avant le rollout. Si un processor supprime un attribut utilisé par le SIEM, le produit doit montrer la dépendance. Si personne ne possède un pipeline critique, ce trou doit être visible aussi.

C'est là que le control plane devient utile à autre chose qu'à l'équipe qui connaît déjà le YAML OpenTelemetry par coeur.

## Donner une identité qui survive aux redémarrages

Le lab m'a laissé assez de lignes mortes pour ne plus considérer l'identité comme un détail.

Je construirais une identité d'agent stable, renouvelable et révocable. Elle serait rattachée à des attributs opérables: environnement, site, équipe, criticité, OS, service et anneau de rollout.

Le `hostname` peut aider à retrouver une machine. Il ne suffit pas pour décider à qui envoyer une configuration.

Il faut aussi séparer les droits. Lire l'inventaire, modifier une configuration, approuver un rollout, déclencher un rollback et administrer les secrets ne sont pas la même action.

Le test avec le token invalide m'a rappelé une règle simple: tant que le serveur ne refuse rien, le secret ne protège rien.

Je voudrais donc des credentials scopés, une rotation avec chevauchement, une révocation testable et un historique exploitable. Pas seulement un bouton « Regenerate » que personne n'ose utiliser en production.

## Traiter la configuration comme un changement de production

Envoyer du YAML à distance est la partie facile à démontrer.

Le produit doit d'abord expliquer ce que ce YAML va changer.

Je ferais passer chaque version par une validation syntaxique et sémantique, puis par une estimation de l'impact: destinations touchées, hausse probable de volume, données sensibles, composants absents sur certains agents et équipes concernées.

Ensuite seulement vient le rollout.

Une petite cohorte `canary` reçoit la configuration en premier. Quelques agents suffisent pour vérifier que la config démarre, converge et n'abîme ni les volumes ni le data path. Si les seuils dépassent ce qui a été accepté, le control plane arrête la diffusion et prépare le rollback.

![Un rollout doit pouvoir s'arrêter avant le vendredi soir](/blog/opamp-fleet-management-control-plane/article-05-safe-rollout.png)

Les anneaux sont simplement des groupes que l'on expose au changement l'un après l'autre.

Le `canary` est volontairement petit. Le `pilot` est plus large et surtout plus représentatif du parc réel: plusieurs OS, sites ou niveaux de criticité. `Broad` correspond au déploiement général une fois les premiers signaux vérifiés. Le `holdback` garde une partie du parc sur l'ancienne version, le temps de comparer les comportements ou de conserver un chemin de repli.

Cette progression évite de traiter 100 000 agents comme une liste plate et de découvrir une erreur partout au même moment.

Et je garde la limite du lab: je n'ai pas testé 100 000 agents. Cette échelle est une contrainte de conception. Elle oblige à penser cohortes, fan-out, tempêtes de reconnexion, état par agent et temps de convergence avant de prétendre construire pour l'entreprise.

## Observer le control plane lui-même

Un outil chargé de piloter la télémétrie ne peut pas devenir la boîte noire du système.

Je veux connaître le nombre de connexions actives, les agents refusés, l'âge de la dernière configuration effective, la latence de convergence, les erreurs par cohorte, les reconnexions, les entrées obsolètes et le volume traité par pipeline.

Je veux surtout relier ces signaux à une action.

Un pic de reconnexions après un déploiement doit pointer vers la version concernée. Une hausse de volume doit montrer la source et la destination qui la facturera. Une cohorte bloquée doit expliquer si le problème vient d'un composant absent, d'un secret expiré ou d'une configuration refusée.

Sinon on finit avec un dashboard de plus, puis un terminal ouvert à côté pour comprendre ce que le dashboard essaie de dire.

## Utiliser l'IA là où elle retire vraiment de la friction

Oui, je mettrais une interface conversationnelle et un serveur MCP dans le produit.

Mais je ne laisserais pas un modèle pousser seul une configuration en production.

Je l'utiliserais pour traduire la plomberie: expliquer une configuration à une équipe applicative, retrouver les pipelines qui envoient deux fois les mêmes données, résumer pourquoi une cohorte ne converge pas, proposer un filtre ou préparer un plan de rollback.

Une question comme « qu'est-ce qui envoie ces logs, vers où, et combien ça me coûte ? » traverse l'inventaire, les configurations, la topologie et les métriques. C'est un bon usage pour un agent outillé.

La décision de production, elle, reste attachée à des contrôles déterministes: policy, validation, approbation, seuils et audit.

L'IA réduit la distance entre l'intention et la configuration. Elle ne remplace pas les garde-fous.

## Construire la sortie pendant que tout fonctionne

Dans les labs comme dans les migrations, la sortie arrive toujours trop tard dans la discussion.

Je la mettrais dans le produit dès le début.

Une équipe doit pouvoir retrouver les agents encore dépendants du control plane, exporter les configurations, identifier les secrets à remplacer, changer les destinations et conserver l'historique nécessaire à l'audit.

![La sortie fait partie du produit](/blog/opamp-fleet-management-control-plane/article-05-exit-path.png)

Je voudrais même un dry-run de sortie: voilà ce qui reste couplé, voilà ce qui peut être exporté, voilà ce qui devra être reconstruit et voilà les agents qui n'ont pas encore convergé vers le nouveau chemin.

Le lock-in est rarement contenu dans une seule API. Il s'installe dans les secrets, les conventions, les dashboards, les procédures et les habitudes des équipes.

Un produit qui rend ces dépendances visibles gagne plus de confiance qu'une promesse de portabilité posée sur une page marketing.

## Le produit derrière le protocole

OpAMP resterait la boucle de management. OpenTelemetry resterait la surface de collecte et de configuration.

Le produit se situerait autour: identité, droits, secrets, topologie, validation, rollout, rollback, coûts, audit, observabilité et sortie.

Je ne chercherais pas à reproduire un vendor agent avec une autre couleur. Je chercherais à donner aux équipes une vue commune de ce qu'elles collectent et des conséquences d'un changement.

C'est aussi pour ça que le marché converge sur cette couche. L'acquisition de Bindplane par Dynatrace, Fleet Management chez Grafana et Fleet chez Elastic montrent que la valeur remonte vers le pilotage du parc et des pipelines.

Le lab m'a surtout appris que cette valeur ne vient pas d'un serveur OpAMP qui répond au handshake.

Elle apparaît quand une équipe peut modifier sa télémétrie sans avancer à l'aveugle, comprendre l'impact avant de déployer, arrêter un rollout et sortir du produit sans réinstaller tout son parc.

C'est ce control plane-là que je construirais.

Si vous avez lu les cinq articles jusqu'ici, merci d'avoir suivi cette exploration un peu niche jusqu'au bout.

J'aimerais maintenant avoir vos retours sur la série. Est-ce que cette lecture du fleet management correspond à ce que vous voyez sur le terrain ? Qu'est-ce qui manque encore dans le produit ou dans le benchmark ?

Sources:

- Dynatrace to Acquire Bindplane: https://www.dynatrace.com/news/press-release/dynatrace-to-acquire-bindplane/
- Grafana Fleet Management docs: https://grafana.com/docs/grafana-cloud/send-data/fleet-management/
- Grafana Fleet Management architecture: https://grafana.com/docs/grafana-cloud/send-data/fleet-management/introduction/architecture/
- OpAMP specification: https://opentelemetry.io/docs/specs/opamp/
- Repo public et preuves du lab: https://github.com/amineamanzou/opamp-enterprise-lab
- Blueprint produit et architecture 100k: https://github.com/amineamanzou/opamp-enterprise-lab/blob/main/docs/study/blueprints.md
- Claim ledger: https://github.com/amineamanzou/opamp-enterprise-lab/blob/main/docs/articles/opamp-enterprise-adoption/claim-ledger.md
