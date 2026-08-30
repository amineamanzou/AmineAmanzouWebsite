---
title: "ViaQ ou OpenTelemetry sur OpenShift : ce que mon lab HyperShift a vraiment mesuré"
locale: "fr"
articleSlug: "clf-viaq-opentelemetry-opensearch-lab"
translationKey: "clf-viaq-opentelemetry-opensearch-lab"
publishedAt: "2026-09-01"
label: "OpenShift / OpenTelemetry"
readTime: "12 min"
excerpt: "J’ai comparé deux chemins de logs OpenShift vers Kafka et OpenSearch. Les écarts CPU, mémoire et batching sont mesurés ; l’écart de comptage OTel reste inexpliqué."
heroImage: "/blog/clf-viaq-opentelemetry-opensearch-lab/hero-lab-topology.svg"
heroImageAlt: "Deux pipelines de logs OpenShift comparent ViaQ et OpenTelemetry entre les fichiers CRI, Kafka et OpenSearch"
pillar: "opentelemetry"
intent: "comparative"
primaryQuery: "ViaQ OpenTelemetry OpenShift Kafka OpenSearch"
relatedOffer: "otel_sprint"
seoTitle: "ViaQ vs OpenTelemetry sur OpenShift : mesures du lab"
seoDescription: "Comparaison mesurée de ClusterLogForwarder ViaQ et OpenTelemetry vers Kafka et OpenSearch : batching, CPU, mémoire, limites et écart de comptage."
keywords: ["OpenShift Logging", "ClusterLogForwarder", "ViaQ", "OpenTelemetry", "Kafka", "Data Prepper", "OpenSearch", "HyperShift"]
proofLevel: "documentation"
sourceUrls:
  - "https://docs.redhat.com/en/documentation/red_hat_openshift_logging/6.0/html/configuring_logging/configuring-log-forwarding"
  - "https://docs.redhat.com/en/documentation/red_hat_build_of_opentelemetry/3.10/html/release_notes_for_the_red_hat_build_of_opentelemetry/otel_rn"
  - "https://docs.redhat.com/en/documentation/red_hat_build_of_opentelemetry/3.10/html/configuring_the_collector/otel-collector-receivers_otel-configuration-of-otel-intro"
  - "https://docs.redhat.com/en/documentation/red_hat_build_of_opentelemetry/3.10/html/configuring_the_collector/otel-collector-exporters"
  - "https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md"
  - "https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md"
  - "https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md"
  - "https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md"
  - "https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/opensearchexporter/README.md"
  - "https://docs.opensearch.org/latest/data-prepper/pipelines/configuration/sources/kafka/"
  - "https://docs.opensearch.org/latest/data-prepper/pipelines/pipelines/"
  - "https://docs.opensearch.org/latest/data-prepper/pipelines/configuration/sinks/opensearch/"
---
Le graphe CPU avait exactement la tête du résultat qu'on aime montrer en comité d'architecture. Une courbe basse, une autre nettement plus haute, deux VMs identiques et un chiffre facile à retenir : dans mon lab, le consumer OpenTelemetry utilisait environ 42 % de CPU moyen et 62 % de mémoire moyenne en moins que Data Prepper.

J'aurais pu m'arrêter là, ajouter trois flèches entre OpenShift, Kafka et OpenSearch, puis expliquer que le batching OTLP avait gagné. Le genre de slide qui survit très bien jusqu'au jour où quelqu'un demande combien de logs sont arrivés au bout.

Sur 2 910 000 identifiants synthétiques attendus, j'en ai retrouvé 2 768 029 dans l'export de l'index OpenSearch de la branche OTel. Cela fait un écart de comptage de 4,8787 %. Je vais être précis parce que tout l'article tient là-dessus : cet écart reste inexpliqué. Ce lab ne permet ni de l'appeler « perte OpenTelemetry », ni d'en attribuer la cause à un composant.

En vrai, c'est ce chiffre inconfortable qui rend l'expérience intéressante. Le CPU raconte le coût du chemin qui a fonctionné. Les identifiants manquants racontent les endroits où ma méthode ne permettait plus de conclure.

## Deux chemins concurrents à partir des mêmes logs

Le lab tournait sur OpenShift 4.22 avec un hosted cluster HyperShift sur Azure. Le control plane du cluster hébergé vivait sur le management cluster ; les workers, Kafka et OpenSearch vivaient côté hosted cluster. J'ai ensuite fait lire les logs CRI par deux collectes indépendantes.

La première utilisait OpenShift Logging 6.6. Un `ClusterLogForwarder` configurait Vector pour sélectionner les logs application, infrastructure et audit, les enrichir au format ViaQ et les envoyer vers trois topics Kafka. Une VM Azure exécutait Data Prepper : source Kafka, parsing du JSON ViaQ, normalisation, puis bulk vers trois index OpenSearch. C'est le chemin familier dans un environnement OpenShift. La documentation Red Hat décrit le `ClusterLogForwarder`, ses inputs, filtres, pipelines et sorties Kafka.[1]

La seconde utilisait le Red Hat build of OpenTelemetry Operator. Des ressources `OpenTelemetryCollector` en mode DaemonSet lisaient les fichiers avec le receiver `filelog`, ajoutaient les attributs Kubernetes, regroupaient les `LogRecord`, puis exportaient de l'OTLP JSON dans trois autres topics Kafka. Une seconde VM, du même SKU `Standard_D4as_v5`, consommait ces topics avec un collector contrib et envoyait les documents vers trois index OpenSearch.

Cette frontière de support compte. Le run utilisait bien l'Operator Red Hat 0.152.0-2 et l'image collector Red Hat sur OpenShift. Red Hat documente le receiver `filelog`, l'exporter Kafka et les modes de déploiement du collector ; la version 3.10 est basée sur l'upstream 0.152.0.[2][3][4] En revanche, le consumer externe utilisait `otel/opentelemetry-collector-contrib` et son exporter OpenSearch, classé alpha pour les logs par le projet upstream.[9] Le chemin complet jusqu'à OpenSearch n'était donc pas « supporté Red Hat ». C'est un assemblage de briques avec des périmètres de support différents.

## Une charge simple à compter, justement pour pouvoir douter

Je ne disposais ni des images ni du schéma propriétaire Aqua. Le générateur produisait donc des événements explicitement synthétiques : une ligne JSON par événement, un préfixe de run et une séquence continue. Le contenu ressemblait à une violation de policy runtime, mais sa fonction était surtout comptable. Si l'identifiant `001700000` entre dans le fichier, je dois pouvoir le chercher à chaque étage.

La charge a duré deux heures : 20 minutes à 50 EPS, 30 à 250, 30 à 500, 20 à 1 000, puis 20 à 250. Soit 2 910 000 identifiants attendus. En parallèle, une boucle effectuait des actions Kubernetes ordinaires pour alimenter les autres classes de logs. Cette boucle secondaire s'est terminée sur un timeout TLS de l'API de management. Le générateur principal, lui, a terminé son plan.

J'ai archivé les plages Kafka, les exports OpenSearch, les séries Prometheus, les versions, les hashes de configuration et les checksums. Les 1 763 observations de garde-fou sont valides et les checksums du dataset de 1 GiB passent encore. Attention au mot « valide » : le garde-fou live vérifiait surtout que les targets et les familles de métriques existaient. Il ne prouvait pas que chaque intervalle était exempt de saturation.

Autre rugosité de reproductibilité : le manifest pointe vers un commit Git, mais le run a utilisé 31 fichiers de configuration modifiés dans une worktree sale. Leurs hashes sont archivés et correspondent encore aux fichiers, ce qui permet l'audit. Un checkout du commit ne recrée pas à lui seul cette expérience. Oui, le lab qui devait tester la fiabilité des pipelines a aussi testé la fiabilité de ma discipline Git.

## Le batching change vraiment la forme du transport

La branche ViaQ a produit 3 719 910 messages Kafka dans le topic audit archivé. Le contrat était simple : un log logique par message Kafka. La branche OTLP a produit 9 169 messages contenant 3 004 802 `LogRecord`. Le batch moyen contenait 327,71 records, le p50 500, le p95 683 et le maximum 773.

Le ratio brut est spectaculaire : environ 406 fois moins de messages Kafka. Le batch processor OTel regroupe les logs selon une taille ou un timeout ; `send_batch_size` déclenche l'envoi et `send_batch_max_size` impose une borne.[5] Ici, les producteurs utilisaient un trigger à 512 records, un maximum à 1 024 et un timeout de deux secondes.

Je garde quand même un gros astérisque sur le 406x. Les deux archives audit ne contiennent pas le même nombre de logs logiques : 3,720 millions d'un côté, 3,005 millions de l'autre. Ce ratio décrit les flux capturés. Il ne mesure pas un gain à input strictement identique, encore moins un gain de bout en bout. Pour isoler l'effet du batching, il faut rejouer le même corpus avec un batch OTLP, puis avec un record par message, sans changer le reste du pipeline.

## Les ressources baissent, mais le pipeline entier a changé

Sur 481 échantillons à 15 secondes, la VM OTel consommait en moyenne 2,259 % de CPU hôte, avec un p95 à 4,257 %, et 0,846 GiB de mémoire. La VM Data Prepper était à 3,900 % de CPU moyen, p95 7,321 %, et 2,220 GiB de mémoire.

Dans cette configuration, l'écart calculé est bien d'environ 42 % sur le CPU moyen et 62 % sur la mémoire moyenne. C'est une mesure du lab. Elle ne dit pas que « OpenTelemetry est 62 % plus léger ». Data Prepper exécutait une JVM, trois parsers JSON, un buffer borné et des sinks OpenSearch. Le collector OTel utilisait un autre runtime, un autre format, une autre stratégie de queue et a effectivement traité un volume différent. Il a aussi envoyé moins de documents au bout.

Le résultat utile est plus modeste : cette architecture OTLP mérite d'être poursuivie parce qu'elle a montré une empreinte processeur plus basse et un transport beaucoup plus compact. Elle n'a pas encore gagné le droit d'être recommandée pour la production.

## Ce que racontent les identifiants absents

La branche ViaQ contient 2 909 999 identifiants uniques dans Kafka et exactement le même nombre dans l'index Data Prepper. Un identifiant manque par rapport au plan. Ce même identifiant manque aussi dans Kafka OTLP, ce qui signale au minimum qu'un défaut peut exister avant la bifurcation logique ou dans le générateur.

Dans la fenêtre Kafka OTLP archivée, 2 821 179 identifiants uniques apparaissent. L'écart avec le plan est de 88 821. Ce nombre est presque entièrement concentré dans une seule plage : 88 807 séquences consécutives pendant le plateau à 1 000 EPS. Une ligne source fait environ 715 octets avant l'enveloppe CRI ; la plage représente donc au moins une soixantaine de mégaoctets. Le message OTLP qui franchit la discontinuité contient des identifiants d'avant et d'après.

La rotation ou la rétention des logs CRI, combinée à un receiver `filelog` en retard, devient une hypothèse sérieuse. L'upstream documente la gestion des fichiers tournés, leur fingerprint et les métriques `otelcol_fileconsumer_open_files` et `reading_files`.[8] Mon dataset n'a capturé ni les fichiers tournés, ni la configuration effective du kubelet/CRI-O, ni ces métriques. Je peux montrer la forme du trou ; je ne peux pas nommer son auteur.

Ensuite, les 2 768 029 identifiants de l'index OTel forment un sous-ensemble exact des identifiants Kafka archivés. Il reste 53 150 identifiants présents dans Kafka et absents de l'export d'index. Pendant la même fenêtre, la sending queue de l'exporter OpenSearch atteint 4 050 items sur une capacité de 4 096. Le compteur `otelcol_exporter_enqueue_failed_log_records` augmente de 53 812, avec des sauts temporellement alignés sur les principales plages absentes de l'index.

Là, le mécanisme est documenté : avec `block_on_overflow: false`, une queue pleine rejette immédiatement ce qu'elle ne peut pas accepter ; ces rejets alimentent les métriques `enqueue_failed` et n'atteignent pas la logique de retry de l'exporter.[7] La corrélation est forte. Le compteur couvre cependant tous les logs, pas seulement les identifiants Aqua, et les scrapes de 15 secondes ne partagent pas exactement les bornes de l'archive. Cela explique pourquoi j'écris « cohérent avec une saturation de queue », pas « cause prouvée des 53 150 ».

OpenSearch ne rapporte aucun rejet du thread pool d'écriture dans les séries archivées. Sa queue d'écriture monte à 3. Le goulet visible se situe donc avant, dans le client OTel, mais une requête d'export qui sous-compte certains documents reste possible. L'export utilisait une recherche wildcard sur quelques champs, puis extrayait les strings portant le préfixe du run. Sans requête exhaustive par ID et sans compteur de succès par cohorte, je laisse cette limite ouverte.

## Le drain Kafka n'était pas une preuve de livraison

Le script figeait les offsets Kafka de fin juste après l'émetteur, puis attendait que les consumer groups atteignent ces offsets. Treize minutes plus tard, le drain était marqué complet. Seulement, un producteur OTel peut encore avoir des lots en mémoire ou dans sa queue au moment où les offsets sont capturés. Les offsets des consumers dépassaient d'ailleurs plusieurs offsets cibles dans le manifest final.

Le prochain protocole doit fermer les étages dans l'ordre : arrêter l'émetteur, attendre le flush et la stabilité des offsets producteurs, capturer la borne Kafka, drainer les consumers jusqu'à cette borne, attendre la stabilité du comptage OpenSearch après refresh, puis seulement exporter. Un lag Kafka nul signifie que le consumer a avancé. Avec une queue d'export asynchrone, il ne signifie pas que le document existe dans OpenSearch. Le receiver Kafka documente précisément les options d'autocommit et de `message_marking` ; il faut les relier à un acquittement aval observable.[6]

## La décision que je prendrais aujourd'hui

Je garderais OpenShift Logging et `ClusterLogForwarder` comme référence opérationnelle pour les logs de plateforme tant que le replay n'est pas propre. La branche ViaQ a fourni, dans ce run, une cohorte presque complète jusqu'à OpenSearch et s'appuie sur le chemin Red Hat attendu pour OpenShift.

Je continuerais en parallèle le chantier OTel. L'Operator Red Hat, le receiver `filelog` et Kafka donnent une base crédible pour converger logs, métriques et traces autour d'un modèle commun. Le batching observé est intéressant. L'empreinte du consumer aussi. Avant de parler de standard, je changerais la preuve : queue persistante ou backpressure explicite, métriques fileconsumer, capture des rotations CRI, logs internes du collector, bornes de fenêtre après flush, et replay du même archive Kafka vers chaque processor.

Le repo public devrait contenir un simulateur simple. On entre EPS, taille moyenne d'une ligne, durée, taille et timeout de batch, compression, partitions et rétention. Il calcule logs par heure, messages Kafka, débit non compressé, stockage journalier et enveloppe de partitions. Chaque sortie projetée reste séparée des mesures du lab. Puis le runner produit une table de réconciliation par étage : attendu, écrit dans le fichier CRI, accepté par le collector, archivé dans Kafka, accepté par le consumer, confirmé par l'exporter, visible dans OpenSearch.

La prochaine fois que le graphe CPU aura l'air trop propre, cette table sera affichée juste à côté. Si les comptes ne ferment pas, la courbe reste une piste d'optimisation, pas une décision d'architecture.

## Notes et sources

1. Red Hat OpenShift Logging, `ClusterLogForwarder` et sortie Kafka : https://docs.redhat.com/en/documentation/red_hat_openshift_logging/6.0/html/configuring_logging/configuring-log-forwarding
2. Red Hat build of OpenTelemetry 3.10, release 0.152.0 et support : https://docs.redhat.com/en/documentation/red_hat_build_of_opentelemetry/3.10/html/release_notes_for_the_red_hat_build_of_opentelemetry/otel_rn
3. Red Hat build of OpenTelemetry, receiver `filelog` : https://docs.redhat.com/en/documentation/red_hat_build_of_opentelemetry/3.10/html/configuring_the_collector/otel-collector-receivers_otel-configuration-of-otel-intro
4. Red Hat build of OpenTelemetry, exporter Kafka : https://docs.redhat.com/en/documentation/red_hat_build_of_opentelemetry/3.10/html/configuring_the_collector/otel-collector-exporters
5. OpenTelemetry batch processor : https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md
6. OpenTelemetry Kafka receiver : https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md
7. OpenTelemetry exporter helper, sending queue : https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md
8. OpenTelemetry filelog receiver, rotation et offsets : https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md
9. OpenTelemetry OpenSearch exporter : https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/opensearchexporter/README.md
10. OpenSearch Data Prepper, source Kafka : https://docs.opensearch.org/latest/data-prepper/pipelines/configuration/sources/kafka/
11. OpenSearch Data Prepper, acknowledgments de pipeline : https://docs.opensearch.org/latest/data-prepper/pipelines/pipelines/
12. OpenSearch Data Prepper, sink OpenSearch, retries et DLQ : https://docs.opensearch.org/latest/data-prepper/pipelines/configuration/sinks/opensearch/
