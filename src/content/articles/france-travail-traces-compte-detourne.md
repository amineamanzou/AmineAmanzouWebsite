---
title: "Fuite de données chez France Travail : les mesures étaient connues"
locale: "fr"
articleSlug: "france-travail-traces-compte-detourne"
translationKey: "france-travail-traces-compte-detourne"
publishedAt: "2026-12-24"
label: "Observability / Engineering"
readTime: "5 min"
excerpt: "La CNIL a sanctionné France Travail pour une fuite dont les parades étaient identifiées. Ce que les journaux d’accès permettent vraiment, et pourquoi le problème n’est pas technique."
heroImage: "/blog/france-travail-traces-compte-detourne/cover.webp"
heroImageAlt: "L’Ingénieur Peu Fiable examine un journal à la loupe devant un cadenas ouvert, des lignes de logs dont une en rouge et des silhouettes de personnes exposées"
pillar: "observability"
intent: "case-study"
primaryQuery: "france travail traces compte detourne"
relatedOffer: "diagnostic"
seoTitle: "Fuite de données chez France Travail : les mesures étaient connues"
seoDescription: "La CNIL a sanctionné France Travail pour une fuite dont les parades étaient identifiées. Ce que les journaux d’accès permettent vraiment, et pourquoi le problème n’est pas technique."
keywords: ["observability", "OpenTelemetry", "france travail traces compte detourne"]
proofLevel: "experience"
---

Le 22 janvier 2026, la CNIL a [sanctionné France Travail](https://www.cnil.fr/fr/violation-de-donnees-sanction-5millions-france-travail) d’une amende de 5 millions d’euros. Début 2024, des attaquants avaient usurpé des comptes de conseillers Cap emploi et accédé aux données de toutes les personnes inscrites sur les vingt dernières années, numéros de sécurité sociale compris.

La CNIL relève trois manquements : une authentification pas assez robuste, une journalisation insuffisante pour détecter les comportements anormaux, et des habilitations trop larges. Et elle ajoute un détail. La plupart des mesures adéquates avaient été identifiées par France Travail dans ses analyses d’impact, sans jamais être mises en œuvre.

C’est ce détail qui me met en colère. J’y reviens à la fin.

## Ce que les logs m’ont déjà permis de voir

Je n’ai jamais construit ni audité un système de journalisation d’accès. Je ne travaille pas dans un SOC. Je travaille à côté, je fréquente les gens qui s’intéressent au SIEM, et surtout je suis utilisateur de ces journaux.

Chez Orange, quand je gérais 30 millions de boîtes mail, j’ai passé du temps dans les logs à chercher des comportements de détournement. Les services convoités étaient connus, par exemple l’envoi de SMS depuis l’administration d’un compte pro. Des usurpateurs s’en servaient pour lancer des campagnes de phishing par SMS. Les logs étaient la source de vérité pour repérer ces envois en masse, puis trouver comment les bloquer.

Aujourd’hui, sur une mission dans un cloud comme AWS, c’est la journalisation qui me dit qui a modifié une ressource récemment, qui s’y est connecté, qui a changé une configuration réseau ou une image. Quand on maintient un système d’information et qu’on est garant de sa sécurité, on ne s’en passe pas.

## Quand ça manque

Je me suis déjà retrouvé dans des situations où le monitoring et l’observabilité ne permettaient pas de diagnostiquer un incident. Parfois même, ils ne permettaient pas de savoir si c’était une panne interne ou une attaque.

On le voit surtout dans des PME, dans des entreprises qui n’ont pas d’obligation du régulateur. Chez les opérateurs d’importance vitale ou dans les banques, la loi impose de cocher ces cases pour exercer. Le piège, c’est que ça se transforme en checklist et en fichier Excel à remplir, et qu’on y perd un peu de bon sens.

Mais ça fait du bien quand même. Au moins, les connexions SSH aux machines sont historisées. On sait qui a lancé quelle commande. On peut reconstruire le parcours d’un pirate dans le système.

## Observabilité ou sécurité : les deux

Pour moi, les logs d’accès doivent vivre dans les deux plateformes. Elles doivent partager le même système d’ingestion, et il faut garantir que ces logs ne seront pas perdus pendant un incident.

Ils servent à deux choses. D’abord à l’exploitation de tous les jours. Ensuite, à un niveau de granularité plus fin, aux experts cyber qui diagnostiquent des attaques, des compromissions et des détournements. S’ils vivent dans le même outil, tant mieux, mais il faut une séparation. Un SRE qui règle un incident n’a pas besoin du même niveau de détail qu’un expert SOC qui vérifie qu’il n’y a pas eu de fuite de données.

<figure>
  <img src="/blog/france-travail-traces-compte-detourne/access-logs-two-uses-fr.svg" alt="Schéma : les événements d’accès passent par une ingestion partagée, puis servent à l’observabilité pour l’exploitation quotidienne avec un détail réduit, et à la sécurité pour diagnostiquer attaques et détournements avec un détail fin" loading="lazy" />
  <figcaption>Les mêmes logs d’accès, lus à deux niveaux de détail.</figcaption>
</figure>

Sur l’ordre des chantiers, côté sécurité, je me fie à un processus documenté, et la CNIL publie des recommandations sur la journalisation comme sur l’authentification multifacteur. Dans l’observabilité, je commence toujours par l’authentification, puis la journalisation, et ensuite je m’occupe des habilitations.

## Le problème n’est pas technique

Je ne sais pas ce qui s’est passé à l’intérieur de France Travail. Mais des mesures identifiées et jamais mises en œuvre, c’est un scénario que j’ai vu ailleurs, et mon avis reste le même.

Le problème de ces organisations n’est pas la compétence technique, même si elles ont tendance à tirer les TJM vers le bas. Il y a des gens talentueux, passionnés par leur métier, externes comme internes. Ils sont mal payés, mal considérés, sans augmentation, et ils font quand même leur travail correctement. Ils signalent les problèmes, ils alertent, ils essaient de faire bouger les lignes.

Ce qu’ils y gagnent, c’est d’être écartés par le top management. On les envoie sur un projet moins exposé, moins intéressant, et ils finissent au placard. Le sujet n’intéresse pas le management tant qu’on ne le lui présente pas d’une certaine façon. Et il faut l’admettre, les profils techniques ont souvent du mal avec ça. Ils n’investissent pas dans l’emballage.

On a un vrai problème de top management. Trop de profils pas assez techniques, incités sur la politique et sur le profit, avec une vision commerciale plutôt que technique. Les entreprises américaines, elles, sont dirigées par davantage d’ingénieurs à de hautes responsabilités, et ça donne une vision du métier qui tient compte de la technique.

Alors les budgets ne se débloquent que quand ça fait mal, pour pouvoir dire qu’on a fait le nécessaire et se donner bonne conscience. À ce moment-là, il est trop tard. On a perdu les données des Français.
