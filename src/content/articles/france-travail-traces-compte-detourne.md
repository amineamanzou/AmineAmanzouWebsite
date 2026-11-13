---
title: "Fuite de données chez France Travail : quelles traces pour repérer un compte détourné ?"
locale: "fr"
articleSlug: "france-travail-traces-compte-detourne"
translationKey: "france-travail-traces-compte-detourne"
publishedAt: "2026-12-17"
label: "Observability / Engineering"
readTime: "3 min"
excerpt: "Partir des constats publics de la CNIL pour examiner les événements d’accès, leur corrélation et les limites de la détection."
heroImageAlt: "Illustration du diagnostic et des décisions d’observabilité"
pillar: "observability"
intent: "case-study"
primaryQuery: "france travail traces compte detourne"
relatedOffer: "diagnostic"
seoTitle: "Fuite de données chez France Travail : quelles traces pour repérer un compte détourné ?"
seoDescription: "Partir des constats publics de la CNIL pour examiner les événements d’accès, leur corrélation et les limites de la détection."
keywords: ["observability", "OpenTelemetry", "france travail traces compte detourne"]
proofLevel: "documentation"
---

En janvier 2026, la CNIL a publié une sanction concernant France Travail après la fuite de données de 2024. Elle relève notamment une authentification insuffisamment robuste, des habilitations trop larges et une journalisation insuffisante pour détecter les comportements anormaux. Les attaquants avaient usurpé des comptes de conseillers Cap emploi. [Constats publics de la CNIL](https://www.cnil.fr/fr/violation-de-donnees-sanction-5millions-france-travail).

Ces constats permettent de poser une question d’observabilité précise : que faudrait-il pouvoir retrouver quand un compte valide est utilisé pour consulter des données auxquelles son utilisateur ne devrait pas s’intéresser ? Les propositions qui suivent sont mon analyse. Elles ne décrivent ni la stack interne de France Travail ni une alerte dont je saurais qu’elle aurait empêché cet incident.

## Une connexion réussie ne termine pas l’enquête

Un journal d’authentification peut montrer qu’un compte s’est connecté. Pour comprendre la suite, il faut pouvoir rapprocher cette connexion des actions effectuées dans l’application. Quel type d’opération ? Sur quel périmètre ? Avec quel résultat ?

Je chercherais un lien stable entre l’identité technique, la session et l’événement d’accès. Une heure correctement enregistrée aide à rapprocher les sources. Un identifiant de requête aide à suivre un passage entre services. Aucun de ces champs ne remplace une définition claire de l’action métier.

Le contenu complet du dossier n’a pas besoin d’être recopié dans un log pour prouver qu’un accès a eu lieu. L’identifiant de la ressource et sa catégorie peuvent suffire au cas étudié, sous réserve des règles de protection et d’accès applicables. Une chaîne de diagnostic qui réplique les données sensibles crée elle aussi un périmètre à protéger.

## Une anomalie demande du contexte

Un volume inhabituel de consultations peut être une piste. Il faut le comparer au rôle du compte, à son périmètre autorisé et à la tâche effectuée. Un traitement légitime peut produire beaucoup d’événements ; une extraction lente peut rester sous un seuil grossier.

Je testerais des scénarios synthétiques pour observer le délai entre la première action suspecte, sa disponibilité dans les journaux et l’examen du signal par une personne. Si la collecte accuse plusieurs heures de retard, une règle correcte peut arriver trop tard pour guider la réponse.

## Tester aussi l’absence de données

Une vérification devrait montrer ce qui arrive quand un service cesse d’émettre ses événements d’accès. Le compteur à zéro peut signifier que personne n’a consulté de dossier, ou que notre preuve a disparu. L’équipe doit pouvoir faire la différence.

Les droits d’accès et l’authentification restent des contrôles nécessaires. La journalisation ajoute la possibilité de constater, d’enquêter et de mesurer si la détection fonctionne. Pour juger cette capacité, je demanderais la reconstitution d’un scénario autorisé, du premier accès jusqu’à la décision de réponse.
