---
title: "Audit observabilité : 35 vérifications avant de parler d’outils"
locale: "fr"
articleSlug: "audit-observabilite-checklist-maturite"
translationKey: "observability-audit-maturity-checklist"
publishedAt: "2026-09-15"
label: "Observabilité / Audit"
readTime: "12 min"
excerpt: "Une checklist de maturité utile ne compte pas les dashboards. Elle vérifie si les équipes détectent un impact, mènent une enquête, maîtrisent leurs pipelines et transforment les incidents en décisions."
heroImage: "/blog/audit-observabilite-checklist-maturite/hero-maturity-audit-loop.svg"
heroImageAlt: "Une checklist d’audit relie expérience utilisateur, télémétrie, pipelines, coûts, opérations et gouvernance"
pillar: "observability"
intent: "commercial"
primaryQuery: "observability maturity assessment"
relatedOffer: "diagnostic"
seoTitle: "Audit observabilité : checklist de maturité en 35 points"
seoDescription: "Évaluez la maturité observabilité avec 35 vérifications sur les SLO, l’instrumentation, les pipelines, les coûts, l’astreinte et la gouvernance."
keywords: ["audit observabilité", "observability maturity assessment", "checklist observabilité", "SLO", "OpenTelemetry"]
proofLevel: "documentation"
---

Une plateforme peut avoir des agents sur tous les serveurs, des dashboards par équipe et un contrat APM assez cher pour mériter sa propre ligne budgétaire.

Pendant l’incident, quelqu’un copie encore un identifiant depuis le support vers trois moteurs de recherche.

C’est généralement le moment où l’inventaire d’outils cesse d’être une mesure crédible de maturité.

La grille ci-dessous assemble des questions opérationnelles dérivées des principes publics du SRE et des modèles de données OpenTelemetry. Elle ne constitue ni une norme Google, ni une certification CNCF. C’est une checklist à vérifier sur le terrain.

Chaque point doit être vérifié avec une preuve : requête, alerte, trace, configuration, historique d’incident, règle de rétention, propriétaire ou décision. Une réponse « l’outil sait le faire » ne vaut pas encore une capacité opérationnelle.

## 1. Partir de l’expérience réellement rendue

1. **Les parcours critiques sont nommés.** L’équipe sait quelles interactions doivent survivre : connexion, paiement, recherche, ingestion, déploiement ou traitement de batch.
2. **Chaque parcours possède un résultat mesurable.** Succès, latence, fraîcheur, correction, durabilité ou couverture sont définis du point de vue de l’utilisateur.
3. **Les SLIs regardent assez près de l’utilisateur.** Une métrique interne ne masque pas les requêtes qui n’atteignent jamais le service.
4. **Les objectifs ont un propriétaire.** Une personne ou une équipe peut arbitrer entre fiabilité, coût et vitesse de livraison.
5. **Les données métier et techniques se rejoignent.** L’équipe peut relier une dégradation à une population, une version ou une opération importante sans exposer inutilement des données personnelles.

Une équipe qui ne sait pas décrire le service rendu produira surtout des métriques de composants. Elles peuvent être exactes tout en ratant l’impact qui compte.

## 2. Conserver le contexte pendant l’instrumentation

6. **Les services ont une identité stable.** `service.name`, version, environnement et autres attributs de resource restent cohérents entre équipes.
7. **Le contexte traverse les frontières.** HTTP, messaging, jobs et appels asynchrones propagent ou relient les identifiants nécessaires.
8. **Les logs importants sont structurés.** Les champs utilisés pendant l’enquête ne vivent pas uniquement dans une phrase libre.
9. **Logs et traces sont corrélés.** Un événement applicatif peut rejoindre l’opération qui l’a produit.
10. **Les attributs métier sont gouvernés.** Leur nom, leur utilité, leur cardinalité et leur sensibilité sont connus.

Installer une instrumentation automatique peut couvrir beaucoup de bibliothèques. Elle ne connaît pas automatiquement le résultat métier, l’identité d’un tenant ou la décision qu’une application vient de prendre.

## 3. Traiter le pipeline comme un service de production

11. **Les chemins de télémétrie sont cartographiés.** Receivers, processors, queues, exporters et destinations sont visibles de bout en bout.
12. **Le pipeline possède sa propre télémétrie.** Refus, retries, files d’attente, mémoire, backpressure et échecs d’export sont suivis.
13. **La panne du backend a été testée.** L’équipe connaît la durée de buffering, le comportement au redémarrage et la perte acceptable.
14. **Les configurations passent par une livraison contrôlée.** Validation, canary, rollback et historique remplacent les modifications directes en production.
15. **La capacité est reliée au volume.** Lignes de logs, spans, datapoints, taille moyenne et pics permettent d’estimer CPU, mémoire, réseau et stockage.

Le pipeline d’observabilité est souvent considéré comme le tuyau qui regarde les autres services. Il reste pourtant un système distribué avec ses propres files, limites, dépendances et modes de panne.

## 4. Savoir ce qui est stocké et ce que cela coûte

16. **La rétention répond à un usage.** Incident, audit, tendance ou obligation réglementaire justifie la durée de conservation.
17. **La cardinalité est mesurée avant de devenir une facture.** Les champs à nombreuses valeurs sont identifiés par signal et par backend.
18. **L’indexation est intentionnelle.** Tout n’est pas indexé comme si chaque attribut devait répondre en quelques millisecondes.
19. **Les coûts sont attribuables.** Une équipe peut relier une hausse à une source, un environnement, un pipeline ou une nouvelle duplication.
20. **La suppression est vérifiable.** Les données personnelles ou sensibles possèdent une politique, des droits d’accès et un chemin de retrait testable.

Le coût n’est pas seulement le prix d’ingestion affiché par le fournisseur. Il inclut la collecte, le transport, les buffers, le stockage, les requêtes, la rétention et le temps humain passé à maintenir les exceptions.

## 5. Détecter moins de bruit et mieux enquêter

21. **Les pages correspondent à une action immédiate.** Si la personne d’astreinte ne peut rien faire, le signal appartient plutôt à un ticket ou à un dashboard.
22. **Les alertes suivent un symptôme ou un budget.** Les seuils internes ne réveillent pas quelqu’un sans lien clair avec un impact ou une panne imminente.
23. **Les doublons sont regroupés.** Un incident ne déclenche pas quinze notifications décrivant la même cause.
24. **L’alerte fournit le contexte de départ.** Service, impact, runbook, fenêtre, changement récent et propriétaire sont accessibles sans chasse au trésor.
25. **Les trous de détection sont suivis.** Les incidents découverts par le support ou les utilisateurs deviennent des signaux pour améliorer les SLIs et l’alerting.

Google SRE recommande des alertes actionnables et un ratio signal/bruit assez élevé pour préserver l’astreinte. La cible n’est pas un nombre magique d’alertes. Elle consiste à garder assez de capacité cognitive pour traiter la prochaine page sérieuse.

## 6. Rendre la gouvernance visible

26. **Chaque service et pipeline a un propriétaire.** L’identité ne dépend pas de la mémoire de la dernière personne présente.
27. **Les accès suivent les responsabilités.** L’astreinte peut enquêter sans obtenir des droits permanents excessifs.
28. **Les destinations sont approuvées.** Ajouter un exporter ou une copie de logs sensibles laisse une trace et passe par une review.
29. **Les secrets sont séparés des configurations.** Tokens, certificats et credentials ont une rotation et un périmètre explicites.
30. **Les changements sont auditables.** L’équipe peut retrouver qui a modifié une règle, un pipeline, une rétention ou un dashboard critique.

La gouvernance devient visible quand une question opérationnelle trouve un propriétaire et une preuve. Un document RACI oublié dans un espace partagé ne suffit pas.

## 7. Transformer les incidents en amélioration

31. **Les incidents significatifs produisent une chronologie.** Les faits, décisions, inconnues et effets sont séparés.
32. **Les actions corrigent le système.** Elles ne se limitent pas à demander aux personnes d’être plus prudentes.
33. **Les actions ont une échéance et un responsable.** Leur fermeture demande une preuve, pas seulement un statut.
34. **Les exercices rejouent les modes de panne.** Backend indisponible, queue saturée, certificat expiré ou contexte cassé sont testés avant le prochain incident.
35. **La maturité est réévaluée sur des cas réels.** Le score change lorsque la capacité d’enquête et de décision change, pas lorsque de nouvelles licences arrivent.

## Utiliser la checklist sans fabriquer un score rassurant

Je classe chaque point dans quatre états simples : absent, partiel, opérationnel ou vérifié récemment.

`Opérationnel` signifie que le processus existe et qu’une équipe sait l’utiliser. `Vérifié récemment` demande une preuve datée : exercice, incident, requête rejouée, restauration ou test de charge.

Je ne calcule pas immédiatement une moyenne sur 100. Une absence sur la propagation de contexte, la sécurité des données ou la capacité de rollback peut compter davantage que dix dashboards bien documentés.

La restitution doit donc montrer :

- les parcours utilisateurs mal couverts ;
- les enquêtes impossibles ou trop lentes ;
- les risques de pipeline et de données ;
- les coûts sans propriétaire ;
- trois à cinq améliorations avec une preuve de sortie.

Une bonne évaluation ne récompense pas la quantité de télémétrie. Elle montre où une équipe perd du temps, du contexte ou sa capacité à décider quand la production commence à raconter autre chose que le dashboard.

## Sources

- [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Google SRE Workbook — Implementing SLOs](https://sre.google/workbook/implementing-slos/)
- [Google SRE — Being On-Call](https://sre.google/sre-book/being-on-call/)
- [OpenTelemetry — Signals](https://opentelemetry.io/docs/concepts/signals/)
- [OpenTelemetry — Resource semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/)
