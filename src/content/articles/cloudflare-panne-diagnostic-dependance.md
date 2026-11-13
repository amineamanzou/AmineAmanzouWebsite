---
title: "Cloudflare tombe : comment savoir si le problème vient de chez nous ?"
locale: "fr"
articleSlug: "cloudflare-panne-diagnostic-dependance"
translationKey: "cloudflare-panne-diagnostic-dependance"
publishedAt: "2026-11-26"
label: "Observability / Engineering"
readTime: "3 min"
excerpt: "Partir de la panne Cloudflare du 18 novembre 2025 pour distinguer l’application, ses dépendances et ce que voit l’utilisateur."
heroImageAlt: "Illustration du diagnostic et des décisions d’observabilité"
pillar: "reliability"
intent: "case-study"
primaryQuery: "cloudflare panne diagnostic dependance"
relatedOffer: "diagnostic"
seoTitle: "Cloudflare tombe : comment savoir si le problème vient de chez nous ?"
seoDescription: "Partir de la panne Cloudflare du 18 novembre 2025 pour distinguer l’application, ses dépendances et ce que voit l’utilisateur."
keywords: ["reliability", "OpenTelemetry", "cloudflare panne diagnostic dependance"]
proofLevel: "documentation"
---

Le 18 novembre 2025, Cloudflare a subi une panne importante. Son compte rendu décrit un changement de permissions dans une base de données, un fichier de configuration devenu trop volumineux et un échec du logiciel qui le consommait. [Compte rendu de Cloudflare](https://blog.cloudflare.com/18-november-2025-outage/).

Je m’intéresse ici à l’équipe cliente. Elle n’a pas accès aux consoles internes de Cloudflare et doit pourtant répondre à une question pressante : est-ce qu’elle doit modifier quelque chose chez elle ? L’analyse qui suit est ma lecture du problème, pas le récit d’une intervention que j’aurais menée pendant cette panne.

## Un serveur calme peut servir un site inaccessible

Prenons un scénario : l’origine répond correctement à ses contrôles internes, mais les utilisateurs voient des erreurs sur le chemin public. Redémarrer les instances applicatives peut occuper tout le monde sans changer ce chemin.

Je voudrais pouvoir comparer trois observations horodatées : un parcours public depuis l’extérieur, les requêtes que l’origine reçoit réellement et un contrôle interne de cette origine. Si le parcours public échoue et que le trafic n’arrive plus, l’absence d’erreurs dans les logs applicatifs ne prouve pas que le service est disponible.

Un test direct de l’origine peut aider lorsqu’un chemin de diagnostic sécurisé a été prévu. Je n’ouvrirais pas l’origine à Internet au milieu de l’incident pour fabriquer ce test. Les protections et la méthode de comparaison doivent exister avant le besoin.

## Chercher la frontière où la requête disparaît

Les heures, les régions et les identifiants de requête deviennent utiles lorsqu’ils relient les observations. Un graphe global peut cacher un problème limité à une route ou à un groupe d’utilisateurs. Une trace absente peut simplement signifier que la requête n’a jamais atteint le service instrumenté.

Je consulterais aussi la page de statut du fournisseur, en conservant les heures de mes propres constats. Une annonce publique peut confirmer une piste ; son absence ne suffit pas à écarter une dépendance. La même prudence s’applique au retour à la normale : un composant rétabli ne prouve pas encore que notre parcours utilisateur fonctionne.

## Décider sans déplacer le problème

Basculer de fournisseur pendant une panne demande davantage qu’un nouveau nom DNS. Il faut connaître les effets sur TLS, les règles de sécurité, les caches et les sessions. Ce sont des chemins à tester à froid, avec une procédure de retour.

Pour communiquer, je séparerais l’impact observé, la piste en cours et la prochaine vérification. « Notre fournisseur rencontre un incident » ne décrit pas quelles fonctions nos utilisateurs peuvent encore utiliser.

L’exercice que je retiens est simple à préparer : couper une dépendance dans un environnement isolé et vérifier que les signaux montrent où le parcours s’interrompt. Si toute l’équipe cherche d’abord un déploiement applicatif imaginaire, le diagnostic a encore besoin de travail.
