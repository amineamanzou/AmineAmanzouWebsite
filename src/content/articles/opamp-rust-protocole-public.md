---
title: "Pourquoi j’ai réimplémenté le protocole OpAMP en Rust"
locale: "fr"
articleSlug: "opamp-rust-protocole-public"
translationKey: "opamp-rust-protocole-public"
publishedAt: "2026-12-10"
label: "Observability / Engineering"
readTime: "4 min"
excerpt: "J’ai réimplémenté OpAMP en Rust pour des flottes de 100 000 assets : pourquoi, comment des agents ont écrit presque tout le code, et pourquoi le protocole n’est pas ce que je garde pour moi."
heroImage: "/blog/opamp-rust-protocole-public/cover.webp"
heroImageAlt: "L’Ingénieur Peu Fiable, liste de contrôle en main, devant une flotte de 100 000 assets, les compteurs MUST et SHOULD de la spécification et une boucle entre deux configurations"
pillar: "fleet-management"
intent: "informational"
primaryQuery: "opamp rust protocole public"
relatedOffer: "diagnostic"
seoTitle: "Pourquoi j’ai réimplémenté le protocole OpAMP en Rust"
seoDescription: "J’ai réimplémenté OpAMP en Rust pour des flottes de 100 000 assets : pourquoi, comment des agents ont écrit presque tout le code, et pourquoi le protocole n’est pas ce que je garde pour moi."
keywords: ["fleet-management", "OpenTelemetry", "opamp rust protocole public"]
proofLevel: "experience"
---

J’ai des clients qui veulent gérer une flotte de 100 000 assets dans leur SI. À cette échelle, chaque agent de collecte installé coûte de la mémoire, du CPU et du réseau, cent mille fois. Au prix de la RAM en ce moment, alléger cette empreinte, c’est directement des économies.

J’avais donc besoin de mesurer la performance de toute la chaîne, et de garder la main dessus. S’il faut aller jusqu’à réécrire le superviseur déployé sur chaque machine pour l’alléger, je veux pouvoir le faire. C’est pour ça que j’ai réimplémenté le protocole OpAMP en Rust. C’était un choix de nécessité.

## Où en est OpAMP

[OpAMP](https://opentelemetry.io/docs/specs/opamp/) est le protocole d’OpenTelemetry pour gérer à distance une flotte d’agents de collecte. Chaque agent rapporte son état à un serveur, qui lui envoie sa configuration. Sa spécification est aujourd’hui au statut bêta. Le [superviseur officiel](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/cmd/opampsupervisor/README.md), le programme qui pilote un Collector sur chaque machine, est encore en alpha.

L’implémentation de référence, [opamp-go](https://github.com/open-telemetry/opamp-go), gagne en maturité. On voit de plus en plus d’intérêt, et des entreprises s’en servent. Ce n’est pas encore un projet livré comme prêt pour la production.

## Presque tout a été écrit par des agents

Je parle ici d’agents de développement, des IA, à ne pas confondre avec les agents de collecte. Le dépôt compte 196 commits, dont 182 en quatre jours, du 22 au 25 juin.

Mon travail a été de reprendre, et de m’assurer qu’on colle à la spécification. Sinon, on ne respecte plus le standard. J’ai donc fait extraire tous les MUST et tous les SHOULD du texte : 103 MUST et 116 SHOULD dans la spécification, sans compter ceux des commentaires du schéma. Chacun a été classé côté client, côté serveur ou les deux, et ceux du serveur sont devenus une liste de contrôle.

J’ai aussi surveillé les issues et les PR d’opamp-go, pour ne pas dériver et rester complet. En novembre, j’ai réaligné le serveur sur la version 0.20.0 du protocole, et je teste l’interopérabilité contre opamp-go 0.25.0.

## Ce que le superviseur officiel montre

Pour vérifier que mon serveur parle bien le protocole, je le branche sur le superviseur officiel et un Collector, sans les modifier. Un de ces tests montre bien où s’arrête le protocole.

J’envoie une configuration invalide. Le superviseur fait ce qu’il faut : le Collector ne démarre pas, et il revient de lui-même à la configuration précédente. Sauf que mon serveur, lui, voulait toujours la version invalide. Il la reproposait, le superviseur la rejetait de nouveau, et ça recommençait toutes les cinq secondes environ.

<figure>
  <img src="/blog/opamp-rust-protocole-public/rollback-loop-fr.svg" alt="Schéma de la boucle de rollback : le serveur OpAMP propose une configuration invalide, le Collector ne démarre pas, le superviseur revient à la version précédente et la rapporte, puis le serveur repropose la configuration invalide, toutes les cinq secondes environ" loading="lazy" />
  <figcaption>La boucle observée avec le superviseur officiel et un Collector non modifiés.</figcaption>
</figure>

Chaque côté respectait le protocole. Personne n’avait décidé qui annule l’intention. Ça, c’est le travail du produit autour.

## Le protocole, je veux l’ouvrir

Je suis partant pour mettre opamp-rust en open source. N’importe qui peut réécrire ce protocole en Rust avec des agents : l’avantage défendable n’est pas là. Pour un client, il est dans l’interface autour du protocole, comme je l’ai déjà écrit dans [Voir un agent dans une UI, ce n’est pas le piloter](/blog/opamp-fleet-management-visibility-operation/).

C’est pour ça que je garde le produit pour moi. Et aussi par perfectionnisme : je n’en suis pas encore satisfait. Ouvrir l’interface reste envisageable. Mais vendre un produit open source et son support est devenu risqué : on expose son code, et côté cyber ce n’est plus anodin.

Le dépôt n’est pas encore public.

## Rust ou Go

Pour la startup ou la PME du coin, que ce soit du Rust ou du Go ne change rien. Que Rust apporte un plus en mémoire et en consommation, je n’ai pas besoin de le démontrer. Go n’a pas à rougir pour autant face aux autres langages, et il reste mon second choix.

Ce qu’il me reste à faire, c’est la mesure à l’échelle. Mes chiffres actuels viennent de charges synthétiques. Ils ne remplacent pas cent mille superviseurs réels qui tournent.
