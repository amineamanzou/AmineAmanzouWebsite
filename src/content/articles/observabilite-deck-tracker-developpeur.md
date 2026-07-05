---
title: "L'Observabilité, le Deck Tracker du Développeur ?"
locale: "fr"
articleSlug: "observabilite-deck-tracker-developpeur"
translationKey: "observabilite-deck-tracker-developpeur"
publishedAt: "2025-04-14"
label: "Observabilité / Hearthstone"
readTime: "5 min"
excerpt: "Les joueurs utilisent des trackers pour comprendre une partie. Les ingénieurs utilisent logs, métriques et traces pour comprendre un système."
sourceUrl: "https://www.linkedin.com/pulse/lobservabilit%25C3%25A9-le-deck-tracker-du-d%25C3%25A9veloppeur-amine-amanzou--66iqc/"
heroImage: "/blog/observabilite-deck-tracker-developpeur/cover.jpg"
---

Quand j'explique l'observabilité à des développeurs, j'aime parfois partir d'un endroit un peu inattendu: Hearthstone.

Dans Hearthstone, un joueur ne se contente pas de jouer ses cartes et d'espérer. Il regarde sa main de départ, son deck, ses probabilités, les cartes déjà vues, les cartes probables chez l'adversaire, les statistiques du méta et les replays de ses erreurs.

Les meilleurs joueurs ne gagnent pas parce qu'ils ont accès à une vérité magique. Ils gagnent parce qu'ils transforment une partie confuse en système observable.

Et c'est exactement ce qu'on essaie de faire avec une application en production.

## Jouer sans tracker, c'est debugger sans signal

Sans tracker, une partie de Hearthstone repose sur la mémoire et l'intuition.

On peut compter les cartes à la main. On peut se rappeler approximativement ce qui a été joué. On peut sentir qu'un match-up est défavorable. Mais plus la partie avance, plus le cerveau fatigue et plus les décisions deviennent floues.

En production, c'est pareil.

Sans logs, sans métriques, sans traces et sans événements bien placés, on se retrouve à raisonner à partir de symptômes. Un utilisateur dit que "ça rame". Une équipe dit que "le paiement est instable". Une alerte dit que "quelque chose dépasse un seuil". Et tout le monde essaie de reconstituer la partie après coup.

Le tracker ne joue pas à notre place. L'observabilité non plus. Mais les deux réduisent le brouillard.

<figure>
  <img src="/blog/observabilite-deck-tracker-developpeur/firestone-mulligan-stats.jpg" alt="Winrate en fonction des cartes gardées ou échangées en main de départ dans Firestone" loading="lazy" />
  <figcaption>Winrate en fonction des cartes gardées ou échangées en main de départ, dans Firestone.</figcaption>
</figure>

## Le mulligan ressemble à un dashboard

Dans Hearthstone, le mulligan est un moment critique. On choisit quelles cartes garder en main de départ. Une mauvaise décision peut condamner la partie avant même qu'elle commence vraiment.

Les outils comme Firestone ou HSReplay donnent des statistiques de winrate selon les cartes gardées ou échangées. Ce n'est pas une vérité absolue, mais c'est un signal.

La donnée ne dit pas "fais ça". Elle dit: "dans des situations comparables, voilà ce qui a mieux marché".

Un bon dashboard d'observabilité devrait produire le même effet. Il ne doit pas remplacer le jugement de l'ingénieur. Il doit donner assez de contexte pour éviter de décider dans le noir.

Si une route API a un taux d'erreur plus élevé après un déploiement, si une dépendance externe augmente sa latence, si un service consomme plus de mémoire après une release, on ne veut pas une décoration graphique. On veut une aide à la décision.

## Le deck tracker comme journal d'exécution

Un deck tracker suit les cartes jouées, les cartes restantes et les événements importants de la partie.

Cela ressemble beaucoup à un journal d'exécution.

Quand une application reçoit une requête, appelle trois services, écrit dans une base, publie un message et répond à l'utilisateur, elle joue aussi une séquence. Si on ne la trace pas, on ne voit que le résultat final.

Le log nous dit ce qui s'est passé à un endroit précis.

La métrique nous dit comment un comportement évolue dans le temps.

La trace nous dit comment une requête traverse le système.

Le deck tracker n'est pas l'équivalent parfait de ces trois signaux, mais l'intuition est bonne: rendre visible une séquence que l'humain ne peut pas suivre parfaitement en temps réel.

<figure>
  <img src="/blog/observabilite-deck-tracker-developpeur/hearthstone-deck-tracker.jpg" alt="Hearthstone Deck Tracker pendant une partie" loading="lazy" />
  <figcaption>Hearthstone Deck Tracker, ou la partie rendue lisible.</figcaption>
</figure>

## Le méta, c'est la production

Les sites de statistiques Hearthstone ne regardent pas seulement une partie. Ils agrègent des milliers ou millions de parties pour comprendre le méta.

Quel deck gagne contre quel autre ? Quelle carte augmente le winrate ? Quelle liste devient populaire ? Quelle stratégie disparaît ?

En production, on a la même différence entre le signal local et le signal global.

Une trace nous aide à comprendre une requête. Une métrique agrégée nous aide à comprendre une tendance. Un tableau de bord global nous aide à voir si le système change de régime.

Ce qui est dangereux, c'est de confondre les niveaux.

Une requête lente n'est pas forcément un incident. Une moyenne stable peut cacher un segment utilisateur cassé. Une erreur rare peut être normale, ou annoncer une régression grave si elle touche le bon parcours.

Comme dans un jeu compétitif, il faut savoir passer du replay au méta.

<figure>
  <img src="/blog/observabilite-deck-tracker-developpeur/deck-winrate-dashboard.jpg" alt="Dashboard des decks tendances par taux de victoire" loading="lazy" />
  <figcaption>Petit dashboard des decks tendances par taux de victoire.</figcaption>
</figure>

## Trop de données peut nuire à la décision

Un mauvais tracker peut distraire. Trop de chiffres, trop de panneaux, trop de recommandations et le joueur finit par perdre le fil de la partie.

L'observabilité souffre du même piège.

On peut collecter énormément de logs sans savoir quoi en faire. On peut créer des centaines de métriques qui ne répondent à aucune question. On peut tracer chaque appel et ne jamais regarder les traces parce que personne ne sait par où commencer.

La bonne question n'est pas "combien de données avons-nous ?".

La bonne question est: "quelle décision cette donnée permet-elle de prendre ?".

Un dashboard qui ne change jamais une décision est un poster. Une alerte qui ne déclenche aucune action fiable est du bruit. Une trace que personne ne peut relier à un incident est une archive.

## Un replay vaut parfois mieux qu'un graphique

Dans Hearthstone, revoir une partie permet de comprendre une erreur que les statistiques seules ne montrent pas.

Le winrate peut dire qu'une carte est forte. Le replay montre le tour où on l'a mal utilisée.

En production, une trace détaillée joue souvent ce rôle. Elle permet de voir l'enchaînement précis: le service A attend le service B, qui attend une base, qui subit une contention, pendant qu'un retry amplifie la charge.

La métrique montre la fumée. La trace montre le chemin du feu.

Les deux sont nécessaires. Un système qui n'a que des agrégats peut manquer le scénario réel. Un système qui n'a que des traces individuelles peut manquer la tendance globale.

## Les autobattlers et les systèmes distribués

Sur Battlegrounds, les trackers aident aussi à comprendre un mode de jeu où beaucoup de choses se jouent automatiquement.

Le joueur prépare une composition, mais le combat lui-même se déroule selon des règles, des effets, des probabilités et des interactions parfois difficiles à anticiper.

Cela ressemble étrangement à nos systèmes distribués.

On configure, on déploie, on dimensionne, on écrit du code. Puis le système vit. Les files se remplissent, les caches se vident, les timeouts s'empilent, les dépendances ralentissent, les retries se synchronisent, les clients changent de comportement.

L'observabilité sert à comprendre ce qui se passe quand le système joue tout seul.

<figure>
  <img src="/blog/observabilite-deck-tracker-developpeur/hsreplay-battlegrounds.jpg" alt="Fonctionnalités HSReplay pour Battlegrounds" loading="lazy" />
  <figcaption>HSReplay features pour Battlegrounds, un autobattler.</figcaption>
</figure>

## Le bon signal arrive au bon moment

Un tracker utile ne montre pas tout avec la même importance. Il met en avant ce qui aide pendant la partie.

Combien de cartes restent dans le deck. Quelle carte a été générée. Quelle option a un meilleur historique. Quel adversaire arrive ensuite. Quelle information mérite l'attention maintenant.

Pour l'observabilité, c'est pareil.

Pendant un incident, on ne veut pas explorer toute la télémétrie de l'entreprise. On veut répondre vite à des questions concrètes.

Qu'est-ce qui a changé ?

Quels utilisateurs sont touchés ?

Quel chemin applicatif est affecté ?

Est-ce que le problème vient du code, de l'infra, d'une dépendance ou d'un changement de trafic ?

Est-ce que ça empire ?

Peut-on rollback ?

La qualité de l'observabilité se mesure beaucoup dans ces minutes-là.

## Le développeur reste le joueur

Le point important, c'est que le tracker ne remplace pas le joueur.

Il n'a pas le contexte complet. Il ne comprend pas toujours le plan. Il peut suggérer une ligne statistiquement bonne mais mauvaise dans une situation précise.

L'observabilité ne remplace pas l'ingénieur non plus.

Elle donne des signaux, des corrélations, des chronologies, des distributions. Elle aide à formuler des hypothèses. Elle accélère l'enquête. Mais elle ne décide pas seule de l'architecture, du rollback ou du compromis produit.

Le but n'est pas d'automatiser le jugement. Le but est de lui donner de meilleurs yeux.

## Pourquoi j'aime cette analogie

J'aime cette analogie parce qu'elle rend l'observabilité moins abstraite.

Les développeurs comprennent vite qu'un tracker n'est pas une collection de chiffres pour faire joli. C'est un outil qui transforme une situation dynamique en informations utilisables.

On retrouve les mêmes tensions: trop de données, pas assez de contexte, mauvais timing, mauvaise granularité, confusion entre corrélation et causalité, indicateurs utiles pour les débutants mais insuffisants pour les experts.

Et surtout, on comprend qu'un bon outil ne donne pas seulement plus d'information. Il donne une meilleure lecture de la partie.

## L'observabilité n'attend pas

Dans un jeu, on peut parfois se permettre de perdre une partie pour apprendre.

En production, la partie coûte plus cher.

Quand un système critique tombe, quand un paiement échoue, quand une API devient instable ou quand une file d'attente explose, on n'a pas envie de commencer à instrumenter après coup.

L'observabilité doit être pensée avant l'incident. Comme un tracker qu'on installe avant de lancer la partie.

Pas pour tout savoir. Pour avoir assez de signal au moment où il faut décider.

L'observabilité n'attend pas.
