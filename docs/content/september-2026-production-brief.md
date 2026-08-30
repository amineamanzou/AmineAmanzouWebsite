# Production éditoriale — septembre 2026

Statut : `in_production`

Ce lot insère le retour d’expérience `k3s-opensearch-poc` au début du calendrier. Les quatre sujets suivants sont décalés d’une semaine. Le sujet « Observabilité métier d’un tunnel de vente » passe en octobre avec le reste du calendrier.

## Calendrier retenu

| FR | EN | Slug | Sujet | Preuve dominante |
|---|---|---|---|---|
| 2026-09-01 | 2026-09-03 | `clf-viaq-opentelemetry-opensearch-lab` | ViaQ/CLF et OTel dans un pipeline Kafka, Data Prepper et OpenSearch | lab |
| 2026-09-08 | 2026-09-10 | `monitoring-vs-observabilite-production` | Monitoring vs observabilité en production | documentation + experience |
| 2026-09-15 | 2026-09-17 | `audit-observabilite-checklist-maturite` | Audit observabilité : checklist de maturité en 35 points | experience + documentation |
| 2026-09-22 | 2026-09-24 | `slo-avant-dashboards` | Définir des SLO avant les dashboards | documentation + experience |
| 2026-09-29 | 2026-10-01 | `reduire-fatigue-alerte` | Réduire la fatigue d’alerte sans perdre les incidents utiles | documentation + experience |

## Contrats de preuve

### Lab ViaQ/CLF et OpenTelemetry

- Les chiffres décrivent une exécution et une configuration précises ; ils ne constituent pas un benchmark universel.
- L’écart de comptage proche de 4,8 % reste non expliqué. Ne pas écrire « perte OTel » ni attribuer une causalité.
- Séparer les événements attendus, capturés dans Kafka, décodés et indexés dans OpenSearch.
- CPU, mémoire et nombre de messages Kafka peuvent être rapportés avec leur fenêtre, leur unité et leur méthode de collecte.
- Les différences de runtime, parser, batching, exporter et configuration interdisent d’attribuer tout l’écart de ressources à un seul composant.
- Le dépôt reproductible et la review externe font partie du résultat attendu du lab, pas d’une promesse déjà tenue.

### Monitoring vs observabilité

- Éviter la bataille de définitions marketing.
- Partir des questions opérationnelles : détecter un symptôme, expliquer une cause, comparer un changement, reconstruire une requête.
- Traiter métriques, logs et traces comme des moyens ; la capacité à répondre à une question imprévue est la conséquence recherchée.

### Audit de maturité

- Les 35 points forment une grille de terrain d’Amine, pas une norme CNCF ou Google.
- Chaque point doit débloquer une décision ou une vérification, pas seulement constater la présence d’un outil.
- Regrouper la grille par expérience utilisateur, instrumentation, pipelines, stockage/coût, opérations, gouvernance et amélioration.

### SLO avant dashboards

- Un SLO traduit un résultat utilisateur en ratio mesurable et cible temporelle.
- Le dashboard vient ensuite rendre le SLI, le budget d’erreur et les causes explorables.
- Un SLO sans propriétaire ni politique de décision reste un KPI décoratif.

### Fatigue d’alerte

- Une alerte de paging doit être actionnable et liée à un impact ou un risque imminent clairement défini.
- Mesurer le ratio alertes/incidents, les doublons, les pages sans action et les incidents découverts hors alerte.
- Le but n’est pas de réduire le nombre d’alertes à tout prix, mais de préserver la capacité de réponse humaine.

## Sources de départ

- Google SRE — Monitoring Distributed Systems: https://sre.google/sre-book/monitoring-distributed-systems/
- Google SRE Workbook — Monitoring: https://sre.google/workbook/monitoring/
- Google SRE Workbook — Implementing SLOs: https://sre.google/workbook/implementing-slos/
- Google SRE Workbook — Alerting on SLOs: https://sre.google/workbook/alerting-on-slos/
- Google SRE — Being On-Call: https://sre.google/sre-book/being-on-call/
- Google SRE — Tracking Outages: https://sre.google/sre-book/tracking-outages/
- OpenTelemetry — Signals: https://opentelemetry.io/docs/concepts/signals/

## Direction de voix

Les articles commencent par une scène, une friction ou une question réellement posée en review. Ils distinguent documentation publique, pratique de terrain, mesure de lab et hypothèse. Le mode de distribution est `neutral` : pas de CTA d’engagement, pas de question générique finale.
