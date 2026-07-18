import type { Locale } from "./site";

export type ServiceId = "diagnostic" | "otel_sprint" | "fractional_lead";

export type ServiceProof = {
  company: string;
  metric: string;
  body: string;
};

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServiceCopy = {
  path: string;
  alternatePath: string;
  eyebrow: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  durationLabel: string;
  duration: string;
  priceLabel: string;
  price: string;
  symptomsTitle: string;
  symptoms: string[];
  outcomeTitle: string;
  outcome: string;
  results: string[];
  deliverablesTitle: string;
  deliverables: Array<{ title: string; body: string }>;
  methodTitle: string;
  method: Array<{ step: string; title: string; body: string }>;
  proofTitle: string;
  proofs: ServiceProof[];
  agenticTitle: string;
  agenticBody: string;
  agenticItems: string[];
  agenticLimit: string;
  engagementTitle: string;
  engagementBody: string;
  faqTitle: string;
  faq: ServiceFaq[];
  ctaTitle: string;
  ctaBody: string;
  ctaLabel: string;
  emailSubject: string;
  emailBody: string;
};

export type ServiceDefinition = {
  id: ServiceId;
  copy: Record<Locale, ServiceCopy>;
};

const diagnostic: ServiceDefinition = {
  id: "diagnostic",
  copy: {
    fr: {
      path: "/audit-observabilite/",
      alternatePath: "/en/observability-audit/",
      eyebrow: "Diagnostic Observabilité",
      title: "Audit observabilité en 5 jours | Amine Amanzou",
      description:
        "Un diagnostic observabilité en cinq jours pour cartographier les angles morts, le bruit, les coûts et prioriser un plan d'action 30/60/90 jours.",
      h1: "Savoir où l’observabilité casse avant de remplacer la stack.",
      intro:
        "Quand les alertes s’empilent, que les coûts montent et que les incidents restent difficiles à expliquer, changer d’outil ajoute souvent une migration au problème. En cinq jours, je construis un état des lieux exploitable par les équipes techniques et les décideurs.",
      durationLabel: "Durée",
      duration: "5 jours",
      priceLabel: "Budget",
      price: "À partir de 4 500 € HT",
      symptomsTitle: "Les signaux qui justifient un diagnostic",
      symptoms: [
        "Les alertes sollicitent l’astreinte sans accélérer le diagnostic.",
        "Les équipes ne savent pas relier la facture de télémétrie à la couverture obtenue.",
        "Chaque produit instrumente à sa façon et les angles morts apparaissent pendant l’incident.",
        "Un renouvellement de contrat ou une migration arrive sans critères techniques partagés.",
      ],
      outcomeTitle: "Une décision documentée, pas un inventaire de dashboards",
      outcome:
        "La restitution montre où le signal se perd, ce qui coûte sans servir et quelles actions réduisent le risque en premier. Elle distingue les corrections immédiates des chantiers d’architecture et de gouvernance.",
      results: ["Priorités alignées", "Risques rendus visibles", "Budget relié aux usages"],
      deliverablesTitle: "Ce qui est livré au cinquième jour",
      deliverables: [
        { title: "Cartographie du signal", body: "Sources, parcours de télémétrie, consommateurs, dépendances et angles morts." },
        { title: "Analyse bruit, coûts et couverture", body: "Alertes, rétention, volumes, cardinalité et couverture des parcours critiques." },
        { title: "Score de maturité", body: "Lecture commune des pratiques, de l’instrumentation, de l’exploitation et de la gouvernance." },
        { title: "Risques prioritaires", body: "Risques qualifiés par impact, probabilité et capacité de détection." },
        { title: "Plan 30/60/90 jours", body: "Actions séquencées, dépendances, responsables pressentis et critères de sortie." },
        { title: "Double restitution", body: "Une session technique et une synthèse exécutive réutilisable en comité." },
      ],
      methodTitle: "Cinq jours, avec des points de contrôle courts",
      method: [
        { step: "J1", title: "Cadrer", body: "Objectifs, incidents récents, architecture, coûts et parcours critiques." },
        { step: "J2–3", title: "Observer", body: "Entretiens ciblés, lecture de la télémétrie, alertes, dashboards et chaîne d’exploitation." },
        { step: "J4", title: "Prioriser", body: "Scoring, risques et construction du plan avec les contraintes réelles de l’équipe." },
        { step: "J5", title: "Restituer", body: "Décisions, livrables, questions ouvertes et prochaines étapes." },
      ],
      proofTitle: "Une trajectoire commune pour plus de 400 projets",
      proofs: [
        {
          company: "Enedis",
          metric: "400+ projets · 7 solutions",
          body: "J’ai animé la gouvernance observabilité, piloté le benchmark technique de sept solutions et défini une architecture hybride pour Kubernetes, microservices et legacy.",
        },
      ],
      agenticTitle: "Le diagnostic couvre aussi les parcours agentiques du support.",
      agenticBody:
        "Je regarde ce qu’il est possible de retracer dans un ticket : contexte récupéré, appels de modèles et d’outils, réponse, coût, latence et erreurs. J’examine aussi les évaluations Langfuse ou LangSmith déjà en place, les tests en sandbox et les actions qui nécessitent encore une validation humaine.",
      agenticItems: ["Traces support", "Datasets d’évaluation", "Langfuse / LangSmith", "Sandbox", "Guardrails"],
      agenticLimit: "Le livrable précise ce que l’agent peut préparer, les données auxquelles il peut accéder et les checkpoints nécessaires avant toute action. L’objectif est de réduire le temps de qualification et de résolution sans masquer le chemin suivi.",
      engagementTitle: "Un périmètre fixé avant le démarrage",
      engagementBody:
        "Le tarif couvre cinq jours sur un périmètre convenu. Une organisation multi-entités, plusieurs stacks sans propriétaire commun ou des contraintes d’accès particulières font l’objet d’un chiffrage préalable.",
      faqTitle: "Questions fréquentes",
      faq: [
        { question: "Faut-il donner accès à toute la production ?", answer: "Non. Je définis avec vous les accès minimaux et je peux travailler à partir d’exports, de captures et de sessions accompagnées lorsque les contraintes de sécurité l’imposent." },
        { question: "Le diagnostic impose-t-il un changement d’outil ?", answer: "Non. La stack existante est évaluée au regard des usages et des risques. Une migration n’apparaît dans le plan que si les constats la justifient." },
        { question: "Qui doit participer ?", answer: "Un sponsor, un ou deux opérateurs de la plateforme et des représentants des équipes qui produisent ou utilisent la télémétrie suffisent généralement." },
        { question: "Peut-on poursuivre après les cinq jours ?", answer: "Oui. Le plan peut être exécuté par vos équipes, prolongé par un OpenTelemetry & Reliability Sprint ou suivi dans un rôle de Fractional Observability Lead." },
      ],
      ctaTitle: "Donnez-moi le contexte avant le premier échange.",
      ctaBody: "L’email prépare les cinq informations utiles : stack, douleur, volumes, contexte et disponibilité.",
      ctaLabel: "Demander un diagnostic",
      emailSubject: "Diagnostic observabilité — demande de cadrage",
      emailBody: "Bonjour Amine,\n\nContexte et système concerné :\n\nStack observabilité actuelle :\n\nDouleur principale / incident récent :\n\nOrdre de grandeur des volumes :\n\nDisponibilités pour un échange :\n",
    },
    en: {
      path: "/en/observability-audit/",
      alternatePath: "/audit-observabilite/",
      eyebrow: "Observability Audit",
      title: "Five-day observability audit | Amine Amanzou",
      description:
        "A five-day observability audit to map blind spots, alert noise and cost, then prioritize a practical 30/60/90-day action plan.",
      h1: "Know where observability fails before replacing the stack.",
      intro:
        "When alerts pile up, telemetry spend rises and incidents remain hard to explain, replacing the tool often adds a migration to the problem. In five days, I build an assessment that engineering teams and decision-makers can both use.",
      durationLabel: "Duration",
      duration: "5 days",
      priceLabel: "Budget",
      price: "From €4,500 excl. VAT",
      symptomsTitle: "Signals that call for an audit",
      symptoms: [
        "Alerts keep paging responders without shortening diagnosis.",
        "Teams cannot connect telemetry spend to the coverage they receive.",
        "Every product instruments differently and blind spots surface during incidents.",
        "A contract renewal or migration is approaching without shared technical criteria.",
      ],
      outcomeTitle: "A documented decision, not a dashboard inventory",
      outcome:
        "The readout shows where signal is lost, what costs money without helping operations and which actions reduce risk first. Immediate fixes are separated from architecture and governance work.",
      results: ["Aligned priorities", "Visible risks", "Spend tied to usage"],
      deliverablesTitle: "What you receive on day five",
      deliverables: [
        { title: "Signal map", body: "Sources, telemetry paths, consumers, dependencies and blind spots." },
        { title: "Noise, cost and coverage review", body: "Alerts, retention, volume, cardinality and critical-journey coverage." },
        { title: "Maturity score", body: "A shared view of practices, instrumentation, operations and governance." },
        { title: "Prioritized risks", body: "Risks qualified by impact, likelihood and detection capability." },
        { title: "30/60/90-day plan", body: "Sequenced actions, dependencies, likely owners and exit criteria." },
        { title: "Two readouts", body: "A technical session and an executive brief ready for steering meetings." },
      ],
      methodTitle: "Five days with short checkpoints",
      method: [
        { step: "D1", title: "Frame", body: "Objectives, recent incidents, architecture, spend and critical journeys." },
        { step: "D2–3", title: "Inspect", body: "Focused interviews plus telemetry, alert, dashboard and operating-chain review." },
        { step: "D4", title: "Prioritize", body: "Scoring, risks and a plan built around the team’s actual constraints." },
        { step: "D5", title: "Read out", body: "Decisions, deliverables, open questions and next steps." },
      ],
      proofTitle: "One observability path for more than 400 projects",
      proofs: [
        { company: "Enedis", metric: "400+ projects · 7 solutions", body: "I led observability governance, the technical benchmark of seven platforms and a hybrid target architecture spanning Kubernetes, microservices and legacy systems." },
      ],
      agenticTitle: "The audit also covers agentic support workflows.",
      agenticBody: "I review what can be reconstructed from a ticket: retrieved context, model and tool calls, the answer, cost, latency and errors. I also inspect existing Langfuse or LangSmith evaluations, sandbox tests and the actions that still require human approval.",
      agenticItems: ["Support traces", "Evaluation datasets", "Langfuse / LangSmith", "Sandbox", "Guardrails"],
      agenticLimit: "The deliverable states what the agent may prepare, which data it may access and which checkpoints are required before action. The goal is shorter qualification and resolution time without hiding the path taken.",
      engagementTitle: "A scope agreed before work starts",
      engagementBody: "The fee covers five days within an agreed scope. Multi-entity organizations, unrelated stacks or unusual access constraints are estimated separately before kickoff.",
      faqTitle: "Frequently asked questions",
      faq: [
        { question: "Do you need full production access?", answer: "No. We define minimum access together. I can work from exports, screenshots and guided sessions when security constraints require it." },
        { question: "Does the audit assume a tool replacement?", answer: "No. The existing stack is assessed against operational use and risk. A migration only enters the plan when the evidence supports it." },
        { question: "Who needs to take part?", answer: "A sponsor, one or two platform operators and representatives of teams that produce or consume telemetry are usually enough." },
        { question: "Can you stay after the five days?", answer: "Yes. Your teams can execute the plan, or I can continue through an OpenTelemetry & Reliability Sprint or as a Fractional Observability Lead." },
      ],
      ctaTitle: "Send the operating context before our first call.",
      ctaBody: "The email prompts for the five useful inputs: stack, pain, volume, context and availability.",
      ctaLabel: "Request an audit",
      emailSubject: "Observability audit — scoping request",
      emailBody: "Hi Amine,\n\nContext and system in scope:\n\nCurrent observability stack:\n\nMain pain / recent incident:\n\nApproximate telemetry volume:\n\nAvailability for a call:\n",
    },
  },
};

const otelSprint: ServiceDefinition = {
  id: "otel_sprint",
  copy: {
    fr: {
      path: "/consultant-opentelemetry/",
      alternatePath: "/en/opentelemetry-consulting/",
      eyebrow: "OpenTelemetry & Reliability Sprint",
      title: "Consultant OpenTelemetry | Sprint production et fiabilité",
      description: "Un sprint de deux à six semaines pour industrialiser OpenTelemetry : architecture Collector, instrumentation, sampling, sécurité, SLO et transfert de compétence.",
      h1: "Faire passer OpenTelemetry du POC au chemin critique.",
      intro: "Le premier signal arrive vite. Les difficultés commencent ensuite : conventions divergentes, Collector fragile, volumes imprévisibles, secrets, sampling et coexistence avec la stack en place. Le sprint traite ces points sur un périmètre qui doit tenir en production.",
      durationLabel: "Durée", duration: "2 à 6 semaines", priceLabel: "Budget", price: "Sur devis",
      symptomsTitle: "Quand le POC ne suffit plus",
      symptoms: ["Le Collector fonctionne en test, mais son comportement en panne reste inconnu.", "Les équipes instrumentent sans conventions ni critères de qualité partagés.", "La migration doit coexister avec Dynatrace, Datadog, Splunk ou une autre stack.", "Sampling, cardinalité et rétention sont décidés après réception de la facture."],
      outcomeTitle: "Un chemin de télémétrie exploitable et transmissible",
      outcome: "Le sprint laisse une architecture déployée, des choix de fiabilité explicites et une documentation que l’équipe peut reprendre. Les compromis de coût, de couverture et de sécurité sont testés sur les flux réels du périmètre.",
      results: ["Pipeline éprouvé", "Conventions partagées", "Équipe autonome sur l’exploitation"],
      deliverablesTitle: "Le périmètre du sprint",
      deliverables: [
        { title: "Architecture Collector / Alloy", body: "Topologie agent, gateway ou hybride, capacité, haute disponibilité et comportement dégradé." },
        { title: "Instrumentation et conventions", body: "Bibliothèques, auto-instrumentation, attributs métier et règles de qualité." },
        { title: "Migration et coexistence", body: "Trajectoire sans trou de visibilité avec Dynatrace, Datadog, Splunk ou la stack existante." },
        { title: "Pipelines et maîtrise des volumes", body: "Processors, queues, retries, sampling, cardinalité, sécurité et coût." },
        { title: "Fiabilité opérationnelle", body: "SLO de pipeline, alerting, dashboards d’exploitation et runbooks." },
        { title: "Déploiement et transfert", body: "Configuration versionnée, déploiement progressif, documentation et sessions avec l’équipe." },
      ],
      methodTitle: "Un sprint construit autour d’un flux réel",
      method: [
        { step: "01", title: "Choisir le chemin critique", body: "Un service, un parcours ou une pipeline dont la réussite peut être mesurée." },
        { step: "02", title: "Concevoir et tester", body: "Architecture, conventions, charge, panne backend, perte réseau et données sensibles." },
        { step: "03", title: "Déployer progressivement", body: "Canary, comparaison avec l’existant, checkpoints et rollback documenté." },
        { step: "04", title: "Transmettre", body: "Runbooks, décisions d’architecture et sessions pratiques avec les opérateurs." },
      ],
      proofTitle: "Des migrations et des signaux reliés au métier",
      proofs: [
        { company: "Odigo", metric: "–40 % d’incidents clients", body: "Migration Dynatrace SaaS menée en cinq mois, collecteurs spécifiques et détection proactive pour les équipes support." },
        { company: "Ylio", metric: "–30 % d’abandons", body: "Métriques métier OpenTelemetry sur le tunnel de vente pour localiser les points de friction." },
        { company: "Enedis", metric: "Architecture hybride", body: "Architecture cible pour des environnements Kubernetes, microservices et legacy à l’échelle de centaines de projets." },
      ],
      agenticTitle: "Tracer l’agent ne suffit pas si personne n’évalue le résultat.",
      agenticBody: "Le sprint relie les spans des modèles, des outils et du support à des critères de qualité. Les traces utiles peuvent alimenter des datasets Langfuse ou LangSmith, puis des évaluations offline avant déploiement et des contrôles échantillonnés en production.",
      agenticItems: ["Spans modèles et outils", "Datasets support", "Évaluations offline / online", "Sandbox", "Guardrails et rollback"],
      agenticLimit: "Les outils et les données accessibles restent bornés. Une action sensible passe par un checkpoint humain. L’agent peut préparer le diagnostic et la prochaine étape pour accélérer le support sans obtenir des droits plus larges que nécessaire.",
      engagementTitle: "Deux à six semaines selon le chemin choisi",
      engagementBody: "Le devis dépend du nombre de services, des environnements, de la coexistence attendue et du niveau de transfert. Le cadrage fixe un résultat mesurable avant de fixer la durée.",
      faqTitle: "Questions fréquentes",
      faq: [
        { question: "Travaillez-vous uniquement avec le Collector OpenTelemetry ?", answer: "Non. Je travaille aussi avec Grafana Alloy et les distributions ou backends déjà en place lorsque leur maintien est cohérent avec la trajectoire." },
        { question: "Peut-on migrer progressivement depuis Dynatrace ou Datadog ?", answer: "Oui. La coexistence, la comparaison de couverture et la possibilité de rollback font partie du plan de migration." },
        { question: "Le sprint inclut-il les SLO et l’alerting ?", answer: "Oui, pour le périmètre retenu : SLO du service et de la pipeline de télémétrie, alertes exploitables et runbooks associés." },
        { question: "Que reste-t-il après le sprint ?", answer: "Une configuration versionnée, des décisions d’architecture, des tests, des runbooks et une équipe formée sur leur exploitation." },
      ],
      ctaTitle: "Choisissons le flux qui doit tenir en production.",
      ctaBody: "Décrivez le POC, la stack de destination, le chemin critique et la date qui contraint la mise en production.",
      ctaLabel: "Discuter du sprint OTel",
      emailSubject: "OpenTelemetry & Reliability Sprint — cadrage",
      emailBody: "Bonjour Amine,\n\nPOC ou système concerné :\n\nStack actuelle et destination :\n\nChemin critique à sécuriser :\n\nContraintes de calendrier :\n\nDisponibilités pour un échange :\n",
    },
    en: {
      path: "/en/opentelemetry-consulting/", alternatePath: "/consultant-opentelemetry/", eyebrow: "OpenTelemetry & Reliability Sprint",
      title: "OpenTelemetry consultant | Production reliability sprint", description: "A two-to-six-week OpenTelemetry sprint covering Collector architecture, instrumentation, sampling, security, SLOs and team handover.",
      h1: "Move OpenTelemetry from proof of concept to the critical path.",
      intro: "Getting the first signal is usually quick. The harder work follows: divergent conventions, a fragile Collector, unpredictable volume, secrets, sampling and coexistence with the existing stack. The sprint resolves these issues on a scope that must hold up in production.",
      durationLabel: "Duration", duration: "2 to 6 weeks", priceLabel: "Budget", price: "On request",
      symptomsTitle: "When the proof of concept is no longer enough",
      symptoms: ["The Collector works in a test environment, but its failure modes are unknown.", "Teams instrument services without shared conventions or quality criteria.", "The migration must coexist with Dynatrace, Datadog, Splunk or another platform.", "Sampling, cardinality and retention are discussed after the bill arrives."],
      outcomeTitle: "A telemetry path the team can operate and own", outcome: "The sprint leaves a deployed architecture, explicit reliability decisions and documentation the team can take over. Cost, coverage and security trade-offs are tested on real flows within the scope.",
      results: ["Tested pipeline", "Shared conventions", "Operational handover"],
      deliverablesTitle: "Sprint scope",
      deliverables: [
        { title: "Collector / Alloy architecture", body: "Agent, gateway or hybrid topology, capacity, high availability and degraded behavior." },
        { title: "Instrumentation and conventions", body: "Libraries, auto-instrumentation, business attributes and quality rules." },
        { title: "Migration and coexistence", body: "A no-blind-spot path alongside Dynatrace, Datadog, Splunk or the existing stack." },
        { title: "Pipelines and volume control", body: "Processors, queues, retries, sampling, cardinality, security and cost." },
        { title: "Operational reliability", body: "Pipeline SLOs, alerts, operating dashboards and runbooks." },
        { title: "Deployment and handover", body: "Versioned configuration, progressive rollout, documentation and team sessions." },
      ],
      methodTitle: "A sprint anchored in one real flow",
      method: [
        { step: "01", title: "Choose the critical path", body: "One service, journey or pipeline with a measurable outcome." },
        { step: "02", title: "Design and test", body: "Architecture, conventions, load, backend outage, network loss and sensitive data." },
        { step: "03", title: "Roll out progressively", body: "Canary, comparison with the existing stack, checkpoints and documented rollback." },
        { step: "04", title: "Hand over", body: "Runbooks, architecture decisions and practical sessions with operators." },
      ],
      proofTitle: "Migrations and signals tied to business outcomes",
      proofs: [
        { company: "Odigo", metric: "40% fewer customer incidents", body: "Five-month Dynatrace SaaS migration, purpose-built collectors and proactive detection for support teams." },
        { company: "Ylio", metric: "30% fewer drop-offs", body: "OpenTelemetry business metrics across the sales funnel to locate friction." },
        { company: "Enedis", metric: "Hybrid architecture", body: "Target architecture across Kubernetes, microservices and legacy environments at a multi-project scale." },
      ],
      agenticTitle: "Tracing the agent is not enough if nobody evaluates the outcome.",
      agenticBody: "The sprint connects model, tool and support spans to quality criteria. Useful traces can feed Langfuse or LangSmith datasets, offline evaluations before deployment and sampled checks in production.",
      agenticItems: ["Model and tool spans", "Support datasets", "Offline / online evaluation", "Sandbox", "Guardrails and rollback"],
      agenticLimit: "Accessible tools and data remain bounded. Sensitive actions require a human checkpoint. The agent can prepare the diagnosis and next step to speed up support without receiving broader permissions than necessary.",
      engagementTitle: "Two to six weeks, based on the selected path", engagementBody: "The estimate depends on service count, environments, coexistence requirements and handover depth. We agree on a measurable outcome before setting the duration.",
      faqTitle: "Frequently asked questions",
      faq: [
        { question: "Do you only work with the OpenTelemetry Collector?", answer: "No. I also work with Grafana Alloy and existing distributions or backends when retaining them supports the target path." },
        { question: "Can we migrate gradually from Dynatrace or Datadog?", answer: "Yes. Coexistence, coverage comparison and rollback are part of the migration plan." },
        { question: "Does the sprint include SLOs and alerting?", answer: "Yes, within the selected scope: service and telemetry-pipeline SLOs, actionable alerts and supporting runbooks." },
        { question: "What remains after the sprint?", answer: "Versioned configuration, architecture decisions, tests, runbooks and a team trained to operate them." },
      ],
      ctaTitle: "Choose the flow that must hold up in production.", ctaBody: "Describe the proof of concept, target stack, critical path and delivery constraint.", ctaLabel: "Discuss the OTel sprint",
      emailSubject: "OpenTelemetry & Reliability Sprint — scoping", emailBody: "Hi Amine,\n\nProof of concept or system in scope:\n\nCurrent and target stack:\n\nCritical path to secure:\n\nDelivery constraints:\n\nAvailability for a call:\n",
    },
  },
};

const fractionalLead: ServiceDefinition = {
  id: "fractional_lead",
  copy: {
    fr: {
      path: "/fractional-observability-lead/", alternatePath: "/en/fractional-observability-lead/", eyebrow: "Fractional Observability Lead",
      title: "Fractional Observability Lead | Amine Amanzou", description: "Un responsable observabilité à temps partagé, deux à huit jours par mois, pour tenir la roadmap, la gouvernance, les coûts, la fiabilité et les usages agentiques.",
      h1: "Une trajectoire observabilité ne tient pas toute seule.",
      intro: "Sans propriétaire, les standards se fragmentent, les revues passent après les incidents et les décisions vendors arrivent sans mémoire technique. J’assure la continuité de la trajectoire deux à huit jours par mois, au côté des équipes qui la construisent.",
      durationLabel: "Cadence", duration: "2 à 8 jours / mois", priceLabel: "Engagement", price: "3 mois minimum · sur devis",
      symptomsTitle: "Quand il manque un propriétaire à la trajectoire",
      symptoms: ["La roadmap existe, mais personne n’arbitre les dépendances entre plateforme et produits.", "Les standards changent selon les équipes et les mêmes débats recommencent à chaque projet.", "Les coûts, incidents et choix vendors sont suivis dans des instances séparées.", "Les automatisations agentiques arrivent avant les règles de contrôle et de traçabilité."],
      outcomeTitle: "Des décisions suivies d’un trimestre à l’autre", outcome: "Je maintiens la roadmap, les décisions d’architecture et les règles d’exploitation dans le temps. L’objectif est que les équipes puissent avancer avec des critères communs, des arbitrages tracés et une lecture régulière des risques.",
      results: ["Roadmap tenue", "Standards gouvernés", "Arbitrages tracés"],
      deliverablesTitle: "Le rôle, à temps partagé",
      deliverables: [
        { title: "Roadmap trimestrielle", body: "Priorités, dépendances, capacités, critères de sortie et risques." },
        { title: "Gouvernance de la télémétrie", body: "Standards, conventions, ownership et processus de changement." },
        { title: "Revues régulières", body: "Architecture, coût, fiabilité, capacité et dette opérationnelle." },
        { title: "Incident reviews", body: "Décisions issues des incidents, suivi des actions et mesure de leur effet." },
        { title: "Accompagnement des équipes", body: "Design reviews, office hours, transfert de pratiques et aide aux arbitrages." },
        { title: "Vendors et usages agentiques", body: "Relation technique avec les fournisseurs, évaluations et contrôle des automatisations." },
      ],
      methodTitle: "Une cadence légère, des décisions persistantes",
      method: [
        { step: "01", title: "Installer la vue commune", body: "Roadmap, risques, coûts, standards, incidents et décisions en cours." },
        { step: "02", title: "Tenir les revues", body: "Rituels courts avec les propriétaires techniques et les sponsors utiles." },
        { step: "03", title: "Arbitrer", body: "Options documentées, compromis explicites et décision assignée." },
        { step: "04", title: "Mesurer", body: "Suivi mensuel des actions, SLO, coûts et signaux d’adoption." },
      ],
      proofTitle: "De la gouvernance multi-projets aux migrations critiques",
      proofs: [
        { company: "Enedis", metric: "400+ projets", body: "Ateliers, règles d’exploitation et trajectoire commune pour des équipes SRE, Dev et Ops." },
        { company: "Orange", metric: "30 M de comptes", body: "Lead SRE data et performance pendant une migration mail critique vers OpenStack." },
      ],
      agenticTitle: "Les usages agentiques ont besoin d’un cadre d’exploitation.",
      agenticBody: "Je maintiens les conventions de traces, les datasets et les évaluations Langfuse ou LangSmith avec les mêmes revues que le reste de la plateforme. Les incidents du support enrichissent les cas de test, et les changements de modèle, de prompt ou d’outil sont comparés avant extension du périmètre.",
      agenticItems: ["Observabilité des parcours", "Évaluations récurrentes", "Sandbox", "Droits minimaux", "Revue du temps de résolution"],
      agenticLimit: "La roadmap distingue suggestion, préparation et action. Chaque niveau garde ses droits, ses guardrails, ses checkpoints et ses critères de rollback. Le suivi porte aussi sur le temps réellement gagné par les équipes support.",
      engagementTitle: "Un engagement de trois mois minimum", engagementBody: "La cadence de deux à huit jours par mois dépend du nombre d’équipes, des instances à tenir et de la maturité de la plateforme. Le premier mois installe la vue commune et les décisions à reprendre.",
      faqTitle: "Questions fréquentes",
      faq: [
        { question: "Ce rôle remplace-t-il un responsable interne ?", answer: "Il peut couvrir une période de transition ou compléter un responsable plateforme. L’ownership interne reste explicite et le transfert fait partie du mandat." },
        { question: "Pourquoi un minimum de trois mois ?", answer: "Un cycle trimestriel permet d’installer la gouvernance, de suivre les décisions et de mesurer si les premières actions produisent l’effet attendu." },
        { question: "Pouvez-vous travailler avec plusieurs vendors ?", answer: "Oui. Je porte les critères techniques et opérationnels, prépare les arbitrages et garde la décision reliée aux usages plutôt qu’aux démonstrations commerciales." },
        { question: "Comment sont encadrés les agents SRE ?", answer: "Par niveaux d’autonomie, droits minimaux, traces, évaluations, checkpoints, critères de rollback et validation humaine aux points sensibles." },
      ],
      ctaTitle: "Reprenons la roadmap et les décisions qui attendent.", ctaBody: "Partagez le nombre d’équipes, la cadence envisagée, les échéances et les arbitrages observabilité en cours.", ctaLabel: "Discuter du rôle fractional",
      emailSubject: "Fractional Observability Lead — échange", emailBody: "Bonjour Amine,\n\nContexte et nombre d’équipes :\n\nRoadmap / échéances en cours :\n\nDécisions ou risques à reprendre :\n\nCadence envisagée :\n\nDisponibilités pour un échange :\n",
    },
    en: {
      path: "/en/fractional-observability-lead/", alternatePath: "/fractional-observability-lead/", eyebrow: "Fractional Observability Lead",
      title: "Fractional Observability Lead | Amine Amanzou", description: "A fractional observability lead, two to eight days per month, to own roadmap, governance, cost, reliability and agentic-system controls.",
      h1: "An observability roadmap needs an owner.",
      intro: "Without an owner, standards fragment, reviews happen after incidents and vendor decisions lose their technical history. I maintain continuity two to eight days per month, alongside the teams building the platform.",
      durationLabel: "Cadence", duration: "2 to 8 days / month", priceLabel: "Engagement", price: "3-month minimum · on request",
      symptomsTitle: "When the roadmap lacks an owner",
      symptoms: ["The roadmap exists, but nobody resolves dependencies between platform and product teams.", "Standards vary across teams and the same debates restart on every project.", "Cost, incidents and vendor choices are reviewed in separate forums.", "Agentic automation arrives before control and traceability rules."],
      outcomeTitle: "Decisions that survive the next quarter", outcome: "I maintain the roadmap, architecture decisions and operating rules over time. Teams move with shared criteria, traceable trade-offs and a regular view of risk.",
      results: ["Owned roadmap", "Governed standards", "Traceable trade-offs"],
      deliverablesTitle: "The fractional role",
      deliverables: [
        { title: "Quarterly roadmap", body: "Priorities, dependencies, capacity, exit criteria and risk." },
        { title: "Telemetry governance", body: "Standards, conventions, ownership and change process." },
        { title: "Recurring reviews", body: "Architecture, cost, reliability, capacity and operational debt." },
        { title: "Incident reviews", body: "Incident decisions, action tracking and measurement of their effect." },
        { title: "Team support", body: "Design reviews, office hours, practice transfer and decision support." },
        { title: "Vendors and agentic use", body: "Technical vendor relationship, evaluations and automation controls." },
      ],
      methodTitle: "A light cadence with durable decisions",
      method: [
        { step: "01", title: "Establish the shared view", body: "Roadmap, risk, cost, standards, incidents and open decisions." },
        { step: "02", title: "Run the reviews", body: "Short routines with the relevant technical owners and sponsors." },
        { step: "03", title: "Resolve trade-offs", body: "Documented options, explicit constraints and an assigned decision." },
        { step: "04", title: "Measure", body: "Monthly review of actions, SLOs, cost and adoption signals." },
      ],
      proofTitle: "From multi-project governance to critical migrations",
      proofs: [
        { company: "Enedis", metric: "400+ projects", body: "Workshops, operating rules and a shared observability path across SRE, development and operations teams." },
        { company: "Orange", metric: "30M accounts", body: "Lead SRE for data and performance during a critical mail migration to OpenStack." },
      ],
      agenticTitle: "Agentic systems need an operating model.",
      agenticBody: "I maintain tracing conventions, datasets and Langfuse or LangSmith evaluations through the same reviews as the rest of the platform. Support incidents become test cases, and model, prompt or tool changes are compared before the scope expands.",
      agenticItems: ["Workflow observability", "Recurring evaluations", "Sandbox", "Least privilege", "Resolution-time review"],
      agenticLimit: "The roadmap separates suggestion, preparation and action. Each level keeps its own permissions, guardrails, checkpoints and rollback criteria. Reviews also track the time actually saved for support teams.",
      engagementTitle: "A minimum three-month engagement", engagementBody: "The two-to-eight-day monthly cadence depends on team count, review forums and platform maturity. The first month establishes the shared view and recovers open decisions.",
      faqTitle: "Frequently asked questions",
      faq: [
        { question: "Does this replace an internal lead?", answer: "It can cover a transition or complement a platform lead. Internal ownership remains explicit and handover is part of the mandate." },
        { question: "Why a three-month minimum?", answer: "One quarterly cycle is enough to establish governance, follow decisions and check whether the first actions have the expected effect." },
        { question: "Can you work across multiple vendors?", answer: "Yes. I carry the technical and operational criteria, prepare trade-offs and keep decisions tied to use rather than sales demos." },
        { question: "How do you govern SRE agents?", answer: "Through autonomy levels, least privilege, traces, evaluations, checkpoints, rollback criteria and human approval at sensitive points." },
      ],
      ctaTitle: "Bring the roadmap and the decisions still waiting.", ctaBody: "Share the team count, expected cadence, deadlines and current observability trade-offs.", ctaLabel: "Discuss a fractional role",
      emailSubject: "Fractional Observability Lead — discussion", emailBody: "Hi Amine,\n\nContext and number of teams:\n\nCurrent roadmap / deadlines:\n\nDecisions or risks to pick up:\n\nExpected cadence:\n\nAvailability for a call:\n",
    },
  },
};

export const services = [diagnostic, otelSprint, fractionalLead] as const;

export function getService(id: ServiceId): ServiceDefinition {
  const service = services.find((item) => item.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
}

export const serviceCtaId: Record<ServiceId, "start_observability_diagnostic" | "discuss_otel_sprint" | "discuss_fractional_lead"> = {
  diagnostic: "start_observability_diagnostic",
  otel_sprint: "discuss_otel_sprint",
  fractional_lead: "discuss_fractional_lead",
};

export function serviceMailto(service: ServiceDefinition, locale: Locale): string {
  const copy = service.copy[locale];
  const params = new URLSearchParams({ subject: copy.emailSubject, body: copy.emailBody });
  return `mailto:amineamanzou@gmail.com?${params.toString()}`;
}
