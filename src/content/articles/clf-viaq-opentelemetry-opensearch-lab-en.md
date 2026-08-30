---
title: "ViaQ or OpenTelemetry on OpenShift: what my HyperShift lab actually measured"
locale: "en"
articleSlug: "clf-viaq-opentelemetry-opensearch-lab"
translationKey: "clf-viaq-opentelemetry-opensearch-lab"
publishedAt: "2026-09-01"
label: "OpenShift / OpenTelemetry"
readTime: "11 min"
excerpt: "I compared two OpenShift log paths through Kafka to OpenSearch. CPU, memory and batching differences are measured; the OTel counting discrepancy remains unexplained."
heroImage: "/blog/clf-viaq-opentelemetry-opensearch-lab/hero-lab-topology.svg"
heroImageAlt: "Two OpenShift log pipelines compare ViaQ and OpenTelemetry between CRI files, Kafka and OpenSearch"
pillar: "opentelemetry"
intent: "comparative"
primaryQuery: "ViaQ OpenTelemetry OpenShift Kafka OpenSearch"
relatedOffer: "otel_sprint"
seoTitle: "ViaQ vs OpenTelemetry on OpenShift: lab measurements"
seoDescription: "A measured comparison of ClusterLogForwarder ViaQ and OpenTelemetry through Kafka to OpenSearch, covering batching, CPU, memory, limits and counting."
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
The CPU chart looked exactly like the kind of result people enjoy presenting in an architecture review. One line stayed low, the other ran clearly higher, both processors used identical VMs, and the headline was easy to remember: in my lab, the OpenTelemetry consumer used about 42% less mean CPU and 62% less mean memory than Data Prepper.

I could have stopped there, drawn three arrows between OpenShift, Kafka and OpenSearch, and credited OTLP batching. That slide would probably survive until somebody asked how many logs had reached the end.

The workload expected 2,910,000 deterministic synthetic identifiers. I found 2,768,029 in the exported OpenSearch index for the OTel branch: a 4.8787% counting discrepancy. The wording matters. That discrepancy is unexplained. This experiment does not justify calling it “OpenTelemetry data loss,” and it does not establish a cause.

That inconvenient number is what makes the experiment useful. The CPU chart describes the cost of the path that worked. The missing identifiers show where my method stopped supporting a conclusion.

## Two concurrent paths reading the same workloads

The lab ran OpenShift 4.22 with a HyperShift hosted cluster on Azure. The hosted control plane lived as pods on the management cluster. Workers, Kafka and OpenSearch ran on the hosted side. Two independent collectors then read CRI logs from the same workloads.

The first path used OpenShift Logging 6.6. A `ClusterLogForwarder` configured Vector to select application, infrastructure and audit logs, enrich them in ViaQ form and send them to three Kafka topics. An Azure VM ran Data Prepper: Kafka source, ViaQ JSON parsing, normalization, then OpenSearch bulk writes into three indexes. Red Hat documents this `ClusterLogForwarder` model and its Kafka output.[1]

The second path used the Red Hat build of OpenTelemetry Operator. `OpenTelemetryCollector` resources running as DaemonSets tailed files through the `filelog` receiver, added Kubernetes attributes, batched `LogRecord` values and exported OTLP JSON into three separate Kafka topics. A second `Standard_D4as_v5` VM consumed those topics with an upstream contrib collector and wrote to three OpenSearch indexes.

The support boundary is easy to blur. The run did use Red Hat Operator 0.152.0-2 and Red Hat Collector images inside OpenShift. Red Hat documents the `filelog` receiver, the Kafka exporter and the collector deployment modes; Red Hat build 3.10 is based on upstream 0.152.0.[2][3][4] The external consumer, however, used `otel/opentelemetry-collector-contrib`. Its upstream OpenSearch exporter is marked alpha for logs.[9] The complete OTLP-to-OpenSearch path was not a single Red Hat-supported product path.

## A workload designed to be countable

I did not have Aqua Enterprise images or a proprietary event schema, so the generator emitted explicitly synthetic security events. Each JSON line carried a run prefix and a continuous sequence. The security payload gave the logs realistic shape; the sequence made every stage auditable.

The two-hour plan ran for 20 minutes at 50 events per second, 30 at 250, 30 at 500, 20 at 1,000, and 20 more at 250. That yields 2,910,000 expected identifiers. A secondary loop created ordinary Kubernetes activity across the other log classes. It ended on a management API TLS timeout, while the primary deterministic generator completed its schedule.

I archived exact Kafka offset ranges, OpenSearch exports, Prometheus matrices, component versions, configuration hashes and checksums. All checksums still verify. The run also recorded 1,763 valid guardrail observations, but “valid” has a narrow meaning here: the live guardrail mostly checked that scrape targets and metric families existed. It did not prove that every stage remained below saturation.

There is another reproducibility wrinkle. The manifest records a Git commit, but the run used 31 modified configuration files from a dirty worktree. Their hashes were archived and still match the files, so the run remains auditable. Checking out the commit alone will not recreate it. Apparently a reliability lab also audits the operator’s Git habits.

## Batching materially changed Kafka traffic

The archived ViaQ audit stream contained 3,719,910 Kafka messages with one logical log per message. The OTLP audit stream contained 9,169 messages carrying 3,004,802 log records. Mean batch size was 327.71 records, p50 was 500, p95 was 683 and the largest message carried 773 records.

That is roughly 406 times fewer Kafka messages in the captured OTLP stream. The OTel batch processor groups records by size or time: `send_batch_size` triggers a send while `send_batch_max_size` caps the batch.[5] These producers used a trigger of 512 records, a maximum of 1,024 and a two-second timeout.

The 406x ratio needs a visible qualification. The two audit archives do not contain the same number of logical logs: 3.720 million on the ViaQ side and 3.005 million on the OTLP side. The ratio describes the shape of the captured streams. It is not a controlled same-input compression factor. Isolating batching requires replaying one immutable corpus with OTLP batching enabled, then with one record per message, while keeping everything else unchanged.

## The resource result belongs to the complete pipelines

Across 481 samples at 15-second resolution, the OTel VM averaged 2.259% host CPU, with a 4.257% p95, and 0.846 GiB of memory. Data Prepper averaged 3.900% CPU, with a 7.321% p95, and 2.220 GiB of memory.

The calculated differences are about 42% for mean CPU and 62% for mean memory in this run. They do not establish that OpenTelemetry is universally 62% lighter. Data Prepper ran a JVM, several JSON parsers, a bounded buffer and OpenSearch sinks. The OTel consumer used another runtime, another encoding and another queue strategy. The two branches processed different effective volumes, and the OTel branch produced fewer documents downstream.

The bounded conclusion is still useful: this OTLP architecture deserves another round because it showed a smaller processor footprint and much denser Kafka packing. It had not yet earned a production recommendation.

## The shape of the counting discrepancies

Kafka ViaQ contained 2,909,999 unique synthetic identifiers, and the Data Prepper index contained the same set. One expected identifier was absent. That identifier was also absent from Kafka OTLP, so at least one anomaly cannot be attributed specifically to the OTel branch.

The archived Kafka OTLP window contained 2,821,179 unique identifiers, 88,821 below the plan. Almost the entire difference sits in one contiguous range: 88,807 sequences during the 1,000 EPS phase. A source line is about 715 bytes before the CRI envelope, so that interval represents at least sixty megabytes. The OTLP message that crosses the discontinuity contains identifiers from both sides of the gap.

CRI log rotation or retention combined with a lagging `filelog` receiver is therefore a serious hypothesis. Upstream documentation explains rotated-file tracking, fingerprints and the `otelcol_fileconsumer_open_files` and `reading_files` metrics.[8] My dataset did not capture rotated CRI files, the effective kubelet/CRI-O rotation policy, those receiver metrics, or detailed collector logs. I can locate the discontinuity; I cannot assign responsibility.

The OTel OpenSearch export contained 2,768,029 identifiers, all of them present in the archived Kafka set. That leaves 53,150 Kafka identifiers not found in the index export. During the same window, the OpenSearch exporter sending queue reached 4,050 items out of 4,096. `otelcol_exporter_enqueue_failed_log_records` increased by 53,812, with increments aligned in time with the main Kafka-to-index gaps.

The documented mechanism fits the observation. With `block_on_overflow: false`, a full OTel sending queue rejects new data immediately; those rejections increment `enqueue_failed` and do not reach exporter retry logic.[7] The correlation is strong. The metric covers all log records, not just the synthetic cohort, and its 15-second scrape boundaries do not exactly match the archive. The defensible statement is “consistent with queue saturation,” not “proven cause of the 53,150 identifiers.”

OpenSearch itself recorded no write-thread-pool rejection in the archived series, and its write queue peaked at three. The visible pressure was on the OTel client side. A query/export undercount remains possible, though: the export searched a limited set of fields with a wildcard, then extracted strings carrying the run prefix. Without an exhaustive ID query and cohort-specific success counters, that boundary stays open.

## A drained Kafka group did not prove delivery

The benchmark captured Kafka end offsets immediately after the emitter completed, then waited for consumer groups to reach those fixed offsets. The drain was marked complete thirteen minutes later. An OTel producer may still hold batches in memory or in its sending queue when those offsets are recorded. In the final manifest, several consumer offsets had already advanced beyond the stored targets.

The next protocol must close stages in order: stop the emitter, wait for producer flush and stable topic offsets, capture the Kafka boundary, drain consumers to that boundary, wait for a stable OpenSearch count after refresh, then export. Zero Kafka lag proves that a consumer advanced. With an asynchronous exporter queue, it does not prove that the document is visible in OpenSearch. The Kafka receiver’s autocommit and `message_marking` options need to be connected to an observable downstream acknowledgement.[6]

## The decision I would make now

I would keep OpenShift Logging and `ClusterLogForwarder` as the operational reference for platform logs until a clean replay closes the counts. In this run, the ViaQ branch preserved an almost complete synthetic cohort through OpenSearch and followed the expected Red Hat path for OpenShift log forwarding.

I would continue the OTel work in parallel. The Red Hat Operator, `filelog` receiver and Kafka exporter form a credible base for converging logs, metrics and traces around a common model. The observed batching and processor footprint are worth pursuing. Before calling it a standard, I would add a persistent queue or explicit backpressure, fileconsumer metrics, CRI rotation evidence, internal collector logs, post-flush measurement boundaries and identical-corpus replays.

The public repository should also ship a small sizing simulator. Inputs would include EPS, mean line size, duration, batch size and timeout, compression, partitions and retention. Outputs would include logs per hour, Kafka messages, uncompressed throughput, daily storage and a partition envelope. Every projected result would remain separate from measured values.

Most importantly, every run would produce a stage reconciliation table: expected, written to the CRI file, accepted by the collector, archived in Kafka, accepted by the consumer, confirmed by the exporter and visible in OpenSearch.

Next time the CPU chart looks this clean, that table will sit beside it. If the counts do not close, the chart remains an optimization lead, not an architecture decision.

## Sources

1. Red Hat OpenShift Logging, `ClusterLogForwarder` and Kafka output: https://docs.redhat.com/en/documentation/red_hat_openshift_logging/6.0/html/configuring_logging/configuring-log-forwarding
2. Red Hat build of OpenTelemetry 3.10 release notes: https://docs.redhat.com/en/documentation/red_hat_build_of_opentelemetry/3.10/html/release_notes_for_the_red_hat_build_of_opentelemetry/otel_rn
3. Red Hat build of OpenTelemetry, `filelog` receiver: https://docs.redhat.com/en/documentation/red_hat_build_of_opentelemetry/3.10/html/configuring_the_collector/otel-collector-receivers_otel-configuration-of-otel-intro
4. Red Hat build of OpenTelemetry, Kafka exporter: https://docs.redhat.com/en/documentation/red_hat_build_of_opentelemetry/3.10/html/configuring_the_collector/otel-collector-exporters
5. OpenTelemetry batch processor: https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md
6. OpenTelemetry Kafka receiver: https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md
7. OpenTelemetry exporter helper and sending queue: https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md
8. OpenTelemetry filelog receiver: https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md
9. OpenTelemetry OpenSearch exporter: https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/opensearchexporter/README.md
10. Data Prepper Kafka source: https://docs.opensearch.org/latest/data-prepper/pipelines/configuration/sources/kafka/
11. Data Prepper pipeline acknowledgements: https://docs.opensearch.org/latest/data-prepper/pipelines/pipelines/
12. Data Prepper OpenSearch sink, retries and DLQ: https://docs.opensearch.org/latest/data-prepper/pipelines/configuration/sinks/opensearch/
