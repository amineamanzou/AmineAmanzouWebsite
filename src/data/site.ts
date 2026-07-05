export type NavItem = {
  label: string;
  href: string;
};

export type Metric = {
  label: string;
  value: string;
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
  highlights: Array<{
    title: string;
    body: string;
  }>;
};

export type Education = {
  title: string;
  period: string;
  issuer: string;
  body?: string;
};

export const profile = {
  name: "Amine Amanzou",
  role: "Site Reliability Engineer · Expert Observabilité",
  location: "Lyon, France",
  email: "amineamanzou@gmail.com",
  portrait: "/images/amine-amanzou-profile.jpeg",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/amineamanzou/" },
    { label: "GitHub", href: "https://github.com/amineamanzou" },
    { label: "X / Twitter", href: "https://twitter.com/amineamanzou" },
    { label: "Portfolio photo", href: "https://www.aminespired.fr" },
  ],
  downloads: [
    {
      label: "Dossier de compétence FR",
      href: "/downloads/amine-amanzou-dossier-competence-fr.pdf",
      meta: "PDF · français",
    },
    {
      label: "Resume EN",
      href: "/downloads/amine-amanzou-resume-en.pdf",
      meta: "PDF · English",
    },
  ],
};

export const navigation: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "CV", href: "/cv/" },
  { label: "Contact", href: "/contact/" },
];

export const home = {
  meta: {
    title: "Amine Amanzou | Site Reliability Engineer & Expert Observabilité",
    description:
      "Portfolio d'Amine Amanzou, Site Reliability Engineer spécialisé en observabilité, fiabilité, DevOps, cloud et plateformes de production.",
  },
  hero: {
    title: "Observabilité actionnable pour systèmes critiques.",
    body:
      "Je rends vos systèmes critiques observables, fiables et décidables pour réduire les incidents, sécuriser les déploiements et piloter la production avec le bon signal.",
    proofLine:
      "Expérience production, grands comptes, cloud hybride, OpenTelemetry, Dynatrace, SRE et industrialisation DevOps.",
  },
  metrics: [
    {
      label: "Enedis",
      value: "15M€",
      detail: "Sécurisation technique d'un marché stratégique et migration OpenTelemetry en environnement hybride.",
    },
    {
      label: "Odigo",
      value: "-40%",
      detail: "Réduction du volume d'incidents clients en 6 mois grâce à la détection proactive.",
    },
    {
      label: "Ylio",
      value: "-30%",
      detail: "Baisse des abandons de panier via une observabilité métier du tunnel de vente.",
    },
    {
      label: "Orange",
      value: "30M",
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

export const experiences: Experience[] = [
  {
    role: "Expert Observabilité",
    company: "Enedis",
    period: "Mars 2024 - Nov 2025",
    summary:
      "Référent observabilité pour aligner les équipes SRE, Dev et Ops autour d'une trajectoire commune.",
    highlights: [
      {
        title: "Conduite du changement & gouvernance",
        body:
          "Animation d'ateliers collaboratifs et définition de règles d'exploitation pour aligner plus de 400 projets.",
      },
      {
        title: "Benchmark stratégique",
        body:
          "Pilotage technique d'un RFP: environnements de test en IaC, benchmark de 7 solutions leaders, Chaos Engineering et AI Ops.",
      },
      {
        title: "Stratégie hybride",
        body:
          "Architecture cible pour superviser un paysage hétérogène mêlant Kubernetes, microservices et legacy.",
      },
    ],
  },
  {
    role: "Ingénieur Cloud DevOps",
    company: "Ylio",
    period: "Janv 2024 - Mars 2024",
    summary: "Industrialisation et sécurisation cloud GCP pour une plateforme e-commerce.",
    highlights: [
      {
        title: "Observabilité business",
        body:
          "Métriques métier OpenTelemetry pour monitorer le tunnel de vente et identifier les points de friction.",
      },
      {
        title: "Sécurité & architecture",
        body:
          "Isolation réseau, gestion centralisée des secrets avec HashiCorp Vault et automatisation SSL.",
      },
      {
        title: "Infrastructure as Code",
        body:
          "Infrastructure GCP scriptée avec Terraform, CI/CD GitHub Actions / Ansible et POC Kubernetes GKE.",
      },
    ],
  },
  {
    role: "Expert Observabilité - Dynatrace",
    company: "Odigo",
    period: "Oct 2022 - Sept 2023",
    summary:
      "Migration Dynatrace SaaS et industrialisation d'une observabilité proactive pour les équipes support et techniques.",
    highlights: [
      {
        title: "Impact business & fiabilité",
        body:
          "Baisse de 40% des incidents clients, amélioration MTTD/MTTR et désengorgement des équipes N1/N2.",
      },
      {
        title: "Architecture & migration",
        body:
          "Migration complète vers Dynatrace SaaS en 5 mois et collecteurs Python conteneurisés pour KPIs spécifiques.",
      },
      {
        title: "Configuration as Code",
        body:
          "Plugins d'inventaire dynamique, intégration CMDB et déploiement agent automatisé via Ansible/Jenkins.",
      },
    ],
  },
  {
    role: "Lead SRE Data & Performance",
    company: "Orange",
    period: "Déc 2018 - Mai 2021",
    summary:
      "Responsabilité technique sur le pôle data et observabilité pendant une migration critique de 30 millions de comptes mail.",
    highlights: [
      {
        title: "Contexte critique",
        body:
          "Observabilité de migration pour éviter les pertes de mail et réduire les temps d'intervention en incident.",
      },
      {
        title: "Lead technique data",
        body:
          "Pilotage Elasticsearch, Kafka et Grafana, coordination Ops et interface avec Build & Infra.",
      },
      {
        title: "Performance deep tech",
        body:
          "Diagnostic JVM, OpenStack, noisy neighbors, overcommitting et optimisation Kafka pour logs à très haut volume.",
      },
    ],
  },
  {
    role: "System Engineer & DevOps",
    company: "Orange",
    period: "Déc 2016 - Déc 2018",
    summary: "Exploitation critique des plateformes Mail Pro et introduction des pratiques DevOps.",
    highlights: [
      {
        title: "Gestion de crise",
        body:
          "KPIs réseau pour démontrer le sous-dimensionnement fournisseur et résoudre des incidents critiques.",
      },
      {
        title: "Architecture data",
        body:
          "MongoDB / GridFS pour transfert de fichiers lourds, procédures de purge et go-live d'un service à 100k clients.",
      },
      {
        title: "Transition DevOps",
        body:
          "Premiers pipelines Jenkins, automatisation des déploiements et exploitation Red Hat Linux, Apache, MySQL.",
      },
    ],
  },
];

export const education: Education[] = [
  {
    title: "ClickHouse Observability Professional Certification",
    period: "Décembre 2025",
    issuer: "ClickHouse",
  },
  {
    title: "Kubernetes Administration Course - CKA",
    period: "Janvier 2024",
    issuer: "Mumshad Mannambeth, KodeKloud",
  },
  {
    title: "HashiCorp Terraform Associate Course - 003",
    period: "Novembre 2023",
    issuer: "Andrew Brown, ExamPro",
  },
  {
    title: "AWS Cloud Practitioner Course CLF-C02",
    period: "Septembre 2023",
    issuer: "Stephane Maarek, Udemy",
  },
  {
    title: "Introduction au machine learning",
    period: "Juin 2021",
    issuer: "Camille Van Hofflen - Jungle Program",
    body:
      "Formation de 6 semaines sur la théorie, la manipulation de données et l'évaluation de modèles de machine learning.",
  },
  {
    title: "Master 2 - Système d'information et de connaissance",
    period: "2014 - 2016",
    issuer: "MIAGE Sorbonne - Université Paris 1 Panthéon-Sorbonne",
    body:
      "Alternance autour du développement, de l'architecture, de la conduite de projet SI et de la maîtrise d'ouvrage.",
  },
  {
    title: "Licence MIAGE Ingénierie des SI",
    period: "2013 - 2014",
    issuer: "MIAGE Sorbonne - Université Paris 1 Panthéon-Sorbonne",
  },
  {
    title: "DUT Informatique",
    period: "2011 - 2013",
    issuer: "IUT Fontainebleau, Université Paris-Est Créteil",
  },
  {
    title: "Baccalauréat STG",
    period: "2007 - 2011",
    issuer: "Comptabilité et finance des entreprises",
    body: "Mention Bien.",
  },
];
