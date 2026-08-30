---
title: "Définir les SLO avant de construire les dashboards"
locale: "fr"
articleSlug: "slo-avant-dashboards"
translationKey: "define-slos-before-dashboards"
publishedAt: "2026-09-22"
label: "SRE / SLO"
readTime: "9 min"
excerpt: "Un dashboard sans objectif organise des mesures. Un SLO commence par le résultat utilisateur, définit ce qui est bon, puis donne au dashboard une décision à soutenir."
heroImage: "/blog/slo-avant-dashboards/hero-slo-before-dashboard.svg"
heroImageAlt: "Un objectif de fiabilité utilisateur structure les indicateurs et dashboards d’un service"
pillar: "reliability"
intent: "informational"
primaryQuery: "SLO implementation"
relatedOffer: "diagnostic"
seoTitle: "Définir des SLO avant les dashboards"
seoDescription: "Méthode pratique pour définir des SLIs et SLOs orientés utilisateur avant de construire dashboards, alertes et budgets d’erreur."
keywords: ["SLO implementation", "SLO", "SLI", "error budget", "dashboard observabilité"]
proofLevel: "documentation"
---

Certains dashboards donnent un seuil à chaque composant.

CPU à 80 %. Mémoire à 85 %. Latence en jaune au-dessus de 500 ms. Queue en rouge à partir de 10 000 messages.

La question la plus difficile restait sans réponse : à partir de quel moment le service rendu devient-il insuffisant pour ses utilisateurs ?

Les seuils avaient été choisis composant par composant. Le dashboard était propre, mais aucune décision produit ou opérationnelle ne reliait l’ensemble.

C’est pour ça que je préfère définir les SLO avant de dessiner les écrans.

## Commencer par un résultat, pas par une métrique disponible

Un SLO fixe un niveau cible de fiabilité pour un service. Son SLI mesure le résultat observé.

Le point de départ peut tenir dans une phrase :

> Une tentative de confirmation est considérée comme réussie lorsqu’un utilisateur reçoit une réponse valide en moins de deux secondes.

Cette phrase oblige l’équipe à préciser l’unité de travail, le résultat attendu et la limite acceptable.

On peut ensuite construire un SLI sous la forme recommandée dans le SRE Workbook : le nombre d’événements bons divisé par le nombre total d’événements éligibles.

```text
SLI de disponibilité = commandes confirmées correctement / commandes éligibles
```

Le SLO ajoute une cible et une fenêtre : 99,9 % sur 28 jours, par exemple.

Le dashboard arrive après. Il affiche le ratio, le budget restant, la vitesse de consommation et les dimensions utiles à l’enquête.

## La source du SLI change ce que l’on mesure

Deux métriques qui portent le même nom peuvent décrire des expériences différentes.

Un compteur dans l’application voit les requêtes qui l’atteignent. Il ne voit pas toujours celles qui échouent avant : DNS, CDN, load balancer, réseau ou démarrage du client.

Une mesure au load balancer couvre davantage de trafic, mais elle connaît moins bien le résultat métier. Une instrumentation côté navigateur se rapproche de l’utilisateur, tout en introduisant ses propres problèmes de sampling, de consentement et de qualité de données.

Je sépare donc la spécification du SLI de son implémentation.

- **Spécification :** ce que le service doit réussir pour l’utilisateur.
- **Implémentation :** le signal et le calcul utilisés pour l’estimer.

Cette distinction évite de transformer une métrique déjà disponible en objectif par facilité.

## Un SLO à 100 % retire tout espace de décision

Une cible parfaite paraît rassurante. Elle transforme surtout chaque échec en violation.

Le SRE Workbook rappelle qu’un SLO de 100 % laisse l’équipe en réaction permanente. Aucun système distribué réel ne tient une perfection absolue, et les utilisateurs ne demandent pas toujours la même fiabilité pour chaque parcours.

Une cible inférieure à 100 % crée un budget d’erreur.

Avec un SLO de 99,9 % sur 30 jours, l’équipe accepte au maximum 0,1 % d’événements mauvais sur la population mesurée. Ce budget permet d’arbitrer : continuer les releases, ralentir un rollout, investir dans la fiabilité ou corriger une dépendance dangereuse.

Le budget ne donne pas une permission de casser la production. Il rend explicite le risque que l’organisation accepte déjà, souvent sans le mesurer.

## Le propriétaire compte autant que la cible

Un SLO parfaitement calculé peut rester sans effet.

Ils apparaissent dans un dashboard mensuel. Ils passent au rouge. L’équipe plateforme en parle. Le produit continue son calendrier. Personne ne possède l’arbitrage.

Google indique qu’un SLO utile doit être approuvé par les parties prenantes et associé à une politique de budget d’erreur. Les personnes responsables doivent aussi considérer l’objectif atteignable dans des conditions normales.

Une politique simple peut préciser :

- qui reçoit l’information lorsque la consommation du budget accélère ;
- quand un ticket devient prioritaire ;
- quand les releases sont limitées ;
- quelles exceptions demandent une décision explicite ;
- comment l’objectif est révisé lorsqu’il ne reflète plus l’expérience.

Sans cette politique, le SLO rejoint la collection des KPI que l’on regarde en réunion sans modifier le travail.

## Construire le dashboard autour des décisions

Une fois le SLO choisi, le premier écran devient plus facile à organiser.

Je veux voir :

1. le SLI actuel et la cible ;
2. le budget d’erreur restant sur la fenêtre ;
3. la vitesse de consommation sur une fenêtre courte et une fenêtre longue ;
4. les changements récents ;
5. les principales dimensions qui expliquent les événements mauvais ;
6. quelques traces ou logs représentatifs ;
7. le propriétaire et la politique associée.

La vitesse de consommation, ou *burn rate*, évite d’attendre la fin de la période pour découvrir que le budget est perdu. Une consommation très rapide peut déclencher une page. Une dérive lente peut devenir un ticket et un travail planifié.

Le même écran ne doit pas tout expliquer. Il doit conduire du constat vers les bons outils d’enquête.

## Les dashboards de causes viennent ensuite

Le SLO montre qu’un résultat utilisateur se dégrade. Il n’explique pas automatiquement pourquoi.

Les dashboards de service gardent donc leur place : latence par dépendance, taux d’erreur par version, saturation, queues, retries, pool de connexions, garbage collection, changements de configuration.

La différence vient de l’ordre de lecture.

On part du symptôme qui menace le résultat, puis on descend vers les causes plausibles. Une métrique interne devient prioritaire parce qu’elle explique un impact observé, pas seulement parce qu’elle dépasse un seuil historique.

Cette hiérarchie réduit aussi l’alerting fragile. Un CPU élevé peut être normal pendant un batch. Une latence utilisateur qui brûle rapidement le budget demande une attention même lorsque les CPU restent verts.

## Démarrer avec peu d’objectifs

Une première implémentation n’a pas besoin de couvrir cinquante parcours.

Je choisis un service et deux ou trois résultats : disponibilité, latence et éventuellement fraîcheur ou correction selon le produit. Je calcule les SLIs sur les données existantes, puis je compare leurs variations aux incidents, tickets support et retours utilisateurs connus.

Les écarts sont utiles.

Si un incident important ne touche aucun SLI, la couverture est insuffisante. Si le SLO chute sans impact perceptible, la mesure ou la cible mérite d’être revue. Google présente cette amélioration comme une boucle normale, pas comme l’échec de la première définition.

Le dashboard devient alors le produit visible d’un accord plus important : ce que le service promet, comment on le mesure et quelle décision l’équipe prend lorsque cette promesse commence à dériver.

## Sources

- [Google SRE Workbook — Implementing SLOs](https://sre.google/workbook/implementing-slos/)
- [Google SRE Workbook — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
- [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
