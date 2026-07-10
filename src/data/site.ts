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
  icon: string;
  href?: string;
};

export const profile = {
  name: "Amine Amanzou",
  role: "Site Reliability Engineer · Expert Observabilité",
  roleEn: "Freelance Site Reliability Engineer · Observability Expert",
  location: "Lyon, France",
  email: "amineamanzou@gmail.com",
  portrait: "/images/amine-amanzou-profile-960.webp",
  brandMark: "/images/amine-amanzou-profile-front-96.webp",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/amineamanzou/" },
    { label: "GitHub", href: "https://github.com/amineamanzou" },
    { label: "X / Twitter", href: "https://twitter.com/amineamanzou" },
    { label: "Portfolio photo", href: "https://www.aminespired.fr" },
  ],
};

export const downloads: Record<Locale, Download> = {
  fr: {
    label: "Télécharger le dossier de compétence",
    href: "/downloads/amine-amanzou-dossier-competence-fr.pdf",
    meta: "PDF · français",
  },
  en: {
    label: "Download the capability statement",
    href: "/downloads/amine-amanzou-resume-en.pdf",
    meta: "PDF · English",
  },
};

export const navigation: Record<Locale, NavItem[]> = {
  fr: [
    { label: "Accueil", href: "/" },
    { label: "Dossier", href: "/dossier/" },
    { label: "Blog", href: "/blog/" },
    { label: "Contact", href: "/contact/" },
  ],
  en: [
    { label: "Home", href: "/en/" },
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
      label: "Ylio",
      value: "-30%",
      countTo: -30,
      prefix: "",
      suffix: "%",
      detail: "Baisse des abandons de panier via une observabilité métier du tunnel de vente.",
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
      title: home.hero.title,
      body:
        "Freelance SRE et observabilité, j'interviens sur vos systèmes critiques pour réduire les incidents, sécuriser les déploiements et rendre la production pilotable avec le bon signal.",
      proofLine:
        "Missions grands comptes, cloud hybride, OpenTelemetry, Dynatrace, SRE et industrialisation DevOps.",
      primaryCta: "Voir le dossier",
      secondaryCta: "Discuter d'une mission",
    },
    proof: {
      title: "Des systèmes critiques, des résultats mesurables.",
      body:
        "Les preuves viennent de contextes réels: production, énergie, télécom, SaaS, e-commerce et migration cloud.",
    },
    observability: {
      title: "Transformer l'observabilité en fiabilité opérationnelle.",
      body:
        "Je ne me contente pas d'installer des outils. Je relie instrumentation, pratiques d'équipe et décisions d'exploitation pour rendre le signal actionnable.",
    },
    workPreview: {
      title: "Missions récentes",
      body: "Un aperçu des interventions; le dossier détaille responsabilités, contexte et résultats.",
      cta: "Lire le dossier complet",
    },
    blogPreview: {
      title: "Écrire pour clarifier la production.",
      body:
        "Articles sur Observabilité, Fleet Management, OpAMP et pratiques SRE, repris du travail éditorial The Unreliable Engineer.",
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
        "Dossier de compétence d'Amine Amanzou: freelance SRE, observabilité, cloud, DevOps, production, formations et certifications.",
      heading: "Dossier de compétence freelance SRE et observabilité.",
      intro:
        "Un parcours construit sur l'exploitation de systèmes critiques, l'industrialisation cloud, la gouvernance observabilité et la réduction concrète des incidents.",
      experienceTitle: "Missions et expériences",
      experienceBody:
        "Les missions mettent en avant impact, responsabilité et contexte technique.",
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
        "Une sélection d'articles publiés sur The Unreliable Engineer, un média où je fais de la création de contenu et où je partage sur des sujets plus Tech, IA, etc.",
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
      title: "Amine Amanzou | Freelance SRE & Observability Expert",
      description:
        "Portfolio of Amine Amanzou, freelance Site Reliability Engineer specialized in observability, reliability, DevOps, cloud and production platforms.",
    },
    role: profile.roleEn,
    brandSubtitle: "SRE · Observability",
    hero: {
      title: "Actionable observability for critical systems.",
      body:
        "As a freelance SRE and observability expert, I help teams reduce incidents, secure deployments and operate production with the right signals.",
      proofLine:
        "Enterprise missions, hybrid cloud, OpenTelemetry, Dynatrace, SRE practices and DevOps industrialization.",
      primaryCta: "View profile",
      secondaryCta: "Discuss a mission",
    },
    proof: {
      title: "Critical systems, measurable outcomes.",
      body:
        "Proof points come from real production contexts: energy, telecom, SaaS, e-commerce, cloud migration and support operations.",
    },
    observability: {
      title: "Turning observability into operational reliability.",
      body:
        "I do not just install tools. I connect instrumentation, team practices and operating decisions so the signal becomes actionable.",
    },
    workPreview: {
      title: "Recent missions",
      body: "A quick overview; the profile details responsibilities, context and outcomes.",
      cta: "Read the full profile",
    },
    blogPreview: {
      title: "Writing to clarify production.",
      body:
        "Articles about Observability, Fleet Management, OpAMP and SRE practices, carried over from The Unreliable Engineer editorial work.",
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
        "Capability statement of Amine Amanzou: freelance SRE, observability, cloud, DevOps, production, training and certifications.",
      heading: "Freelance SRE and observability capability statement.",
      intro:
        "A track record built on operating critical systems, industrializing cloud platforms, governing observability and reducing incidents in production.",
      experienceTitle: "Missions and experience",
      experienceBody:
        "Missions are framed around impact, responsibility and technical context.",
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
        "A selection of articles published on The Unreliable Engineer, a media project where I create content and share ideas on deeper tech, AI and adjacent topics.",
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
    "/en/": "/",
    "/en/dossier/": "/dossier/",
    "/en/blog/": "/blog/",
    "/en/contact/": "/contact/",
  };

  return map[normalized] ?? (locale === "fr" ? "/en/" : "/");
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

export const experiencesEn: Experience[] = [
  {
    role: "Observability Expert",
    company: "Enedis",
    period: "Mar 2024 - Nov 2025",
    summary:
      "Observability referent aligning SRE, development and operations teams around a shared trajectory.",
    highlights: [
      {
        title: "Change management & governance",
        body:
          "Facilitated collaborative workshops and defined operating rules to align more than 400 projects.",
      },
      {
        title: "Strategic benchmark",
        body:
          "Led the technical RFP track: IaC test environments, benchmark of 7 leading solutions, Chaos Engineering and AI Ops.",
      },
      {
        title: "Hybrid strategy",
        body:
          "Target architecture for supervising a heterogeneous landscape combining Kubernetes, microservices and legacy systems.",
      },
    ],
  },
  {
    role: "Cloud DevOps Engineer",
    company: "Ylio",
    period: "Jan 2024 - Mar 2024",
    summary: "Cloud industrialization and security on GCP for an e-commerce platform.",
    highlights: [
      {
        title: "Business observability",
        body:
          "OpenTelemetry business metrics to monitor the sales funnel and identify friction points.",
      },
      {
        title: "Security & architecture",
        body:
          "Network isolation, centralized secret management with HashiCorp Vault and SSL automation.",
      },
      {
        title: "Infrastructure as Code",
        body:
          "GCP infrastructure scripted with Terraform, GitHub Actions / Ansible CI/CD and a Kubernetes GKE proof of concept.",
      },
    ],
  },
  {
    role: "Dynatrace Observability Expert",
    company: "Odigo",
    period: "Oct 2022 - Sep 2023",
    summary:
      "Dynatrace SaaS migration and industrialization of proactive observability for support and engineering teams.",
    highlights: [
      {
        title: "Business impact & reliability",
        body:
          "Reduced customer incidents by 40%, improved MTTD/MTTR and relieved N1/N2 support teams.",
      },
      {
        title: "Architecture & migration",
        body:
          "Completed migration to Dynatrace SaaS in 5 months and containerized Python collectors for specific KPIs.",
      },
      {
        title: "Configuration as Code",
        body:
          "Dynamic inventory plugins, CMDB integration and automated agent deployment through Ansible/Jenkins.",
      },
    ],
  },
  {
    role: "Lead SRE Data & Performance",
    company: "Orange",
    period: "Dec 2018 - May 2021",
    summary:
      "Technical responsibility for data and observability during the critical migration of 30 million mail accounts.",
    highlights: [
      {
        title: "Critical context",
        body:
          "Migration observability to avoid mail loss and reduce incident intervention time.",
      },
      {
        title: "Technical data lead",
        body:
          "Led Elasticsearch, Kafka and Grafana, coordinated operations and interfaced with build and infrastructure teams.",
      },
      {
        title: "Deep performance work",
        body:
          "Diagnosed JVM, OpenStack, noisy neighbors, overcommitting and Kafka optimization for very high-volume logs.",
      },
    ],
  },
  {
    role: "System Engineer & DevOps",
    company: "Orange",
    period: "Dec 2016 - Dec 2018",
    summary: "Critical operations for Mail Pro platforms and introduction of DevOps practices.",
    highlights: [
      {
        title: "Crisis management",
        body:
          "Network KPIs used to prove supplier under-sizing and resolve critical incidents.",
      },
      {
        title: "Data architecture",
        body:
          "MongoDB / GridFS for large file transfer, purge procedures and go-live for a 100k customer service.",
      },
      {
        title: "DevOps transition",
        body:
          "Early Jenkins pipelines, deployment automation and Red Hat Linux, Apache and MySQL operations.",
      },
    ],
  },
];

export const education: Education[] = [
  {
    title: "ClickHouse Observability Professional Certification",
    period: "Décembre 2025",
    issuer: "ClickHouse",
    icon: "/images/certifications/clickhouse.svg",
  },
  {
    title: "Kubernetes Administration Course - CKA",
    period: "Janvier 2024",
    issuer: "Mumshad Mannambeth, KodeKloud",
    icon: "/images/certifications/kubernetes.svg",
    href: "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/",
  },
  {
    title: "HashiCorp Terraform Associate Course - 003",
    period: "Novembre 2023",
    issuer: "Andrew Brown, ExamPro",
    icon: "/images/certifications/terraform.svg",
    href: "https://developer.hashicorp.com/certifications/infrastructure-automation",
  },
  {
    title: "AWS Cloud Practitioner Course CLF-C02",
    period: "Septembre 2023",
    issuer: "Stephane Maarek, Udemy",
    icon: "/images/certifications/aws.svg",
    href: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
  },
  {
    title: "Introduction au machine learning",
    period: "Juin 2021",
    issuer: "Camille Van Hofflen - Jungle Program",
    icon: "/images/certifications/machine-learning.svg",
    body:
      "Formation de 6 semaines sur la théorie, la manipulation de données et l'évaluation de modèles de machine learning.",
  },
  {
    title: "Master 2 - Système d'information et de connaissance",
    period: "2014 - 2016",
    issuer: "MIAGE Sorbonne - Université Paris 1 Panthéon-Sorbonne",
    icon: "/images/certifications/miage.svg",
    body:
      "Alternance autour du développement, de l'architecture, de la conduite de projet SI et de la maîtrise d'ouvrage.",
  },
  {
    title: "Licence MIAGE Ingénierie des SI",
    period: "2013 - 2014",
    issuer: "MIAGE Sorbonne - Université Paris 1 Panthéon-Sorbonne",
    icon: "/images/certifications/miage.svg",
  },
  {
    title: "DUT Informatique",
    period: "2011 - 2013",
    issuer: "IUT Fontainebleau, Université Paris-Est Créteil",
    icon: "/images/certifications/informatique.svg",
  },
  {
    title: "Baccalauréat STG",
    period: "2007 - 2011",
    issuer: "Comptabilité et finance des entreprises",
    icon: "/images/certifications/diploma.svg",
    body: "Mention Bien.",
  },
];

export const educationEn: Education[] = [
  {
    title: "ClickHouse Observability Professional Certification",
    period: "December 2025",
    issuer: "ClickHouse",
    icon: "/images/certifications/clickhouse.svg",
  },
  {
    title: "Kubernetes Administration Course - CKA",
    period: "January 2024",
    issuer: "Mumshad Mannambeth, KodeKloud",
    icon: "/images/certifications/kubernetes.svg",
    href: "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/",
  },
  {
    title: "HashiCorp Terraform Associate Course - 003",
    period: "November 2023",
    issuer: "Andrew Brown, ExamPro",
    icon: "/images/certifications/terraform.svg",
    href: "https://developer.hashicorp.com/certifications/infrastructure-automation",
  },
  {
    title: "AWS Cloud Practitioner Course CLF-C02",
    period: "September 2023",
    issuer: "Stephane Maarek, Udemy",
    icon: "/images/certifications/aws.svg",
    href: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
  },
  {
    title: "Introduction to machine learning",
    period: "June 2021",
    issuer: "Camille Van Hofflen - Jungle Program",
    icon: "/images/certifications/machine-learning.svg",
    body:
      "Six-week training on machine learning theory, data manipulation and model evaluation.",
  },
  {
    title: "Master 2 - Information and Knowledge Systems",
    period: "2014 - 2016",
    issuer: "MIAGE Sorbonne - Paris 1 Panthéon-Sorbonne University",
    icon: "/images/certifications/miage.svg",
    body:
      "Work-study program covering software development, architecture, information-system project management and business analysis.",
  },
  {
    title: "Bachelor's degree - Information Systems Engineering",
    period: "2013 - 2014",
    issuer: "MIAGE Sorbonne - Paris 1 Panthéon-Sorbonne University",
    icon: "/images/certifications/miage.svg",
  },
  {
    title: "DUT Computer Science",
    period: "2011 - 2013",
    issuer: "IUT Fontainebleau, Paris-Est Créteil University",
    icon: "/images/certifications/informatique.svg",
  },
  {
    title: "French baccalaureate - STG",
    period: "2007 - 2011",
    issuer: "Accounting and corporate finance",
    icon: "/images/certifications/diploma.svg",
    body: "Graduated with honors.",
  },
];
