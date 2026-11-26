---
title: "Cloudflare tombe : le piège du surincident"
locale: "fr"
articleSlug: "cloudflare-panne-diagnostic-dependance"
translationKey: "cloudflare-panne-diagnostic-dependance"
publishedAt: "2026-12-03"
label: "Observability / Engineering"
readTime: "4 min"
excerpt: "La panne Cloudflare du 18 novembre 2025 vue du côté client : pourquoi le diagnostic est si difficile à chaud, et comment éviter d’aggraver l’incident en intervenant."
heroImage: "/blog/cloudflare-panne-diagnostic-dependance/cover.webp"
heroImageAlt: "L’Ingénieur Peu Fiable en pompier, extincteur en main, devant un graphe d’erreurs en dents de scie, un nuage foudroyé et une frise de 11 h 20 à 17 h 06"
pillar: "reliability"
intent: "case-study"
primaryQuery: "cloudflare panne diagnostic dependance"
relatedOffer: "diagnostic"
seoTitle: "Cloudflare tombe : le piège du surincident"
seoDescription: "La panne Cloudflare du 18 novembre 2025 vue du côté client : pourquoi le diagnostic est si difficile à chaud, et comment éviter d’aggraver l’incident en intervenant."
keywords: ["reliability", "OpenTelemetry", "cloudflare panne diagnostic dependance"]
proofLevel: "experience"
---

Le 18 novembre 2025, je venais de finir une mission d’un an et demi chez Enedis. J’ai donc appris la panne de Cloudflare comme tout le monde, par ma veille. Et comme d’habitude, j’ai vu des influenceurs LinkedIn sauter dessus dans la journée : Internet est en panne, voici les quatre leçons à retenir. Internet s’emballe toujours.

Moi, ce jour-là, je pensais plutôt à l’équipe dont le site passe par Cloudflare et qui se demande si le problème vient de chez elle.

## Même Cloudflare a mis des heures à comprendre

Le [compte rendu de Cloudflare](https://blog.cloudflare.com/18-november-2025-outage/) est détaillé, et il faut leur reconnaître cette transparence. La panne commence à 11 h 20 UTC. Le trafic ne revient pour l’essentiel qu’à 14 h 30, et tout est rentré dans l’ordre à 17 h 06. À l’origine, un changement de permissions sur une base de données fait doubler la taille d’un fichier de configuration, et le logiciel qui le lit plante.

<figure>
  <img src="/blog/cloudflare-panne-diagnostic-dependance/outage-timeline-fr.svg" alt="Frise de la panne Cloudflare du 18 novembre 2025 : changement de permissions à 11 h 05, premières erreurs à 11 h 20, fausse piste d’une attaque DDoS, fichier fautif identifié à 13 h 37, trafic rétabli à 14 h 30, retour à la normale à 17 h 06" loading="lazy" />
  <figcaption>Le déroulement de la panne, d’après le <a href="https://blog.cloudflare.com/18-november-2025-outage/">compte rendu de Cloudflare</a>. Heures UTC.</figcaption>
</figure>

Ce qui me frappe, c’est le temps qu’il a fallu à l’équipe pour comprendre. Le fichier était régénéré toutes les cinq minutes, tantôt bon, tantôt mauvais. Le réseau tombait, repartait, retombait. Ils ont d’abord cru à une attaque DDoS. Leur page de statut, hébergée ailleurs, est tombée au même moment par pure coïncidence, et ça a renforcé la mauvaise piste.

Je ne vais pas le leur reprocher. Toute entreprise de cette taille a accumulé des couches, et aucun système n’est parfait. Mais ça montre ce que valent une bonne observabilité et une bonne documentation interne des effets que certains composants peuvent produire.

## Les incidents qui traînent ne vont pas disparaître

On va voir de plus en plus d’incidents qui durent, malgré l’IA, malgré un code mieux testé et mieux observé. Dernier exemple en date : [la panne de Microsoft 365](https://selectra.info/telecom/actualites/marche/panne-microsoft-365-direct-13-novembre-outlook), qui a commencé le 12 novembre 2026 et a perturbé Outlook, Teams et Copilot pendant plus de 29 heures. D’après les points de situation de Microsoft repris par la presse, des serveurs remis en service retombaient dès qu’ils recevaient à nouveau du trafic.

## L’erreur que je vois le plus souvent

L’erreur que je vois le plus souvent dans ces moments-là, c’est la capacité de l’humain à créer un surincident. Par son intervention, il empire le phénomène.

Pendant une panne, les graphes sont chaotiques et les données n’ont plus rien d’habituel. On ne peut plus s’appuyer dessus pour poser un diagnostic ferme. Nos systèmes d’information sont systémiques, un incident a souvent plusieurs causes, et on a très vite fait de lancer une mauvaise action qui amplifie l’impact.

Il y a un autre piège : parfois, l’emballement des métriques est normal. Un service qui redémarre réabsorbe d’un coup le trafic accumulé, et les courbes s’affolent alors que tout est en train de rentrer dans l’ordre. Cloudflare le raconte aussi : après le correctif, ils ont passé plusieurs heures à absorber la charge du trafic qui revenait.

Côté client, ça donne une équipe qui redémarre ses instances ou annule son dernier déploiement, alors que la panne est chez le fournisseur.

## Savoir si ça vient de chez nous

Il faut pouvoir comparer trois choses, avec leurs heures : ce que voit un utilisateur depuis l’extérieur, les requêtes que l’origine reçoit réellement, et ce que dit un contrôle interne de cette origine. Si le parcours public échoue et que le trafic n’arrive plus chez nous, des logs applicatifs sans erreur ne prouvent rien. La requête n’a jamais atteint le service.

La page de statut du fournisseur, je la consulte, mais je ne m’y fie pas. Le 18 novembre, celle de Cloudflare affichait elle-même une erreur.

Sur le multi-CDN ou la bascule de fournisseur, je n’ai pas assez d’expérience pour recommander quoi que ce soit, donc je m’abstiens.

## En 2016, on cherchait surtout un coupable

Cette histoire de fournisseur qui tombe m’a rappelé Orange, en 2016. Un fournisseur, que je ne nommerai pas, hébergeait les boîtes mail. Quand ça cassait, les réunions de crise n’avaient rien de blameless. D’un côté : ce n’est pas nous les responsables, c’est vous. De l’autre côté, la même chose. On passait plus de temps à chercher le coupable qu’à se demander comment éviter que ça se reproduise. C’était une autre époque.

## S’entraîner avant de monter sur le ring

Juger tout ça à chaud est délicat. Il faut avoir été préparé, avoir boxé un peu, avoir fait du sparring avant de monter sur le ring. Surtout quand le top management est sur le pont de crise et vous relance pour savoir quand ce sera réglé.

Le sparring peut être tout bête : couper une dépendance dans un environnement isolé, et regarder si l’équipe trouve où le parcours s’interrompt. Si tout le monde commence par chercher un déploiement fautif qui n’existe pas, il reste du travail.
