---
title: "Comment j'ai benchmarké 5 approches de fleet management OpenTelemetry"
locale: "fr"
articleSlug: "opamp-fleet-management-benchmark"
translationKey: "opamp-fleet-management-benchmark"
publishedAt: "2026-07-06"
label: "OpAMP / Benchmark"
readTime: "7 min"
excerpt: "Pour séparer le marketing de la réalité, j'ai comparé cinq chemins de fleet management OpenTelemetry dans un lab logs-only: OpAMP ouvert, Elastic Fleet OTel-only, Bindplane BDOT, opamp-server-py et OpenLit Fleet Hub."
sourceUrl: "https://www.linkedin.com/pulse/comment-jai-benchmark%25C3%25A9-5-approches-de-fleet-amine-amanzou-dvp9e/"
heroImage: "/blog/opamp-fleet-management-benchmark/cover.png"
---

Après les deux premiers articles, je pouvais facilement rester au niveau du marché.

Les vendors convergent vers des offres control planes. Les clients parlent de gouvernance, même quand ils utilisent le mot "fleet management". OpAMP donne une base open source intéressante.

Mais à ce stade, ça reste une lecture.

Et sur un sujet comme celui-là, une lecture ne suffit pas. Il faut voir ce que les produits prennent vraiment en charge quand on les met dans un lab: enrôlement, identité, configuration distante, lifecycle, secrets, inventaire, sortie, panne du control plane.

Pour ça, rien de mieux qu'un lab, pour faire la différence entre marketing et réalité.

## Le périmètre

J'ai volontairement travaillé en logs-only.

Les métriques et les traces comptent aussi, évidemment. Mais les logs font déjà remonter une bonne partie des problèmes d'exploitation: fichiers locaux, parsers, labels, volumes, secrets, destinations, redémarrages, erreurs de configuration, facture d'ingestion.

Si un control plane se brouille déjà sur ce périmètre, ajouter traces, métriques, profils, SIEM et contraintes réglementaires ne va pas rendre la situation plus lisible.

Le backend commun du bench servait surtout de point fixe.

Ce choix ne dit rien sur une architecture cible. Il me fallait surtout un backend disponible rapidement, avec des dashboards, des data views, des requêtes et des captures exploitables.

Le point important était de séparer deux chemins qui se mélangent vite dans les discussions.

Le data path, c'est le chemin des données. Dans ce lab, il répond à une question très simple: est-ce que les logs synthétiques arrivent bien dans le backend ?

Le control path, c'est le chemin de pilotage. Là, la question devient: qui enrôle l'agent, qui lui donne une identité, qui pousse la configuration, qui voit son état, qui redémarre, qui audite, qui nettoie ?

Les deux peuvent donner l'impression de fonctionner en même temps. C'est justement le piège. Un pipeline peut envoyer des logs correctement pendant que le produit censé gouverner le parc laisse encore le lifecycle, les secrets ou la validation dans les mains de l'équipe plateforme.

## Les branches testées

J'ai comparé cinq familles.

![Les branches du benchmark](/blog/opamp-fleet-management-benchmark/benchmark-branches-map.png)

La première branche était le chemin OpAMP ouvert avec `opamp-go`: un serveur OpAMP custom, un collector OpenTelemetry construit avec OCB ou `otelcol-contrib`, et un superviseur côté hôte. C'est le chemin le plus instructif pour comprendre ce que le protocole donne quand il faut construire le produit autour.

La deuxième branche était Elastic Fleet en mode OTel-only. Je voulais vérifier ce que donne un collector OpenTelemetry visible dans Fleet sans installer Elastic Agent. Dans le lab, la distribution contrib d'OpenTelemetry Collector a pu apparaître dans Fleet via OpAMP, avec statut, santé, configuration effective et ingestion vers le backend commun.

La troisième branche était Bindplane avec BDOT. Là, le sujet changeait un peu: onboarding, inventaire, états Connected ou Disconnected, builder de configuration, sources, destinations, et friction de sortie vers un chemin OpAMP plus ouvert.

La quatrième branche était `opamp-server-py`. Elle m'a surtout servi à mesurer l'effort nécessaire pour passer d'une base OpAMP exploitable à une UI vraiment utilisable: inventaire, état, configuration, erreurs lisibles, et chemin de productisation.

OpenLit Fleet Hub mérite son propre paragraphe.

Ce n'était pas seulement une ligne de doc à citer. Dans le lab, Fleet Hub a bien listé des collectors OpenTelemetry via OpAMP, avec statut et santé. L'API exposait aussi de la configuration effective. Mais le self-host a fait remonter une friction très concrète: les panneaux de configuration restaient bloqués sur `Loading...` parce que Monaco était chargé depuis un CDN alors que la CSP du déploiement n'autorisait que les scripts self-hosted.

Pour un lab connecté à Internet, ça ressemble à un détail d'UI. Pour une plateforme enterprise, airgapped ou médiée par Artifactory, c'est une vraie question de packaging.

Rien n'est parfait dans un benchmark ou dans un lab. Le point important, c'est d'avoir l'honnêteté de le signaler.

Elastic Fleet OTel-only, Bindplane BDOT, OpenLit Fleet Hub et le chemin `opamp-go` n'ont pas le même niveau de preuve. Bindplane OnPrem, par exemple, n'a pas été testé. Certaines lignes sont reproduites en lab, d'autres seulement documentées publiquement, bloquées, ou hors périmètre.

Une doc, une démo et une preuve conservée ne racontent pas la même chose.

## L'infra du lab

La base était simple: Hetzner Cloud, Terraform, Ansible, Taskfile, et des scripts d'évidence.

Terraform créait le terrain dans `lab/infra/hcloud`: VMs Linux, firewall explicite par usage, outputs non secrets, puis inventaire Ansible.

Le design prévoyait une VM `opamp` pour le serveur OpAMP et les APIs d'évidence, une VM `agent` pour le collector hôte et la charge synthétique, deux VMs Kubernetes pour les scénarios cluster, et une VM `load` optionnelle pour isoler la génération de charge.

![Architecture fleet management OpAMP](/blog/opamp-fleet-management-benchmark/fleet-management-diagram.png)

Ansible prenait ensuite le relais.

Les playbooks rendaient les runs reproductibles: bootstrap des hôtes, serveur OpAMP custom, collector hôte, superviseur, génération de logs synthétiques, scénarios Kubernetes.

Chaque branche gardait son propre chemin: `scenario/elastic-fleet-otel-only-experience`, `scenario/bindplane-otel-experience`, `scenario/openlit-opamp-analysis`, `scenario/opamp-server-py-experience`, plus les branches de drill et de sortie.

Le lab restait loin d'une plateforme industrielle de benchmark, mais il gardait mieux qu'un test lancé à la main depuis un laptop, avec trois captures impossibles à relier.

Et surtout, il restait frugal. J'aime bien me faire plaisir sur les labs, mais le cloud coûte cher et FinOps finit toujours par rappeler qui paie la note.

![Pipeline CI/CD d'évidence du benchmark](/blog/opamp-fleet-management-benchmark/lab-topology-benchmark.png)

Chaque run devait laisser une trace: versions, commandes, configs, observations, échecs, limites, ce qui restait externe au produit, et ce qui n'avait pas été testé.

Cette séparation change beaucoup de choses.

Si je redémarre un collector avec systemd, je ne peux pas écrire ensuite que le fleet manager possède le lifecycle. Je peux seulement écrire que le produit a observé le changement d'état, pendant que le restart restait externe.

La nuance paraît petite, mais j'en ai fait des démos et des plateformes de benchmark, et c'est exactement ce qui fait la différence chez le client.

## Les critères que j'ai regardés

Contrairement à ce qu'on peut penser, ce n'était pas une question de RAM et de throughput.

Je voulais savoir ce que le control plane prend réellement à sa charge: comment l'agent rejoint le parc, comment son identité reste stable, comment l'inventaire gère les lignes offline ou dupliquées, qui pousse la configuration distante, qui redémarre ou nettoie, qui porte les secrets, comment une mauvaise configuration est bloquée ou détectée, ce qui se passe quand le control plane tombe, et ce qu'on peut prouver après coup.

C'est moins spectaculaire qu'un graphique qui surveille la RAM, mais c'est cet inventaire de features qui ressort dans les discussions.

Un acheteur veut savoir plus qu'une chose: qui garde la responsabilité quand le parc grossit, quand une config casse, quand un token fuit, quand une équipe veut sortir du produit, ou quand il faut expliquer après coup ce qui a changé.

## La charge simulée

Il faut être précis ici.

L'objectif n'était pas de rejouer toute la production d'une grande entreprise. Je voulais savoir si ce type de fleet management peut tenir dans une boîte qui a plus de 100k agents à déployer, sans transformer un petit test en promesse enterprise.

Le lab utilisait deux types de charge.

D'abord, la volumétrie logs. J'ai fait un tour de chauffe côté host-agent à 1k, 5k et 10k logs/s pour vérifier que le pipeline gardait une forme cohérente avant de parler de gestion. Ici, 10k veut dire 10k logs par seconde, pas 10k agents.

Ensuite, la charge control plane. Pour ça, j'ai construit `opamp-agent-swarm`: des mock agents légers basés sur un vrai client WebSocket `opamp-go`. Ils reportent description, health, heartbeat, remote config status et effective config.

L'objectif était de mettre de la pression sur l'inventaire et les connexions sans mélanger ce signal avec la CPU collector ou le débit d'ingestion.

Le run conservé le plus intéressant monte à 5 000 mock agents sur le serveur `opamp-go`, avec des paliers à 100, 250, 500, 1 000, 2 000 et 5 000.

La méthodologie peut viser 10K agents via `OPAMP_AGENT_SCALE_COUNTS`. Mais je ne vais pas écrire que chaque branche est prouvée à 10K agents. Ce serait faux.

À ce stade, 5K mock agents est une preuve conservée pour le chemin `opamp-go`. 10K agents reste une cible à rejouer proprement, branche par branche, avant de publier un résultat comparatif.

![Charge control plane avec 5 000 agents OpAMP simulés](/blog/opamp-fleet-management-benchmark/opamp-agent-scale-connected.png)

Une vraie cible 100K demanderait un autre niveau de travail: paliers mesurés, CPU et mémoire côté serveur, latence de convergence, tempête de reconnexion, taille d'état par agent, persistance, HA, réseau, sécurité, coût d'exploitation.

C'est pour ça que j'ai mis en place des labels: `lab-proven`, `source-only`, `not-tested`, `blocked`.

![Méthodologie des labels de preuve](/blog/opamp-fleet-management-benchmark/proof-labels-methodology.png)

C'est moins vendeur. C'est aussi ce qui évite de fabriquer un benchmark mensonger.

## Ce que le lab a réellement produit

Le run final a laissé des chiffres utiles.

Sur une fenêtre de 24h, j'ai conservé 433 515 documents `app.synthetic.otel`, 40 052 documents `opamp.inventory`, 106 documents `opamp.events`, 196 documents `fleet_server.agent_status`, et 1 898 événements reçus pendant la fenêtre d'arrêt du serveur OpAMP custom.

Ces chiffres prouvent une chose limitée, mais importante: le lab a produit de l'activité observable, et certaines corrélations entre control plane et data path peuvent être documentées.

Ils ne suffisent pas à prouver un débit maximal, une production réaliste ou une capacité 100k.

Ils permettent plutôt de dire: voilà ce qui s'est passé dans ce scénario, avec cette configuration, à ce moment-là.

Pour moi, c'est le bon niveau de preuve avant de publier une opinion sur un sujet aussi niche que celui du fleet management.

## À propos des résultats

Sans cette discipline, on peut raconter presque n'importe quoi.

Une ligne verte dans une UI se retrouve vite appelée lifecycle managed. Une configuration effective visible passe pour de la remote config complète. Un collector qui continue d'envoyer des logs sert de preuve de résilience. Un protocole ouvert est vendu comme solution enterprise. Un produit managé est résumé trop vite à du lock-in total.

Toutes ces phrases peuvent être vraies ou fausses selon le scénario.

Le benchmark sert à les découper.

Dans l'article suivant, je passe aux résultats.

Et la première leçon est assez simple: voir un agent dans une UI ne veut pas dire qu'on le pilote.

Sources:

- OpAMP specification: https://github.com/open-telemetry/opentelemetry-specification/tree/main/specification/opamp
- OpAMP Go implementation: https://github.com/open-telemetry/opamp-go
- OpenTelemetry Collector contrib OpAMP extension: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/opampextension
- Bindplane OTel Collector: https://github.com/observIQ/bindplane-otel-collector
- Bindplane OTel contrib distribution: https://github.com/observIQ/bindplane-otel-contrib
- opamp-server-py: https://github.com/agardnerIT/opamp-server-py
- OpenLit Fleet Hub / OpAMP deployment: https://github.com/openlit/openlit/blob/main/OPAMP_DEPLOYMENT.md
- OpenLit source: https://github.com/openlit/openlit
