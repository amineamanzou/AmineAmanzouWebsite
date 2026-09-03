---
title: "Réduire la fatigue d’alerte sans masquer le prochain incident"
locale: "fr"
articleSlug: "reduire-fatigue-alerte"
translationKey: "reduce-alert-fatigue"
publishedAt: "2026-09-29"
label: "SRE / Alerting"
readTime: "10 min"
excerpt: "Chez Orange, une semaine d’appels d’astreinte à 4 h du matin pour un excès de logs m’a rappelé qu’un seuil dépassé ne suffit pas à justifier de réveiller quelqu’un."
heroImage: "/blog/reduire-fatigue-alerte/hero-alert-signal-funnel.svg"
heroImageAlt: "Une astreinte sépare une alerte actionnable d’un flux de notifications dupliquées"
pillar: "reliability"
intent: "informational"
primaryQuery: "alert fatigue reduction"
relatedOffer: "diagnostic"
seoTitle: "Réduire la fatigue d’alerte sans perdre les incidents"
seoDescription: "Retour d’astreinte chez Orange : relier les appels à une action, régler les seuils, réduire les doublons et préserver la détection des incidents."
keywords: ["alert fatigue reduction", "fatigue d’alerte", "astreinte", "SLO alerting", "incident response"]
proofLevel: "experience"
---

Chez Orange, j’ai fait de l’astreinte. Je me souviens d’une semaine où le téléphone sonnait à 4 h du matin, toujours au même moment, pour un excès de logs sur un composant critique.

Un de ces composants dont tout le monde a un peu peur. Le genre de nom qui suffit à mettre l’équipe en alerte, avant même de regarder ce qui se passe. Les seuils étaient mal adaptés à son comportement : le volume de logs dépassait la règle, et bim, appel d’astreinte.

Sauf que ce volume ne justifiait pas de nous appeler.

Ce qui m’agace dans cette situation, c’est le travail qu’on laisse à la personne réveillée. À elle de refaire la différence entre « ce composant produit beaucoup de logs » et « il faut intervenir maintenant ». Pendant une semaine, à la même heure. On finit par connaître le rendez-vous.

Un excès de lignes peut mériter une investigation, un réglage ou un ticket. Il ne suffit pas, à lui seul, à justifier un appel à 4 h du matin. Il manque encore quelque chose : l’impact, le risque imminent, et ce qu’une personne peut réellement faire à cette heure-là.

Quand je regarde une règle d’alerte aujourd’hui, je repense à cette semaine. Derrière le seuil, il y a quelqu’un qui va devoir répondre au téléphone.

## Qu’est-ce que je peux faire maintenant ?

J’avoue que « le composant est critique » ne me suffit plus comme explication. Justement parce qu’il est critique, j’ai besoin de savoir ce qui exige une intervention, et avec quelle urgence.

Le [chapitre monitoring de Google SRE](https://sre.google/sre-book/monitoring-distributed-systems/) distingue les notifications qui interrompent immédiatement une personne des tickets et des informations utiles à l’analyse. Cette distinction aide à décider où envoyer un signal.

Pour chaque règle qui appelle l’astreinte, je veux pouvoir répondre à quatre questions :

1. quel impact ou risque imminent a été détecté ;
2. quelle action est possible maintenant ;
3. ce qui se passe si cette action attend le matin ;
4. ce que le système pourrait automatiser avant d’appeler.

Dans l’exemple des logs, compter les lignes ne répond à aucune de ces questions. Il faut comprendre ce que leur augmentation signifie pour le service.

Et si la seule consigne du runbook est « regarder les logs », on a surtout documenté le travail de tri laissé à l’astreinte.

## Un seuil dépassé ne raconte pas encore l’incident

Je comprends la prudence autour d’un composant sensible. On préfère parfois appeler pour rien que rater une panne. Mais cette prudence finit par coûter cher quand chaque variation du composant prend le même chemin que l’incident.

Prenons des exemples simples : un CPU à 90 % peut correspondre à un traitement attendu. Une file peut grossir puis se vider dans le délai prévu. Un pod peut redémarrer sans interrompre le service. Ces signaux demandent du contexte.

À l’inverse, un parcours utilisateur peut échouer alors que les seuils de chaque composant restent au vert.

Le [guide d’incident de Google](https://sre.google/resources/practices-and-processes/incident-management-guide/) recommande d’alerter à partir des symptômes et des fonctions visibles par les utilisateurs. Les métriques internes restent utiles pour chercher la cause, ou pour anticiper une limite dure.

Un volume de logs qui menace de remplir le disque avant le matin peut donc justifier une intervention. « Trop de lignes » sans conséquence identifiée ne dit toujours pas pourquoi il faut réveiller quelqu’un. C’est ce lien que je veux retrouver dans la règle, au lieu de le reconstruire à chaque appel.

## Repartir des nuits passées, pas seulement du fichier de règles

Pour remettre de l’ordre, je préfère commencer par l’historique des appels. Un fichier de configuration montre ce qu’on a prévu. L’historique montre ce que l’astreinte a réellement subi.

La répétition à 4 h serait déjà un point de départ : combien d’appels, combien d’incidents distincts, quelles actions ont suivi ? Est-ce que le même signal revient chaque nuit ? Est-ce qu’il disparaît avant même le début de l’investigation ?

Je regarde aussi l’autre côté : les incidents découverts par le support ou les utilisateurs, et le délai avant qu’une notification utile nous parvienne. Faire baisser le compteur d’appels ne prouve pas qu’on détecte mieux.

Dans [Being On-Call](https://sre.google/sre-book/being-on-call/), Google propose de rapprocher le nombre d’alertes du nombre d’incidents, avec un objectif de l’ordre de 1:1 pour les alertes systématiquement dupliquées. Je le prends comme une invitation à examiner chaque interruption, pas comme un ratio magique à afficher dans un dashboard.

## Garder les détails sans faire sonner le téléphone pour chacun

Une fois l’historique posé, je résiste à l’envie de tout désactiver. Je veux encore avoir les logs et les symptômes sous la main si le service tombe vraiment.

L’[Alertmanager de Prometheus](https://prometheus.io/docs/alerting/latest/configuration/) permet de regrouper, dédupliquer et inhiber des notifications. Plusieurs instances concernées peuvent apparaître ensemble. Une alerte source peut empêcher l’envoi d’autres alertes dont les labels correspondent à la règle d’inhibition.

Prenons un service indisponible : les échecs du point d’entrée, les redémarrages et la file qui monte peuvent tous aider au diagnostic. Ils n’ont pas forcément besoin de provoquer trois appels supplémentaires.

Je garde donc la possibilité de descendre dans le détail pendant l’enquête. Ce que je cherche à réduire, c’est le nombre de fois où la personne doit interrompre ce qu’elle fait pour qualifier le même événement.

## Donner une urgence différente à des situations différentes

Après plusieurs nuits interrompues, monter un seuil jusqu’à retrouver le silence peut être tentant. J’ai du mal avec ce réglage quand personne ne peut expliquer quelle panne il détectera encore.

L’[alerting sur les SLO du SRE Workbook](https://sre.google/workbook/alerting-on-slos/) permet de raisonner sur la vitesse de consommation du budget d’erreur. Les approches multi-fenêtres vérifient un dépassement sur une fenêtre longue et sur une fenêtre courte : on évite de réagir à un point isolé tout en vérifiant que la dégradation est encore en cours.

L’équipe peut alors réserver l’appel d’astreinte à une consommation rapide, ouvrir un ticket pour une dégradation plus lente et suivre une tendance de capacité dans le backlog.

Ça oblige à discuter du délai acceptable et de la réponse attendue. Le réglage dépend du service ; recopier les fenêtres d’un exemple ne remplace pas cette discussion. Et pour un excès de logs, il faut d’abord établir son lien avec un risque réel avant de lui coller une alerte SLO.

## À 4 h du matin, le contexte compte

Même quand l’appel est justifié, je n’ai pas envie de commencer une chasse aux liens pour comprendre ce qu’on attend de moi.

La notification devrait me donner le service et le parcours concernés, l’impact mesuré, le début du problème, puis un accès direct aux traces, aux logs et au runbook. Si un changement récent est affiché, je veux savoir qu’il s’agit d’une piste à vérifier, pas d’une cause déjà démontrée.

Le runbook doit m’aider à décider : comment qualifier l’impact, quelle mesure sûre essayer, comment vérifier son effet et à qui demander de l’aide. Une capture de dashboard ne répond pas à tout ça.

Cette préparation ne supprime pas la difficulté d’un incident. Elle évite d’ajouter à l’urgence la recherche d’informations que l’équipe connaissait déjà.

## Le rendez-vous de 4 h doit revenir dans le travail de la journée

Le passage qui m’inquiète, c’est le moment où une alerte récurrente devient familière. « Celle-là, on la connaît. » On comprend très bien pourquoi la personne finit par penser ça.

Google décrit aussi ce risque dans [Being On-Call](https://sre.google/sre-book/being-on-call/) : après plusieurs occurrences semblables, on peut supposer trop vite que la suivante a la même cause. Le jour où quelque chose change réellement, cette habitude complique le diagnostic.

Je veux donc que ces appels répétés reviennent dans le travail de fiabilité, avec quelqu’un pour porter la correction et une échéance. Le réglage peut concerner le seuil, la fenêtre, le regroupement, une automatisation ou le service lui-même.

La criticité du composant justifie qu’on vérifie sérieusement la modification. Elle ne justifie pas de reconduire indéfiniment le même réveil. Si l’équipe craint de perdre une détection utile, il faut nommer le scénario redouté et tester la règle sur ce scénario.

## Vérifier avant de confier la prochaine nuit au nouveau réglage

Avant de considérer le nettoyage terminé, je rejoue les incidents connus quand les données le permettent. Est-ce que les nouvelles règles auraient détecté l’impact ? À temps ? Avec quelles informations pour l’astreinte ?

Je continue aussi à suivre les incidents arrivés par le support sans appel préalable. Le silence peut cacher un trou de détection.

Pour mon histoire de logs, le critère reste très concret : garder de quoi comprendre ce qui se passe sur ce composant, et pouvoir expliquer pourquoi la prochaine augmentation demande soit un traitement dans la journée, soit un appel immédiat. La personne qui prend l’astreinte après moi ne devrait pas avoir à redécouvrir cette différence à 4 h du matin.

## Sources

- [Google SRE — Being On-Call](https://sre.google/sre-book/being-on-call/)
- [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Google SRE Workbook — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
- [Google SRE — Incident Management Guide](https://sre.google/resources/practices-and-processes/incident-management-guide/)
- [Prometheus — Alertmanager configuration](https://prometheus.io/docs/alerting/latest/configuration/)

