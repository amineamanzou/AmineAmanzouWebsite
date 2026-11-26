---
title: "ClickHouse pour l’observabilité : ce que j’ai vu à Paris, ce qui manque encore"
locale: "fr"
articleSlug: "clickhouse-observabilite-conference-2026"
translationKey: "clickhouse-observabilite-conference-2026"
publishedAt: "2026-11-26"
label: "Observability / Engineering"
readTime: "5 min"
excerpt: "J’ai passé la matinée du 17 novembre à la conférence observabilité de ClickHouse à Paris. Les retours de Qonto et Ringover, mon avis sur le produit et ce qui lui manque encore."
heroImage: "/blog/clickhouse-observabilite-conference-2026/cover.webp"
heroImageAlt: "L’Ingénieur Peu Fiable, appareil photo en main, devant trois cases montrant les présentations de ClickHouse, Qonto et Ringover"
pillar: "observability"
intent: "informational"
primaryQuery: "clickhouse observabilite conference 2026"
relatedOffer: "diagnostic"
seoTitle: "ClickHouse pour l’observabilité : ce que j’ai vu à Paris, ce qui manque encore"
seoDescription: "J’ai passé la matinée du 17 novembre à la conférence observabilité de ClickHouse à Paris. Les retours de Qonto et Ringover, mon avis sur le produit et ce qui lui manque encore."
keywords: ["observability", "OpenTelemetry", "clickhouse observabilite conference 2026"]
proofLevel: "experience"
---

Le 17 novembre, j’ai passé la matinée à une conférence ClickHouse sur l’observabilité, dans un de ces locaux près d’Opéra où des startups viennent travailler. Pour une fois, ce n’était pas un afterwork où tout le monde arrive fatigué de sa journée : une matinée entière, dédiée, et ça se sentait dans l’ambiance. ClickHouse progresse vite. C’est une solution que je recommande aujourd’hui à certaines organisations, à condition de savoir où sont encore les trous.

Huit jours plus tôt, ClickHouse avait [ouvert en bêta publique son offre d’observabilité managée](https://clickhouse.com/blog/announcing-clickhouse-observability). Le principe : on envoie sa télémétrie OpenTelemetry sur un endpoint et ils gèrent le reste, facturé au gigaoctet ingéré. La matinée tombait donc bien. [Au programme](https://clickhouse.com/fr/company/events/202611-EMEA-France-Paris-Matinee-de-lObservabilite), une présentation de ClickHouse et de ClickStack par Oussama Chakri, deux retours d’expérience de boîtes françaises, Qonto et Ringover, puis un atelier où chacun sortait son ordinateur.

## Ce qu’ils ont montré côté produit

Oussama Chakri a ouvert en prenant le sujet par la donnée. Volume, cardinalité, rétention : pour lui, ce sont d’abord des problèmes de moteur. Côté interface, ils ont montré AI Notebooks et la Service Map dans HyperDX, l’interface de ClickStack. On sent qu’ils s’alignent sur ce qui se fait ailleurs, avec de la détection d’anomalies, la représentation des dérives et le regroupement des logs par patterns.

<figure>
  <img src="/blog/clickhouse-observabilite-conference-2026/oussama-chakri-clickhouse.jpg" alt="Oussama Chakri présente la slide « L’observabilité est un problème de données » à la Matinée de l’Observabilité de ClickHouse" loading="lazy" />
  <figcaption>Oussama Chakri (ClickHouse) ouvre la matinée. Photo prise sur place, le 17 novembre.</figcaption>
</figure>

On l’a vu pendant l’atelier, animé par Vincent Jolivet. On donne une plage horaire, et l’outil classe ce qui se répète dans les logs : ce jour-là, il a sorti sept anomalies, dont une erreur de paiement qu’on pouvait relier aux autres. Franchement, c’est bien fait. Créer ses équipes, brancher son endpoint OpenTelemetry et commencer à envoyer, tout ça se fait directement, et cette expérience évolue dans le bon sens.

## Qonto : les traces décident si un déploiement continue

J’avais déjà vu Qonto en février, à un meetup ClickHouse, avec un discours très tourné vers l’investigation par des agents. Cette fois, c’était plus terre à terre. Valentin Levier, SRE chez Qonto, a expliqué qu’ils ne stockent que leurs traces dans ClickHouse Cloud : 60 jours de rétention, environ 600 To avant compression, 22 To après.

<figure>
  <img src="/blog/clickhouse-observabilite-conference-2026/valentin-levier-qonto.jpg" alt="Valentin Levier devant la slide « Observability at Qonto with ClickHouse »" loading="lazy" />
  <figcaption>Valentin Levier, SRE chez Qonto, pendant son retour d’expérience.</figcaption>
</figure>

Presque tous leurs services sont instrumentés, et ils trouvaient dommage de n’ouvrir cette base que pendant les incidents. Ils ont donc branché de l’automatisation dessus. L’exemple que je retiens, c’est le déploiement canary. Pendant qu’Argo Rollouts fait monter la nouvelle version, un service interne interroge les traces dans ClickHouse pour vérifier la santé du service. Sa réponse tranche : la version part en production, ou elle est annulée. Valentin l’a résumé comme ça : « C’est le check qui va décider si le déploiement est bon ou non. »

## Ringover : ClickHouse sur leurs propres serveurs

J’ai bien aimé aussi le retour de Martial Salgues, qui s’occupe de l’observabilité chez Ringover depuis quatre ans. Ringover est un opérateur télécom pour les entreprises, et ils font tout en on-premise : leurs propres serveurs, dans quatre datacenters en France et trois aux États-Unis. ClickHouse tourne donc chez eux, en version open source, géré par l’équipe. Les modèles de prix des éditeurs, au nombre de nœuds ou de vCPU, ne collaient pas à leur taille.

Les chiffres donnent l’échelle. Plus de 500 nœuds physiques, 13 To écrits par jour avant compression, près de 10 milliards de lignes quotidiennes dont 80 % de logs, et une compression d’au moins 16 fois. Le cluster tient sur trois machines de 112 cœurs et 1 To de RAM, autour de 10 000 € pièce.

<figure>
  <img src="/blog/clickhouse-observabilite-conference-2026/martial-salgues-ringover.jpg" alt="Martial Salgues devant une slide de chiffres : plus de 500 nœuds physiques, 13,1 TiB écrits par jour, 9,84 milliards de lignes par jour, compression ×16" loading="lazy" />
  <figcaption>Martial Salgues (Ringover) et les chiffres de leur plateforme auto-hébergée.</figcaption>
</figure>

Ce que j’ai apprécié, c’est qu’il n’a pas caché les difficultés. Début octobre, un développeur a lancé une requête sur six mois de données, pour un service en production depuis quelques jours. ClickHouse est allé vérifier tous les index du stockage S3, et la requête a mis plus de 439 secondes rien qu’à être planifiée. Elle ne s’est jamais exécutée, mais elle a saturé le cluster. Sa conclusion : quand on héberge soi-même, il faut aussi expliquer aux développeurs comment écrire leurs requêtes.

Il a aussi raconté un incident récent sur leur infrastructure américaine. Après une mise à jour, des clients n’ont plus reçu leurs appels pendant quelques minutes. Il lui a fallu cinq à dix minutes pour trouver comment parser les logs de téléphonie, qui sont du texte brut, puis une requête SQL pour reconstituer environ 7 000 appels manqués : qui avait cherché à joindre qui, combien de fois, à quel numéro rappeler. Le fichier est parti à l’équipe qui gère la relation client, qui a pu prévenir les clients concernés.

## Là où ça coince encore

Mon avis, c’est que ClickHouse a encore de la marge sur les intégrations, et qu’il vaut mieux le savoir avant de s’engager.

Il y a d’abord les tests de performance. La plupart des plateformes d’observabilité ont aujourd’hui leur solution intégrée pour ça. ClickHouse n’en a pas. Pour les tests de charge et le monitoring synthétique, on est obligé d’aller chercher k6 chez Grafana, ou un autre outil.

Le suivi des sessions utilisateur existe, mais il devra s’améliorer avec le temps.

Et surtout, il y a la gestion des droits. Dans une grande organisation, on veut brancher sa propre gestion d’identités et décider finement qui voit quoi, application par application : les alertes, les sessions, les logs. Aujourd’hui, je trouve ça encore trop limité. J’espère que ça viendra.

## Sur l’IA, je ne crois pas à la fin des dashboards

Toutes les solutions avancent vite sur l’IA, et ClickStack aussi. Son serveur MCP est bien adapté à ces usages et, apparemment, les résultats sont très bons. Qonto s’en sert déjà pour interroger ses traces en français ou en anglais.

Je ne suis pourtant pas convaincu que nos ingénieurs SRE et nos managers accros aux dashboards vont abandonner l’interface au profit de l’IA. Surtout dans des organisations qui gèrent 80 000 ou 100 000 machines. À cette taille-là, on préfère avoir les données sous les yeux, et solliciter l’agent quand on en a besoin : pour construire quelque chose, diagnostiquer, investiguer.

## Est-ce que ça vaut le coup ?

Carrément. J’avais invité quelques amis, ils m’ont demandé de les tenir au courant, et j’en ai fait [une vidéo](https://www.youtube.com/watch?v=DxLE-Ls4huE).

Si le sujet vous intéresse, il y a de quoi se faire la main. [L’atelier de la matinée](https://github.com/Ochakri-CHDB/clickhouse-observability-workshop) est en open source sur GitHub. Un nouveau compte ClickHouse Cloud donne [300 $ de crédits pendant 30 jours](https://clickhouse.com/pricing). Et ClickHouse propose un [parcours de formation à l’observabilité](https://clickhouse.com/learn/observability) en trois niveaux, dont les sessions en direct des deux premiers sont gratuites.

C’est une compétence qui va être de plus en plus demandée. Le moteur, lui, est déjà validé : d’autres solutions d’observabilité vendues sur le marché tournent dessus.
