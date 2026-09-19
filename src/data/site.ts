export type NavItem = {
  label: string;
  href: string;
};

export type Locale = "fr" | "en";

export type Download = {
  label: string;
  href: string;
  meta: string;
};

export type Metric = {
  label: string;
  value: string;
  countTo: number;
  prefix?: string;
  suffix?: string;
  detail: string;
};

export type Expertise = {
  title: string;
  body: string;
  items: string[];
};

export type Experience = {
  role: string;
  company: string;
  period: string;
  summary: string;
  environment: string;
  highlights: Array<{
    title: string;
    body: string;
  }>;
};

export type SkillGroup = {
  name: string;
  keywords: string;
};

export type Language = {
  name: string;
  level: string;
};

export type Education = {
  title: string;
  period: string;
  issuer: string;
  body?: string;
  icon: string;
  href?: string;
};

export const profile = {
  name: "Amine Amanzou",
  role: "Consultant Observabilité · SRE · Agentic SRE",
  roleEn: "Observability Consultant · SRE · Agentic SRE",
  location: "Lyon, France",
  email: "amineamanzou@gmail.com",
  portrait: "/images/amine-amanzou-profile-960.webp",
  brandMark: {
    light: "/images/brand/amine-amanzou-mark-light.png",
    dark: "/images/brand/amine-amanzou-mark-dark.png",
  },
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/amineamanzou/" },
    { label: "GitHub", href: "https://github.com/amineamanzou" },
    { label: "X / Twitter", href: "https://twitter.com/amineamanzou" },
    { label: "Portfolio photo", href: "https://www.aminespired.fr" },
  ],
};

export const downloads: Record<Locale, Download> = {
  fr: {
    label: "Télécharger le CV en français",
    href: "/downloads/AmineAmanzouCVFR092026.pdf",
    meta: "PDF · français",
  },
  en: {
    label: "Download the English resume",
    href: "/downloads/AmineAmanzouCVEN092026.pdf",
    meta: "PDF · English",
  },
};

export const resumeDownloads: Record<Locale, Download[]> = {
  fr: [
    downloads.fr,
    { label: "Télécharger le CV en anglais", href: downloads.en.href, meta: "PDF · English" },
  ],
  en: [
    downloads.en,
    { label: "Download the French resume", href: downloads.fr.href, meta: "PDF · français" },
  ],
};

export const navigation: Record<Locale, NavItem[]> = {
  fr: [
    { label: "Accueil", href: "/" },
    { label: "Offres", href: "/#offres" },
    { label: "Dossier", href: "/dossier/" },
    { label: "Blog", href: "/blog/" },
    { label: "Contact", href: "/contact/" },
  ],
  en: [
    { label: "Home", href: "/en/" },
    { label: "Services", href: "/en/#services" },
    { label: "Profile", href: "/en/dossier/" },
    { label: "Blog", href: "/en/blog/" },
    { label: "Contact", href: "/en/contact/" },
  ],
};

export const languageSwitch: Record<Locale, { label: string; flag: string; aria: string }> = {
  fr: { label: "EN", flag: "🇬🇧", aria: "Switch to English" },
  en: { label: "FR", flag: "🇫🇷", aria: "Passer en français" },
};

export const home = {
  meta: {
    title: "Amine Amanzou | Consultant Observabilité, SRE & Agentic SRE",
    description:
      "Consultant Observabilité & Agentic SRE : stratégie d’observabilité, pipelines OpenTelemetry et investigation d’incidents, de la télémétrie au diagnostic.",
  },
  hero: {
    title: "Réduire le bruit, le MTTR et le coût de l’observabilité.",
    body:
      "Je rends vos systèmes critiques observables, fiables et décidables pour réduire les incidents, sécuriser les déploiements et piloter la production avec le bon signal.",
    proofLine:
      "Expérience production, grands comptes, cloud hybride, OpenTelemetry, Dynatrace, SRE et industrialisation DevOps.",
  },
  metrics: [
    {
      label: "Enedis",
      value: "15M€",
      countTo: 15,
      prefix: "",
      suffix: "M€",
      detail: "Sécurisation technique d'un marché stratégique et migration OpenTelemetry en environnement hybride.",
    },
    {
      label: "Odigo",
      value: "-40%",
      countTo: -40,
      prefix: "",
      suffix: "%",
      detail: "Réduction du volume d'incidents clients en 6 mois grâce à la détection proactive.",
    },
    {
      label: "KeyIA · Banque",
      value: "2 axes",
      countTo: 2,
      prefix: "",
      suffix: " axes",
      detail: "Pipeline OpenTelemetry sur OpenShift et agent SRE Python pour l'investigation VMware.",
    },
    {
      label: "Orange",
      value: "30M",
      countTo: 30,
      prefix: "",
      suffix: "M",
      detail: "Comptes mail accompagnés pendant une migration critique vers OpenStack.",
    },
  ] satisfies Metric[],
  expertise: [
    {
      title: "Observabilité",
      body:
        "Concevoir le signal utile avant d'ajouter des dashboards: traces, métriques, logs, KPIs métier et règles d'exploitation.",
      items: ["Dynatrace", "OpenTelemetry", "Prometheus", "Grafana", "ELK", "Datadog"],
    },
    {
      title: "SRE & production",
      body:
        "Réduire MTTD, MTTR et charge incident en reliant pratiques d'équipe, automatisation et fiabilité mesurable.",
      items: ["Incident response", "Operating rules", "Astreinte", "SLO thinking"],
    },
    {
      title: "Cloud & IaC",
      body:
        "Industrialiser les plateformes avec une approche reproductible et sécurisée, du cloud public au legacy.",
      items: ["Kubernetes", "Docker", "Terraform", "Ansible", "GCP", "OpenStack"],
    },
  ] satisfies Expertise[],
};

export const localized = {
  fr: {
    meta: home.meta,
    role: profile.role,
    brandSubtitle: "SRE · Observabilité",
    hero: {
      title: "Réduire le bruit, le MTTR et le coût de l’observabilité.",
      body:
        "J’interviens quand les alertes s’empilent, que le diagnostic ralentit et que la facture de télémétrie n’explique plus la couverture obtenue.",
      proofLine:
        "KeyIA, Enedis, Orange et Odigo : Agentic SRE, migrations critiques, OpenTelemetry et fiabilité en production.",
      primaryCta: "Réserver un échange de cadrage",
      secondaryCta: "Voir les missions",
    },
    proof: {
      title: "Des systèmes critiques, des résultats mesurables.",
      body:
        "Les preuves viennent de contextes réels: banque, énergie, télécom, SaaS, plateformes cloud et production critique.",
    },
    observability: {
      title: "Le signal doit aider l’équipe qui prend l’incident.",
      body:
        "Instrumentation, exploitation et décisions d’architecture restent liées. Les outils viennent après le parcours critique, le risque et l’usage attendu du signal.",
    },
    workPreview: {
      title: "Missions récentes",
      body: "Un aperçu des interventions; le dossier détaille responsabilités, contexte et résultats.",
      cta: "Lire le dossier complet",
    },
    blogPreview: {
      title: "Écrire pour clarifier la production.",
      body:
        "Des retours terrain sur l’observabilité, le Fleet Management, OpAMP et les pratiques SRE qui tiennent en production.",
      cta: "Lire les articles",
    },
    downloadBand: {
      title: "Dossier de compétence freelance",
      body:
        "Un seul PDF pour qualifier rapidement le positionnement, les missions, l'impact et le socle technique.",
    },
    dossier: {
      title: "Dossier de compétence | Amine Amanzou",
      description:
      "Dossier de compétence d’Amine Amanzou : stratégie d’observabilité, pipelines OpenTelemetry et investigation d’incidents par agents SRE.",
      heading: "De la télémétrie au diagnostic.",
      subtitle: "Stratégie d’observabilité, pipelines OpenTelemetry et investigation d’incidents par agents SRE.",
      intro:
        "J’accompagne les équipes sur toute la chaîne d’observabilité : instrumentation et déploiement de la collecte, acheminement des logs, métriques et traces, choix des plateformes et exploitation des données pour le diagnostic. Mon approche associe stratégie, architecture et mise en œuvre avec les équipes internes. Pour l’Agentic SRE, elle intègre l’évaluation des approches de développement interne, des solutions du marché et de leur complémentarité.",
      domainsTitle: "Trois domaines d’intervention",
      domainsBody: "Intervenir sur une couche précise en tenant compte de ses conséquences sur toute la chaîne.",
      domains: [
        { title: "Instrumentation et pipelines", body: "Adapter la collecte et son déploiement aux environnements, organiser le traitement et l’acheminement des logs, métriques et traces jusqu’aux backends." },
        { title: "Stratégie et plateformes d’observabilité", body: "Évaluer les solutions, définir la cible et la trajectoire de migration, accompagner l’adoption avec les équipes." },
        { title: "Agentic SRE et investigation", body: "Développer ou intégrer les capacités d’investigation, connecter les outils et évaluer les diagnostics avec les équipes." },
      ],
      experienceTitle: "Missions et expériences",
      experienceBody:
        "Les missions mettent en avant impact, responsabilité et contexte technique.",
      skillsTitle: "Compétences et langues",
      skillsBody:
        "Le socle technique reprend exactement les domaines mis en avant dans le CV actuel.",
      educationTitle: "Formation et certifications",
      educationBody:
        "Socle académique MIAGE, pratique infrastructure et formation continue observabilité/cloud.",
    },
    contact: {
      title: "Contact | Amine Amanzou",
      description:
        "Contacter Amine Amanzou pour une mission freelance SRE, observabilité, cloud ou DevOps.",
      heading: "Parlons fiabilité, observabilité et production.",
      body:
        "Pour une mission freelance, une qualification technique ou un échange autour d'un sujet SRE, le plus simple est de m'écrire directement.",
      hint: "Adresse email cliquable",
    },
    blog: {
      title: "Blog | Amine Amanzou",
      description:
        "Articles d'Amine Amanzou sur l'observabilité, OpAMP, le fleet management et les pratiques SRE.",
      kicker: "Blog",
      heading: "Observabilité, SRE et Fleet Management.",
      body:
        "J’y documente ce que je teste, ce que j’observe sur le terrain et ce qui reste à vérifier : observabilité, OpenTelemetry, Fleet Management, fiabilité et Agentic SRE.",
      listLabel: "Liste des articles",
      backLabel: "Retour aux articles",
      sourceLabel: "Source LinkedIn",
      sourceText:
        "Commentaires, réactions et discussion restent ouverts sur le post LinkedIn d'origine.",
      sourceCta: "Réagir sur LinkedIn",
    },
  },
  en: {
    meta: {
      title: "Amine Amanzou | Observability Consultant, SRE & Agentic SRE",
      description:
        "Observability & Agentic SRE consultant: observability strategy, OpenTelemetry pipelines and incident investigation, from telemetry to diagnosis.",
    },
    role: profile.roleEn,
    brandSubtitle: "SRE · Observability",
    hero: {
      title: "Reduce alert noise, MTTR and observability cost.",
      body:
        "I step in when alerts pile up, diagnosis slows down and telemetry spend no longer explains the coverage teams receive.",
      proofLine:
        "KeyIA, Enedis, Orange and Odigo: Agentic SRE, critical migrations, OpenTelemetry and production reliability.",
      primaryCta: "Book a scoping call",
      secondaryCta: "View missions",
    },
    proof: {
      title: "Critical systems, measurable outcomes.",
      body:
        "Proof points come from real production contexts: banking, energy, telecom, SaaS, cloud platforms and critical operations.",
    },
    observability: {
      title: "The signal has to help the team holding the incident.",
      body:
        "Instrumentation, operations and architecture decisions stay connected. Tools follow the critical journey, the risk and the expected use of each signal.",
    },
    workPreview: {
      title: "Recent missions",
      body: "A quick overview; the profile details responsibilities, context and outcomes.",
      cta: "Read the full profile",
    },
    blogPreview: {
      title: "Writing to clarify production.",
      body:
        "Field notes on observability, Fleet Management, OpAMP and SRE practices that hold up in production.",
      cta: "Read the articles",
    },
    downloadBand: {
      title: "Freelance capability statement",
      body:
        "One PDF to quickly qualify positioning, missions, impact and technical foundations.",
    },
    dossier: {
      title: "Capability Statement | Amine Amanzou",
      description:
        "Amine Amanzou’s capability statement: observability strategy, OpenTelemetry pipelines and incident investigation with SRE agents.",
      heading: "From telemetry to diagnosis.",
      subtitle: "Observability strategy, OpenTelemetry pipelines and incident investigation with SRE agents.",
      intro:
        "I help teams across the observability chain: instrumentation and telemetry collection deployment, routing logs, metrics and traces, selecting platforms and using data for diagnosis. My approach combines strategy, architecture and hands-on delivery with internal teams. For Agentic SRE, it includes evaluating in-house development, market solutions and how they can work together.",
      domainsTitle: "Three areas of engagement",
      domainsBody: "Work on a specific layer while accounting for its impact across the full chain.",
      domains: [
        { title: "Instrumentation and pipelines", body: "Adapt telemetry collection and deployment to each environment, and organize processing and routing of logs, metrics and traces to the backends." },
        { title: "Observability strategy and platforms", body: "Evaluate solutions, define the target architecture and migration roadmap, and support adoption with the teams." },
        { title: "Agentic SRE and investigation", body: "Develop or integrate investigation capabilities, connect tools and evaluate diagnoses with the teams." },
      ],
      experienceTitle: "Missions and experience",
      experienceBody:
        "Missions are framed around impact, responsibility and technical context.",
      skillsTitle: "Skills and languages",
      skillsBody:
        "The technical foundation mirrors the domains highlighted in the current resume.",
      educationTitle: "Training and certifications",
      educationBody:
        "MIAGE academic background, infrastructure practice and continuous observability/cloud training.",
    },
    contact: {
      title: "Contact | Amine Amanzou",
      description:
        "Contact Amine Amanzou for a freelance SRE, observability, cloud or DevOps mission.",
      heading: "Let's talk reliability, observability and production.",
      body:
        "For a freelance mission, technical qualification or conversation around SRE topics, the simplest path is to email me directly.",
      hint: "Clickable email address",
    },
    blog: {
      title: "Blog | Amine Amanzou",
      description:
        "Articles by Amine Amanzou about observability, OpAMP, fleet management and SRE practices.",
      kicker: "Blog",
      heading: "Observability, SRE and Fleet Management.",
      body:
        "I use this space to document what I test, what I observe in the field and what still needs validation: observability, OpenTelemetry, Fleet Management, reliability and Agentic SRE.",
      listLabel: "Article list",
      backLabel: "Back to articles",
      sourceLabel: "LinkedIn source",
      sourceText:
        "Comments, reactions and discussion remain open on the original LinkedIn post.",
      sourceCta: "React on LinkedIn",
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const alternatePath = (path: string, locale: Locale) => {
  const normalized = path.endsWith("/") ? path : `${path}/`;
  const map: Record<string, string> = {
    "/": "/en/",
    "/dossier/": "/en/dossier/",
    "/blog/": "/en/blog/",
    "/contact/": "/en/contact/",
    "/audit-observabilite/": "/en/observability-audit/",
    "/consultant-opentelemetry/": "/en/opentelemetry-consulting/",
    "/fractional-observability-lead/": "/en/fractional-observability-lead/",
    "/en/": "/",
    "/en/dossier/": "/dossier/",
    "/en/blog/": "/blog/",
    "/en/contact/": "/contact/",
    "/en/observability-audit/": "/audit-observabilite/",
    "/en/opentelemetry-consulting/": "/consultant-opentelemetry/",
    "/en/fractional-observability-lead/": "/fractional-observability-lead/",
  };

  return map[normalized] ?? (locale === "fr" ? "/en/" : "/");
};

export const experiences: Experience[] = [
  {
    role: "Consultant Observabilité & Agentic SRE",
    company: "KeyIA",
    period: "Mai 2026 - Aujourd'hui",
    summary:
      "Architecture de pipelines OpenTelemetry et développement d’un agent SRE d’investigation pour une banque de financement et d’investissement.",
    highlights: [
      {
        title: "Architecture OpenTelemetry",
        body:
          "Architecture d’un pipeline d’ingestion OpenTelemetry sur OpenShift/HyperShift : formalisation de la cible, pilotage des arbitrages sur les agents et opérateurs ; routage des logs via Kafka, gestion des traces et des métriques.",
      },
      {
        title: "Agent SRE Python / LangChain",
        body:
          "Développement d’un agent SRE en Python avec LangChain pour l’investigation de bout en bout, de la VM et son OS à la virtualisation VMware (ESXi, vCenter), au réseau et au stockage.",
      },
      {
        title: "Diagnostic et remédiation",
        body:
          "Corrélation du contexte d’infrastructure, des logs Elasticsearch et des métriques Dynatrace pour évaluer la confiance du diagnostic et proposer des remédiations ciblées.",
      },
      {
        title: "Évaluation et intégration MCP",
        body:
          "Évaluation de l’agent avec les équipes du SI : définition de scénarios de test, validation des capacités d’investigation et recommandations d’évolution des services MCP VMware.",
      },
      {
        title: "Log as a Service",
        body:
          "Log as a Service : automatisation du déploiement de Fluent Bit en OTLP et de Data Prepper sur Kubernetes vers OpenSearch ; création d’un catalogue de parsing par profil technologique.",
      },
    ],
    environment:
      "Environnement : Python, LangChain, MCP, VMware, OpenTelemetry, OpenShift, Kafka, Elasticsearch, Dynatrace, OpenSearch.",
  },
  {
    role: "Expert Observabilité",
    company: "ENEDIS",
    period: "Mars 2024 - Déc 2025",
    summary:
      "Pilotage de l’évaluation technique et de la stratégie cible de la future plateforme d’observabilité d’ENEDIS, au service de plus de 400 projets.",
    highlights: [
      {
        title: "Évaluation et choix de plateforme",
        body:
          "Pilotage du volet technique d’un appel d’offres de 15 M€ : évaluation de sept plateformes selon les critères métier, architecture, exploitation, sécurité et coûts, pour éclairer le choix de la solution.",
      },
      {
        title: "Spécifications et SLO",
        body:
          "Traduction des besoins des équipes de développement et d’infrastructure en critères d’évaluation, spécifications techniques, SLO et exigences de plateforme.",
      },
      {
        title: "Preuve de concept hybride",
        body:
          "Architecture d’un PoC Kubernetes hybride cloud/on-premise pour valider la scalabilité, les performances, les pipelines de télémétrie et les solutions candidates.",
      },
      {
        title: "Maintien en condition opérationnelle",
        body:
          "Maintien en condition opérationnelle de Dynatrace Managed et Elastic (logs), en collaboration avec les équipes responsables des plateformes existantes.",
      },
      {
        title: "Architecture et trajectoire de migration",
        body:
          "Architecture du pipeline d’ingestion 100 % OpenTelemetry et planification de la migration vers Elasticsearch, solution retenue, en réutilisant au mieux l’existant.",
      },
      {
        title: "Maturité et conduite du changement",
        body:
          "Amorce de la conduite du changement avec une matrice de maturité de l’observabilité couvrant les 400 projets, pour structurer leur trajectoire d’adoption.",
      },
      {
        title: "Accompagnement OpenTelemetry",
        body:
          "Guides et formations OpenTelemetry pour accompagner l’adoption par les équipes SRE, développement et support.",
      },
    ],
    environment:
      "Environnement : OpenTelemetry, Dynatrace, Elasticsearch, AWS, OpenStack, Kafka, Kubernetes, GitLab.",
  },
  {
    role: "Expert Observabilité",
    company: "Odigo",
    period: "Oct 2022 - Sept 2023",
    summary:
      "Contribution à la réduction de 40 % des incidents clients en 6 mois grâce à la détection proactive et à l’adoption de Dynatrace SaaS.",
    highlights: [
      {
        title: "Migration Dynatrace SaaS",
        body:
          "Pilotage d'une migration de cinq mois vers Dynatrace SaaS et mise en place d'un socle standardisé de supervision haute disponibilité.",
      },
      {
        title: "Fiabilité applicative",
        body:
          "Collaboration avec les équipes QA et intégration pour identifier les goulets d'étranglement inter-systèmes et améliorer la fiabilité applicative grâce à l'observabilité de bout en bout.",
      },
      {
        title: "Métriques personnalisées",
        body:
          "Développement de collecteurs Python conteneurisés et de pipelines Jenkins pour l'ingestion de métriques spécifiques.",
      },
      {
        title: "Automatisation Dynatrace",
        body:
          "Automatisation de la configuration et du déploiement des agents Dynatrace avec Ansible et un plugin d'inventaire dynamique, afin d'étendre la couverture et de simplifier l'onboarding ainsi que le diagnostic de premier niveau.",
      },
    ],
    environment: "Environnement : Dynatrace, Python, Ansible, Jenkins, Docker, AWS, GitLab.",
  },
  {
    role: "Ingénieur DevOps",
    company: "Orange",
    period: "2014 - 2021",
    summary:
      "Pilotage du domaine data et observabilité pendant la migration de 30 millions de comptes mail vers OpenStack.",
    highlights: [
      {
        title: "Exploitation et automatisation",
        body:
          "Administration et optimisation d'Elasticsearch, Kafka, Grafana et MySQL ; analyse de logs, résolution d'incidents et automatisation des opérations récurrentes avec Ansible.",
      },
    ],
    environment:
      "Environnement : Elasticsearch, Kafka, Grafana, MySQL, OpenStack, Python, Ansible, Terraform, RHEL.",
  },
];

export const experiencesEn: Experience[] = [
  {
    role: "Observability & Agentic SRE Consultant",
    company: "KeyIA",
    period: "May 2026 - Present",
    summary:
      "OpenTelemetry pipeline architecture and SRE investigation agent development for a corporate and investment bank.",
    highlights: [
      {
        title: "OpenTelemetry architecture",
        body:
          "Architected an OpenTelemetry ingestion pipeline on OpenShift/HyperShift: defined the target architecture and led alignment on agents and operators; routed logs through Kafka and managed traces and metrics.",
      },
      {
        title: "Python / LangChain SRE agent",
        body:
          "Developed a Python SRE agent with LangChain for end-to-end investigation, from VMs and guest operating systems to VMware virtualization (ESXi, vCenter), networking and storage.",
      },
      {
        title: "Diagnosis and remediation",
        body:
          "Correlated infrastructure context, Elasticsearch logs and Dynatrace metrics to assess diagnostic confidence and recommend targeted remediation.",
      },
      {
        title: "Evaluation and MCP integration",
        body:
          "Evaluated the agent with IT teams: defined test scenarios, validated investigation capabilities and recommended improvements to VMware MCP services.",
      },
      {
        title: "Log as a Service",
        body:
          "Log as a Service: automated Fluent Bit deployment with OTLP and Kubernetes deployment of Data Prepper for OpenSearch ingestion; created a parsing catalog organized by technology profile.",
      },
    ],
    environment:
      "Environment: Python, LangChain, MCP, VMware, OpenTelemetry, OpenShift, Kafka, Elasticsearch, Dynatrace, OpenSearch.",
  },
  {
    role: "Observability Expert",
    company: "ENEDIS",
    period: "Mar 2024 - Dec 2025",
    summary:
      "Led the technical evaluation and target strategy for ENEDIS’s future observability platform serving 400+ projects.",
    highlights: [
      {
        title: "Platform evaluation and selection",
        body:
          "Led the technical workstream of a €15M tender, evaluating seven observability platforms against business, architecture, operations, security and cost criteria to inform solution selection.",
      },
      {
        title: "Specifications and SLOs",
        body:
          "Translated the needs of development and infrastructure teams into evaluation criteria, technical specifications, SLOs and platform requirements.",
      },
      {
        title: "Hybrid proof of concept",
        body:
          "Architected a hybrid cloud/on-premises Kubernetes proof of concept to validate scalability, performance, telemetry pipelines and candidate solutions.",
      },
      {
        title: "Platform operations",
        body:
          "Maintained Dynatrace Managed and Elastic log platforms in operational condition, collaborating with the teams responsible for the existing platforms.",
      },
      {
        title: "Architecture and migration roadmap",
        body:
          "Architected a fully OpenTelemetry-based ingestion pipeline and planned migration to Elasticsearch, the selected solution, maximizing reuse of existing capabilities.",
      },
      {
        title: "Maturity and change management",
        body:
          "Initiated change management with an observability maturity matrix covering 400 projects to structure their adoption roadmap.",
      },
      {
        title: "OpenTelemetry enablement",
        body:
          "Created OpenTelemetry guides and training to support SRE, development and support teams in adopting the new observability foundation.",
      },
    ],
    environment:
      "Environment: OpenTelemetry, Dynatrace, Elasticsearch, AWS, OpenStack, Kafka, Kubernetes, GitLab.",
  },
  {
    role: "Observability Expert",
    company: "Odigo",
    period: "Oct 2022 - Sep 2023",
    summary:
      "Contributed to a 40% reduction in customer incidents over six months through proactive detection and adoption of Dynatrace SaaS.",
    highlights: [
      {
        title: "Dynatrace SaaS migration",
        body:
          "Led a five-month migration to Dynatrace SaaS and established a standardized high-availability monitoring foundation.",
      },
      {
        title: "Application reliability",
        body:
          "Worked with QA and integration teams to identify cross-system bottlenecks and improve application reliability through end-to-end observability.",
      },
      {
        title: "Custom metrics",
        body:
          "Developed containerized Python collectors and Jenkins pipelines for custom metrics ingestion.",
      },
      {
        title: "Dynatrace automation",
        body:
          "Automated Dynatrace agent configuration and deployment with Ansible and a dynamic inventory plugin, expanding monitoring coverage and simplifying onboarding and first-line incident diagnosis.",
      },
    ],
    environment: "Environment: Dynatrace, Python, Ansible, Jenkins, Docker, AWS, GitLab.",
  },
  {
    role: "DevOps Engineer",
    company: "Orange",
    period: "2014 - 2021",
    summary:
      "Led the data and observability domain during the migration of 30 million email accounts to OpenStack.",
    highlights: [
      {
        title: "Operations and automation",
        body:
          "Managed and optimized Elasticsearch, Kafka, Grafana and MySQL; performed log analysis and troubleshooting, and automated recurring operations with Ansible.",
      },
    ],
    environment:
      "Environment: Elasticsearch, Kafka, Grafana, MySQL, OpenStack, Python, Ansible, Terraform, RHEL.",
  },
];

export const education: Education[] = [
  {
    title: "ClickHouse Observability Professional",
    period: "2026",
    issuer: "ClickHouse",
    icon: "/images/certifications/clickhouse.svg",
    href: "https://credly.com/badges/f69b7ad4-4c1f-40db-9401-69f8b159fd89/public_url",
  },
  {
    title: "OTCA - OpenTelemetry Certified Associate Course",
    period: "2025",
    issuer: "Udemy",
    icon: "/images/certifications/informatique.svg",
  },
  {
    title: "Formation CKA - Certified Kubernetes Administrator",
    period: "2024",
    issuer: "KodeKloud",
    icon: "/images/certifications/kubernetes.svg",
    href: "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/",
  },
  {
    title: "MIAGE - Méthodes informatiques appliquées à la gestion des entreprises",
    period: "09.2013 - 10.2016",
    issuer: "Université Paris 1 Panthéon-Sorbonne · Licence, Master",
    icon: "/images/certifications/miage.svg",
  },
  {
    title: "DUT Informatique",
    period: "09.2011 - 08.2013",
    issuer: "Université Paris-Est Créteil",
    icon: "/images/certifications/informatique.svg",
  },
];

export const educationEn: Education[] = [
  {
    title: "ClickHouse Observability Professional",
    period: "2026",
    issuer: "ClickHouse",
    icon: "/images/certifications/clickhouse.svg",
    href: "https://credly.com/badges/f69b7ad4-4c1f-40db-9401-69f8b159fd89/public_url",
  },
  {
    title: "OTCA - OpenTelemetry Certified Associate Course",
    period: "2025",
    issuer: "Udemy",
    icon: "/images/certifications/informatique.svg",
  },
  {
    title: "CKA Certification Course - Certified Kubernetes Administrator",
    period: "2024",
    issuer: "KodeKloud",
    icon: "/images/certifications/kubernetes.svg",
    href: "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/",
  },
  {
    title: "MIAGE - Computer Science Methods Applied to Business Management",
    period: "09.2013 - 10.2016",
    issuer: "Paris 1 Panthéon-Sorbonne University · Bachelor, Master",
    icon: "/images/certifications/miage.svg",
  },
  {
    title: "Computer Science",
    period: "09.2011 - 08.2013",
    issuer: "Paris-Est Créteil University · DUT (University Technical Diploma)",
    icon: "/images/certifications/informatique.svg",
  },
];

export const skills: SkillGroup[] = [
  { name: "Observabilité", keywords: "OpenTelemetry, Dynatrace, Elasticsearch, Grafana, Kafka, Prometheus, Jaeger" },
  { name: "Agentic SRE", keywords: "Python, LangChain, MCP, Deep Agents, analyse de cause racine" },
  { name: "Plateformes", keywords: "Kubernetes, OpenShift, HyperShift, Docker, VMware vSphere" },
  { name: "Automatisation & IaC", keywords: "Ansible, Terraform, Bash, GitLab CI, GitHub Actions" },
  { name: "Cloud & infrastructure", keywords: "AWS, GCP, OpenStack, Linux, VMware" },
];

export const skillsEn: SkillGroup[] = [
  { name: "Observability", keywords: "OpenTelemetry, Dynatrace, Elasticsearch, Grafana, Kafka, Prometheus, Jaeger" },
  { name: "Agentic SRE", keywords: "Python, LangChain, MCP, Deep Agents, Root Cause Analysis" },
  { name: "Platforms", keywords: "Kubernetes, OpenShift, HyperShift, Docker, VMware vSphere" },
  { name: "Automation & IaC", keywords: "Ansible, Terraform, Bash, GitLab CI, GitHub Actions" },
  { name: "Cloud & Infrastructure", keywords: "AWS, GCP, OpenStack, Linux, VMware" },
];

export const languages: Language[] = [
  { name: "Français", level: "Langue maternelle" },
  { name: "Anglais", level: "Courant" },
];

export const languagesEn: Language[] = [
  { name: "English", level: "Fluent" },
  { name: "French", level: "Native language" },
];
