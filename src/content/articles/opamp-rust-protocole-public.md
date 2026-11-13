---
title: "Pourquoi j’ai réimplémenté le protocole OpAMP en Rust"
locale: "fr"
articleSlug: "opamp-rust-protocole-public"
translationKey: "opamp-rust-protocole-public"
publishedAt: "2026-12-03"
label: "Observability / Engineering"
readTime: "3 min"
excerpt: "Une implémentation Rust d’OpAMP, un périmètre de publication limité au protocole et des preuves d’interopérabilité à rendre lisibles."
heroImageAlt: "Illustration du diagnostic et des décisions d’observabilité"
pillar: "fleet-management"
intent: "informational"
primaryQuery: "opamp rust protocole public"
relatedOffer: "diagnostic"
seoTitle: "Pourquoi j’ai réimplémenté le protocole OpAMP en Rust"
seoDescription: "Une implémentation Rust d’OpAMP, un périmètre de publication limité au protocole et des preuves d’interopérabilité à rendre lisibles."
keywords: ["fleet-management", "OpenTelemetry", "opamp rust protocole public"]
proofLevel: "experience"
---

J’ai réimplémenté le protocole OpAMP en Rust. Le code que je compte publier porte sur le protocole ; le produit et son frontend restent privés. Je tiens à poser cette frontière avant de montrer quoi que ce soit, parce qu’une interface de gestion de flotte peut vite faire oublier ce qui est réellement partagé.

OpAMP décrit des échanges entre agents et serveur pour la gestion des agents. La spécification prévoit notamment des transports HTTP et WebSocket et des messages de configuration et de statut. Le mot « agent » désigne ici le logiciel géré, pas un assistant IA chargé de décider à notre place. [Spécification OpAMP](https://opentelemetry.io/docs/specs/opamp/).

## Faire communiquer deux implémentations

L’intérêt d’une implémentation indépendante est de pouvoir discuter le comportement du protocole sans dépendre d’un seul code. Rust est mon choix pour ce chantier. Ce choix ne constitue ni un benchmark contre Go, ni une preuve que la mémoire, les reconnexions et l’exploitation seraient réglées automatiquement.

Le premier exemple que je voudrais rendre reproductible est un échange avec une implémentation différente. Une suite de tests qui ne parle qu’à son propre client peut partager la même mauvaise lecture de la spécification des deux côtés. L’interopérabilité oblige à sortir de ce confort.

Une connexion qui s’ouvre reste un début. Je veux pouvoir suivre ce qui arrive après : une configuration est proposée, l’agent répond et le serveur distingue l’intention envoyée de l’état rapporté. Si le lien coupe, il faut aussi expliquer quel état est encore connu et quel état doit être confirmé.

## Publier des preuves avec le code

Pour la publication, je veux rendre visibles la version du protocole visée, les échanges couverts et les limites connues. Un exemple minimal doit permettre à quelqu’un d’autre de reproduire un cas sans avoir mon produit, mon interface ou un environnement client.

Les scénarios devraient inclure une réponse invalide, une reconnexion et des messages reçus dans un ordre inattendu, selon les exigences de la version ciblée. Je présente ici les preuves que je veux rendre lisibles ; cet article n’annonce pas un résultat de campagne de conformité ni une mesure de performance.

Le dépôt public et son premier périmètre de livraison restent à finaliser. Je préfère que le premier lien permette de comprendre et de tester un contrat réduit, plutôt que de promettre un outil de fleet management complet. Ceux qui voudront construire autour du protocole auront surtout besoin de savoir à quoi ils peuvent se fier.
