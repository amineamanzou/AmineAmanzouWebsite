---
title: "Voir un agent dans une UI, ce n'est pas le piloter"
locale: "fr"
articleSlug: "opamp-fleet-management-visibility-operation"
translationKey: "opamp-fleet-management-visibility-operation"
publishedAt: "2026-07-11"
label: "OpAMP / Pilotage de flotte"
readTime: "8 min"
excerpt: "Un agent visible dans une interface n'est pas forcément piloté. Le lab montre où s'arrêtent la visibilité, le lifecycle, la sécurité et la confiance dans l'inventaire."
sourceUrl: "https://www.linkedin.com/pulse/voir-un-agent-dans-une-ui-ce-nest-pas-le-piloter-amine-amanzou-yzvxe"
heroImage: "/blog/opamp-fleet-management-visibility-operation/cover.png"
heroImageAlt: "Frontière entre la visibilité d'un agent dans une interface et son pilotage opérationnel"
pillar: "fleet-management"
intent: "case-study"
primaryQuery: "pilotage flotte OpenTelemetry"
relatedOffer: "otel_sprint"
keywords: ["OpenTelemetry", "fleet operations", "OpAMP", "Collector"]
proofLevel: "lab"
---

Dans l'article précédent, j'ai détaillé le lab de benchmark: les cinq approches, l'infra, la charge simulée et les labels utilisés pour ne pas mélanger une documentation publique avec une preuve reproduite.

Cette fois, je passe aux résultats et aux évidences conservées pendant les runs.

J'ai arrêté des services, remplacé un token par une valeur invalide, reconnecté des collectors et laissé traîner les lignes des anciens tests.

C'est là que les interfaces ont commencé à raconter une histoire moins propre.

Une ligne verte peut confirmer qu'un agent répond. Elle ne dit pas forcément qui l'a installé, qui valide sa configuration, qui le redémarre, ni ce qui se passe quand un rollout tourne mal.

Sur un petit lab, je pouvais encore suivre ces responsabilités dans mes scripts. Chez un client avec plusieurs équipes et quelques milliers de machines, ce flou finit dans l'astreinte.

## La ligne verte s'arrête quelque part

Le chemin Elastic Fleet OTel-only m'a permis de faire apparaître un `otelcol-contrib` dans Fleet sans installer Elastic Agent.

Je voyais l'inventaire, le statut, la santé des composants et la configuration effective. Les documents arrivaient aussi dans Elastic. Pour retrouver un collector oublié sur une VM, c'est déjà utile.

Mais quand il fallait agir, je revenais sur le terminal.

Le restart passait par systemd. Le déploiement et le nettoyage passaient par Ansible ou mes scripts. La validation de configuration, le rollback et une partie des credentials restaient en dehors de Fleet.

![La frontière entre visibilité et pilotage](/blog/opamp-fleet-management-visibility-operation/article-04-visibility-boundary.png)

Le lab permet donc une phrase assez précise: Fleet voyait mon collector OpenTelemetry et sa configuration effective. Il ne possédait pas, dans ce scénario, tout son lifecycle.

Cette limite ne vient pas d'un défaut découvert dans Fleet. Elle correspond à la frontière documentée du produit pour ce chemin.

La documentation Elastic présente Fleet comme une surface de monitoring centralisé pour les collectors OpenTelemetry. Fleet reçoit leur santé, leur configuration et leur statut via OpAMP, mais ne les déploie pas. Les policies associées à ces collectors sont managées, non modifiables, et le support du management central est encore indiqué comme `Planned` pour les collectors EDOT ou upstream.

Pour retrouver les fonctions de management comme les upgrades pilotés par Fleet, leur suivi détaillé, le rolling upgrade ou le redémarrage d'un upgrade bloqué, il faut revenir au chemin Elastic Agent géré par Fleet. C'est le modèle sur lequel Elastic porte aujourd'hui ce lifecycle.

La nuance compte parce que le client paie les deux côtés. Il paie la console, puis il paie encore l'automatisation, les runbooks et les personnes qui interviennent quand la console arrive au bout de ce qu'elle sait faire.

J'ai déjà vu cette limite sur une mission.

Un profil que j'avais recommandé est arrivé chez un client qui avait construit son propre fleet manager. Les équipes en étaient plutôt fières. L'intention était saine: standardiser sans dépendre d'un vendor et garder la main sur la collecte.

Sauf qu'au quotidien, les équipes continuaient à modifier leurs configurations dans Ansible après le déploiement.

La console montrait les agents, mais elle aidait peu à comprendre le pipeline, à versionner les changements, à voir qui possédait quoi ou à revenir en arrière. Elle n'avait pas retiré la plomberie. Elle avait ajouté un écran au-dessus.

Ce n'est pas un échec exotique. C'est ce qui arrive quand on commence par l'inventaire parce que c'est la partie la plus visible du produit, puis qu'on remet le lifecycle à plus tard.

## Le confort produit a un prix opérationnel

Bindplane m'a donné une expérience plus proche de ce que j'attends d'un produit de pilotage.

La commande d'installation était générée. L'agent BDOT se connectait avec son secret d'enrollment. L'interface exposait le type, la version, l'OS, les labels, l'adresse distante et la configuration. Le builder rendait aussi les sources et les destinations plus lisibles qu'un YAML ouvert dans un terminal.

Ce confort compte au jour 2. Quand il faut comprendre pourquoi un fichier n'arrive pas dans la bonne destination, voir le pipeline fait gagner plus de temps qu'une table d'agents supplémentaire.

Le couplage apparaît lorsqu'on essaie de sortir du chemin prévu.

J'ai construit une distribution OCB avec l'extension OpAMP upstream, puis tenté le handshake sur l'endpoint documenté. Le serveur a répondu `403 Forbidden`. La documentation publique réserve le chemin non-BDOT à des capacités Enterprise/BYOC et précise que l'extension OpAMP standard reste limitée sur la configuration distante.

Ça ne rend pas Bindplane mauvais. Ça rend le contrat plus concret.

Le produit absorbe une partie de la complexité, mais il faut tester ce qu'on récupère le jour où l'on change de modèle: configurations, secrets, destinations, conventions, historique et procédures d'exploitation. Changer l'URL du serveur OpAMP ne transporte pas tout ça.

## Dans le chemin ouvert, le backlog m'appartient

Avec le serveur custom basé sur `opamp-go`, je contrôlais le protocole, l'inventaire et les scénarios. Je pouvais simuler des agents, provoquer une panne du control plane et instrumenter exactement ce qui m'intéressait.

Pour comprendre OpAMP, c'est le meilleur chemin du lab.

Pour l'exploiter en production, il ouvre une liste de travaux beaucoup moins amusante: persistance, authentification, IAM, audit, validation des configs, rollout progressif, rollback, nettoyage des entrées obsolètes, métriques, API stable, runbooks et support.

Le test du token résume bien le problème.

J'ai remplacé `OPAMP_AUTH_TOKEN` par une valeur invalide. L'agent a quand même pu se connecter et rafraîchir son inventaire dans l'implémentation testée.

À ce moment-là, le token n'était pas une frontière de sécurité. C'était une variable d'environnement avec un nom rassurant.

Pour en faire un vrai contrôle d'accès, il faut que le serveur le vérifie, sache le révoquer, permette une rotation avec chevauchement, segmente son périmètre et laisse une trace des refus. Le protocole fournit la boucle de management. La sécurité de cette boucle reste un travail de produit.

## Les anciens agents ne disparaissent pas tout seuls

Après plusieurs runs, Fleet affichait encore trois lignes `otelcol-contrib` offline. Bindplane gardait l'ancien agent BDOT en `Disconnected`. L'inventaire du serveur custom contenait encore 10 022 agents issus des tests précédents.

![Les lignes résiduelles finissent par casser la confiance](/blog/opamp-fleet-management-visibility-operation/article-04-stale-inventory.png)

Sur une capture, ça ressemble à un problème de ménage.

Dans un parc réel, je dois savoir si une ligne correspond à une machine encore vivante, une réinstallation, un doublon d'identité, un test de charge ou un agent disparu depuis trois semaines. Sinon les rollouts ciblent mal, les alertes s'accumulent et les audits commencent par une discussion sur la fiabilité de l'inventaire.

Une équipe peut nettoyer trois lignes à la main. Elle ne nettoiera pas sereinement 10 022 identités ambiguës avant chaque déploiement.

Le TTL, la réconciliation et les règles de suppression font donc partie du control plane. Ce n'est pas du polish d'interface.

## La panne utile du lab

J'ai ensuite arrêté le serveur OpAMP custom alors que le collector possédait déjà une configuration locale valide.

Le collector a continué à exporter vers Elastic. Pendant la fenêtre d'arrêt, le backend a reçu 1 898 événements host et supervisor.

![Le data path continue pendant la panne du serveur OpAMP](/blog/opamp-fleet-management-visibility-operation/article-04-outage-continuity.png)

C'est une propriété d'architecture que je veux conserver: le control plane peut être indisponible sans couper automatiquement le chemin des données déjà configuré.

Mais le chiffre ne prouve pas une plateforme résiliente.

Il ne dit rien sur la haute disponibilité du serveur, l'enrollment sécurisé, le retour de 100 000 agents après une panne, la convergence d'une nouvelle configuration ou la perte éventuelle de données avant le backend. Il montre seulement que, dans ce scénario, le collector n'avait pas besoin du serveur OpAMP pour continuer à exporter sa configuration locale.

Cette limite est aussi importante que le résultat.

## Ce que je retiens avant de construire

Le lab ne m'a pas donné un vainqueur.

Il m'a montré où chaque approche remet la responsabilité sur l'équipe plateforme.

Fleet OTel-only m'a donné de la visibilité, pendant que le lifecycle restait dans mes outils. Bindplane a retiré davantage de friction, avec un modèle produit qu'il faut accepter et tester jusqu'à la sortie. Le chemin custom m'a rendu le contrôle, puis m'a rendu tout le backlog avec.

OpenLit a ajouté un autre rappel très terrain. Fleet Hub listait bien les collectors et l'API exposait la configuration effective. Dans le self-host testé, les panneaux de configuration restaient pourtant bloqués sur `Loading...`: Monaco était chargé depuis un CDN alors que la CSP n'autorisait que les scripts servis localement.

Sur un laptop connecté, on corrige et on avance. Dans un environnement airgapped ou médié par Artifactory, ce détail décide si l'interface est réellement exploitable.

Voilà le filtre que je garderais pour évaluer un control plane: où est-ce que l'équipe reprend le terminal, quel risque reste chez elle, et quelle preuve elle conserve après le changement ?

L'agent visible dans une UI n'est que le début de la réponse.

Le dernier article partira de là. Je vais décrire le produit que je construirais autour d'OpAMP après avoir passé autant de temps à regarder ce qui manquait entre le protocole, les interfaces et le travail réel des équipes.

Sources:

- Repo public et preuves du lab: https://github.com/amineamanzou/opamp-enterprise-lab
- Claim ledger: https://github.com/amineamanzou/opamp-enterprise-lab/blob/main/docs/articles/opamp-enterprise-adoption/claim-ledger.md
- Comparaison des chemins de fleet management: https://github.com/amineamanzou/opamp-enterprise-lab/blob/main/docs/study/fleet-management-comparison.md
- Méthodologie du lab: https://github.com/amineamanzou/opamp-enterprise-lab/blob/main/docs/study/lab-methodology.md
- Résultats du final exit drill: https://github.com/amineamanzou/opamp-enterprise-lab/tree/main/docs/evidence/runs/20260619T223502Z-exit-drill-secrets-outage
- Runbook OpenLit: https://github.com/amineamanzou/opamp-enterprise-lab/blob/main/docs/runbooks/openlit-opamp.md
- Elastic, Monitor OpenTelemetry Collectors in Fleet: https://www.elastic.co/docs/reference/fleet/monitor-otel-collectors
- Elastic Agent as an OpenTelemetry Collector: https://www.elastic.co/docs/reference/fleet/elastic-agent-as-otel-collector
- Elastic, Upgrade Fleet-managed Elastic Agents: https://www.elastic.co/docs/reference/fleet/upgrade-elastic-agent
