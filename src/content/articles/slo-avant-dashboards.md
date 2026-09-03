---
title: "Définir les SLO avant de construire les dashboards"
locale: "fr"
articleSlug: "slo-avant-dashboards"
translationKey: "define-slos-before-dashboards"
publishedAt: "2026-09-22"
label: "SRE / SLO"
readTime: "11 min"
excerpt: "Les dashboards existent déjà, les données sont incomplètes et personne n’a le temps de tout refaire. On peut quand même commencer à définir ce que le service doit réussir, puis améliorer la mesure."
heroImage: "/blog/slo-avant-dashboards/hero-slo-before-dashboard.svg"
heroImageAlt: "Un objectif de fiabilité utilisateur structure les indicateurs et dashboards d’un service"
pillar: "reliability"
intent: "informational"
primaryQuery: "SLO implementation"
relatedOffer: "diagnostic"
seoTitle: "Définir des SLO avant les dashboards"
seoDescription: "Définir des SLI et SLO dans une organisation imparfaite : partir de l’existant, discuter les compromis et améliorer progressivement mesure et décisions."
keywords: ["SLO implementation", "SLO", "SLI", "error budget", "dashboard observabilité"]
proofLevel: "documentation"
---

« On a déjà des dashboards partout, et on peine à maintenir les alertes. On va trouver quand le temps de définir des SLO ? »

Si c’est ce que vous vous dites en lisant le titre, je comprends. Vous avez peut-être une plateforme héritée, plusieurs équipes qui se partagent un service et un calendrier de livraison sur lequel vous avez peu de prise. Repartir de zéro serait un chantier de plus.

Je garderais les dashboards qui servent. Quand je parle de définir les SLO avant de construire les écrans, je parle d’abord de l’ordre des questions : qu’est-ce que le service doit réussir pour ses utilisateurs, comment peut-on le vérifier, et que fera-t-on si ça se dégrade ?

Je repense à mes astreintes chez Orange, avec ces appels à 4 h du matin pour un excès de logs sur un composant critique. Le volume avait déclenché une alerte, mais ne justifiait pas cet appel. Cette expérience me rappelle pourquoi je me méfie d’un seuil dont on ne sait plus expliquer la conséquence.

Un SLO n’aurait pas corrigé cette règle tout seul. Il aurait fallu comprendre le signal, discuter du risque et modifier le fonctionnement de l’alerte. C’est aussi du travail d’équipe, avec les contraintes qui vont avec.

## Se mettre d’accord sur un premier résultat

Pour poser les termes : le SLI mesure un résultat du service, et le SLO fixe le niveau cible attendu sur une période.

Prenons un exemple fictif de confirmation de commande. On pourrait commencer par cette définition :

> Une tentative est considérée comme réussie si l’utilisateur reçoit une confirmation valide en moins de deux secondes.

Le SLI serait alors la proportion de tentatives éligibles qui remplissent ces conditions. Le SLO pourrait être de 99,9 % sur 28 jours. Ces nombres servent à illustrer le calcul ; ils ne sont pas une recommandation pour tous les services.

Et là, la discussion devient intéressante. Qu’est-ce qu’une tentative éligible ? Une commande refusée parce que le stock est épuisé représente-t-elle une erreur du service ? Est-ce que deux secondes conviennent réellement à cet usage ?

Si l’équipe n’est pas d’accord immédiatement, ça ne m’inquiète pas. Le désaccord existait probablement déjà, simplement personne n’avait encore eu besoin de le traduire dans un calcul. On peut commencer par un parcours assez précis pour pouvoir trancher ces questions, sans définir d’un coup la fiabilité de tout le système d’information.

## « On n’a pas les données pour mesurer ça correctement »

C’est une objection que je trouve tout à fait recevable. Décrire une expérience utilisateur ne fait pas apparaître magiquement l’instrumentation nécessaire.

Le [SRE Workbook distingue la spécification du SLI de son implémentation](https://sre.google/workbook/implementing-slos/) : le résultat recherché d’un côté, la manière de l’estimer de l’autre.

Dans notre exemple, les logs applicatifs peuvent fournir une première mesure. Mais ils ne voient que les tentatives qui atteignent l’application. Une panne de DNS ou du point d’entrée peut empêcher un utilisateur d’arriver jusque-là.

Une mesure au load balancer et une instrumentation côté navigateur ont d’autres périmètres, d’autres coûts et d’autres limites. Je n’attendrais pas que tout soit disponible pour commencer.

On peut écrire à côté du premier indicateur : « Cette mesure couvre les confirmations traitées par l’application. Elle ne couvre pas les échecs en amont. » Puis comparer ce signal aux incidents connus et aux retours du support.

J’aime bien revenir à ce passage du Workbook : Google y laisse explicitement de la place à une première définition imparfaite, à condition de prévoir comment l’améliorer. Ça me semble bien plus praticable que d’attendre une mesure irréprochable avant d’avoir la moindre discussion.

Le compromis devient dangereux quand sa limite disparaît du document et que tout le monde finit par croire qu’on mesure le parcours complet.

## Choisir une cible qu’on peut défendre

Vous allez peut-être me dire que, chez vous, la seule réponse acceptable à la question de la disponibilité est « 100 % ».

Je comprends l’intention. Personne n’a envie d’annoncer à un utilisateur que son problème tient dans une marge acceptable. Pourtant, une cible de 100 % ne laisse aucun budget d’erreur : le moindre échec suffit à la manquer.

Avec une cible de 99,9 %, le budget représente 0,1 % des événements éligibles sur la période choisie. Dans un SLO fondé sur les requêtes, ce pourcentage ne se convertit pas automatiquement en un nombre de minutes d’indisponibilité.

La discussion porte alors sur les conséquences d’un échec et sur l’effort nécessaire pour réduire le risque. Un résultat qui arrive en retard dans un traitement de nuit n’a pas nécessairement les mêmes conséquences qu’une opération interactive bloquée. Le choix dépend de l’usage.

Si vous n’avez pas assez de recul pour défendre une cible, une première période d’observation peut aider. On regarde le niveau actuel, les plaintes, les incidents et ce que la mesure manque. On propose ensuite un objectif à discuter, avec une date de révision.

Je serais prudent avec une cible choisie uniquement parce que le système la tient déjà. Elle peut être trop facile, ou imposer une exigence coûteuse que personne n’a demandée. Mais avoir besoin de temps pour clarifier ça ne signifie pas que la démarche est ratée.

## Un budget d’erreur ne donne pas le pouvoir d’arrêter une release

C’est probablement là que la théorie se heurte le plus vite à l’organisation.

Sur le papier, le budget se consomme, l’équipe adapte les releases et investit dans la fiabilité. Dans votre contexte, la plateforme ne décide peut-être pas du calendrier produit. Le fournisseur peut avoir ses propres échéances. Et le responsable du parcours n’est pas forcément la personne qui possède le composant en cause.

Écrire « les releases sont bloquées quand le budget est épuisé » dans une page que personne n’a approuvée ne crée pas ce pouvoir.

Le [Workbook insiste sur l’accord des parties prenantes et sur une politique de budget d’erreur](https://sre.google/workbook/implementing-slos/). C’est une condition pour que la mesure serve réellement aux arbitrages.

À mon sens, on peut préparer cet accord avec une décision plus limitée : qui examine une consommation anormale du budget, dans quel délai, et avec quels éléments ? Est-ce que cette personne peut prioriser un correctif, demander une revue du déploiement ou faire remonter une décision ?

Ça ne remplace pas une politique complète. Ça permet de tester un premier fonctionnement sans prétendre que toute l’organisation a adopté la méthode.

Ensuite, on peut préciser ensemble les conditions de limitation des releases, les exceptions, la personne qui les assume et la façon de réviser l’objectif. Si personne ne veut encore s’engager sur un arbitrage, on a identifié une limite organisationnelle. Le dashboard ne la résoudra pas à notre place.

## Faire évoluer l’écran qui existe déjà

À ce stade, je ne demanderais pas forcément à quelqu’un de refaire tous les dashboards.

On peut ajouter à l’écran du service le SLI, sa cible, la fenêtre observée et la limite de couverture. C’est déjà utile si cela permet à deux personnes de parler du même résultat avec la même définition.

Lorsque le calcul est assez fiable, on peut y faire apparaître le budget restant et sa vitesse de consommation, ou burn rate. Le [chapitre consacré aux alertes sur les SLO](https://sre.google/workbook/alerting-on-slos/) explique comment combiner des fenêtres courtes et longues pour adapter la réponse à cette consommation.

Une dégradation rapide peut justifier un appel d’astreinte ; une dérive plus lente peut laisser le temps de traiter un ticket. Les seuils et le routage demandent encore une validation sur votre trafic. Ils ne deviennent pas justes simplement parce qu’ils viennent d’un exemple du livre.

Pour l’enquête, je garderais à portée de main les changements récents, les dimensions qui permettent d’examiner les échecs, quelques traces ou logs, ainsi que le responsable et la décision attendue.

On peut construire cet écran par étapes. L’important est de savoir quelle information manque encore, plutôt que de donner une impression de couverture complète avec des cases vides.

## Et les dashboards CPU, mémoire et dépendances ?

Je les garde aussi. Quand le parcours se dégrade, il faut bien chercher ce qui se passe.

La [distinction entre symptômes et causes du livre SRE](https://sre.google/sre-book/monitoring-distributed-systems/) aide à organiser cette enquête. Le résultat utilisateur donne un point de départ ; les métriques internes permettent ensuite de tester des explications.

Un CPU élevé pendant un traitement attendu peut être sans conséquence pour le parcours. À l’inverse, celui-ci peut échouer pendant que les CPU restent au vert. C’est pour ça que la couleur d’un composant ne suffit pas à résumer le service.

Il reste aussi des risques à anticiper avant qu’un utilisateur soit touché, comme une ressource sur le point d’être épuisée. Les alertes préventives ont leur place quand elles décrivent un risque concret et une action possible.

Revenir à ma semaine d’astreinte ne me donne donc pas envie de supprimer les métriques internes. Ça me donne envie de mieux expliquer lesquelles justifient un appel, lesquelles aident au diagnostic, et lesquelles peuvent attendre qu’on les regarde dans la journée.

## Commencer assez petit pour pouvoir apprendre

Si votre équipe manque de temps, je commencerais par un parcours qu’elle connaît et un ou deux résultats qu’elle peut déjà observer. La disponibilité et la latence sont des candidats possibles ; pour un pipeline, la fraîcheur ou la correction des données peuvent être plus pertinentes.

On note la définition, les exclusions, les limites de la mesure, puis on choisit un moment pour revenir dessus avec les personnes concernées.

Lors de cette revue, je rapprocherais les variations du SLI des incidents, tickets support et retours utilisateurs. Un incident important invisible dans le signal mérite qu’on revoie sa couverture. Une baisse sans effet apparent mérite une investigation avant de modifier la cible : peut-être que la mesure est trompeuse, peut-être qu’on ne voit pas encore les utilisateurs affectés.

On garde alors une trace de ce qu’on change et de ce qu’on ne sait toujours pas mesurer. Cette trace évite de redécouvrir les mêmes compromis à la revue suivante.

Je trouve ce point de départ plus accessible qu’un programme SRE complet à faire accepter d’un bloc. Un parcours, une mesure dont on connaît les limites, quelqu’un avec qui discuter du résultat et une prochaine date de revue : l’équipe peut déjà apprendre quelque chose, puis choisir l’amélioration suivante sans attendre que toute l’entreprise fonctionne parfaitement.

## Sources

- [Google SRE Workbook — Implementing SLOs](https://sre.google/workbook/implementing-slos/)
- [Google SRE Workbook — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
- [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
