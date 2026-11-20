---
title: "Mon bilan 2026 et les chantiers que je prépare pour 2027"
locale: "fr"
articleSlug: "bilan-2026-chantiers-2027"
translationKey: "annual-review"
publishedAt: "2026-12-31"
label: "Observability / Engineering"
readTime: "3 min"
excerpt: "Un bilan provisoire autour du fleet management, de l’observabilité et du travail avec les agents, avec les choix de 2027 encore à confirmer."
heroImageAlt: "Illustration du diagnostic et des décisions d’observabilité"
pillar: "observability"
intent: "informational"
primaryQuery: "bilan 2026 chantiers 2027"
relatedOffer: "diagnostic"
seoTitle: "Mon bilan 2026 et les chantiers que je prépare pour 2027"
seoDescription: "Un bilan provisoire autour du fleet management, de l’observabilité et du travail avec les agents, avec les choix de 2027 encore à confirmer."
keywords: ["observability", "OpenTelemetry", "bilan 2026 chantiers 2027"]
proofLevel: "experience"
---

J’ai passé une partie de 2026 à travailler sur le fleet management, une implémentation d’OpAMP en Rust et mon workflow de développement avec des agents. Ces chantiers m’obligent à revenir à des questions assez terre à terre : quel état est connu, quelle preuve manque et qui doit reprendre la main ?

Ce bilan est préparé avant la fin de l’année. Il ne prétend donc pas raconter décembre à l’avance. Les résultats définitifs et les priorités de 2027 devront être arrêtés à partir de ce qui aura réellement été livré et observé.

## Un protocole à partager, un produit à garder privé

Pour OpAMP, mon intention est de publier l’implémentation du protocole en Rust. Le produit et son frontend restent privés. Cette séparation aide à préciser la contribution que je veux rendre utile à d’autres : un comportement que l’on peut lire et tester, avec des limites identifiables.

Ce qui restera à vérifier au moment de publier ce bilan, c’est le périmètre effectivement rendu public. Une intention de publication ne sera pas transformée en annonce de sortie par la seule présence d’une date dans le calendrier.

## Retrouver du temps pour le besoin

Avec les agents de développement, je cherche à passer davantage de temps sur le besoin, le métier et l’architecture, et moins sur les gestes répétitifs. Une exécution qui se termine ne suffit pas à mesurer ce progrès. Il faut aussi compter les relances, les reprises et le temps passé à comprendre pourquoi une tâche n’avance plus.

Pour juger ce travail, je voudrais comparer des situations concrètes : une tâche attendait-elle une décision, une preuve technique ou simplement un relais qui n’existait pas ? Cette distinction évite de conclure trop vite qu’il faut soit plus d’autonomie, soit davantage de validation humaine.

## Les pistes que je veux préciser pour 2027

L’observabilité reste mon point de départ professionnel. Les outils évoluent, mais j’ai toujours besoin de comprendre ce qu’une équipe peut expliquer avec ses données et ce qu’elle doit reconstruire au milieu d’un incident.

Les pistes déjà ouvertes sont le fleet management autour d’OpAMP, l’évaluation de solutions d’observabilité et une meilleure continuité du travail avec les agents. Ce sont des axes de réflexion, pas une feuille de route datée ni une promesse de livraison.

Avant de fixer les priorités, je veux distinguer ce qui a été utilisé, ce qui a été testé et ce qui est resté dans un plan. Les décisions de 2027 devront pouvoir pointer vers une contrainte réelle ou un retour d’usage. C’est aussi ce que j’attends d’un bilan utile : retrouver les raisons de continuer un chantier, et accepter celles qui justifient de le réduire.
