---
title: "ClickHouse, Dash0, Tsuga : ce que je conseille, et à qui"
locale: "fr"
articleSlug: "clickhouse-dash0-tsuga-conseil"
translationKey: "clickhouse-dash0-tsuga-conseil"
publishedAt: "2026-12-17"
label: "Observability / Engineering"
readTime: "5 min"
excerpt: "Trois solutions d’observabilité que je regarde de près : ce que j’en ai vu, leur point fort, leur point bloquant, et celle que je recommande selon le client."
heroImage: "/blog/clickhouse-dash0-tsuga-conseil/cover.webp"
heroImageAlt: "L’Ingénieur Peu Fiable soupèse deux options devant les logos de ClickHouse, Dash0 et Tsuga"
pillar: "observability"
intent: "comparative"
primaryQuery: "clickhouse dash0 tsuga conseil"
relatedOffer: "diagnostic"
seoTitle: "ClickHouse, Dash0, Tsuga : ce que je conseille, et à qui"
seoDescription: "Trois solutions d’observabilité que je regarde de près : ce que j’en ai vu, leur point fort, leur point bloquant, et celle que je recommande selon le client."
keywords: ["observability", "OpenTelemetry", "clickhouse dash0 tsuga conseil"]
proofLevel: "experience"
---

Chez Enedis, j’ai comparé sept plateformes d’observabilité pour un appel d’offres de 15 millions d’euros. Trois choses ont pesé dans la décision : l’intégration d’OpenTelemetry, la conformité à la liste d’exigences rédigée avec l’ensemble des responsables du SI, et le budget. Sur un appel d’offres, le budget fait au moins 60 % de la décision. Une solution qui se positionne comme la plus chère du marché a très peu de chances de rentrer dans les fichiers Excel.

C’est avec cette grille en tête que je regarde aujourd’hui trois solutions : ClickHouse, Dash0 et Tsuga. Voici ce que j’en ai vu, et à qui je conseille quoi.

## Pourquoi pas Datadog, Elastic ou Grafana

Datadog, d’abord pour le prix.

Elastic vient de bouger vers le stockage en colonnes, avec [un mode colonnaire](https://www.elastic.co/search-labs/blog/elasticsearch-columnar-storage) annoncé en juillet 2026. Ça fait des années qu’on évoque l’idée, et c’est seulement maintenant qu’on les voit tester quelque chose. Amazon a fait [un mouvement comparable pour OpenSearch](https://aws.amazon.com/blogs/big-data/run-log-analytics-for-a-fraction-of-the-cost-with-the-new-engine-for-amazon-opensearch-service/) au même moment.

Grafana, ce sont des champions. Ils sont open source, très connus, ils continuent de contribuer et d’avancer. J’ai assisté à leur conférence : ils ont ajouté un fleet management, et il y a franchement de bonnes idées. Mais j’en fais depuis tellement longtemps que je n’arrive plus à définir leur avantage concurrentiel. Leur interface commence à se faire vieille, et il manque le côté performance, le côté « je me distingue des autres ». On a l’impression que Grafana est l’interface de tout le monde, sans être la base de données de tout le monde.

## ClickHouse : celui que j’ai en production

ClickHouse, je l’ai adopté en production, et je travaille dessus chez un client en ce moment. En performance, c’est sacrément impressionnant : il encaisse un nombre de requêtes hallucinant. Il y a beaucoup d’ingénierie et de talent derrière.

J’aime aussi l’écosystème. Ils avancent sur la data, sur l’analytique, sur le Postgres managé, et sur l’observabilité des agents depuis [le rachat de Langfuse](https://clickhouse.com/blog/clickhouse-raises-400-million-series-d-acquires-langfuse-launches-postgres). Côté observabilité, l’intégration avec OpenTelemetry est là, et le MCP de ClickStack permet d’investiguer sur des incidents. J’en ai parlé plus longuement après [leur matinée à Paris](/blog/clickhouse-observabilite-conference-2026/).

Le point bloquant : ils doivent investir davantage dans l’interface HyperDX, dans la gestion des droits et dans les intégrations comme le monitoring synthétique.

C’est un challenger, et pour un expert de l’observabilité, c’est un bon endroit où se positionner.

## Dash0 : le fondateur qui écrit lui-même

Je connais Dash0 depuis fin 2024. Ce qui m’a surpris, c’est que [Mirko Novakovic](https://techcrunch.com/2024/11/04/datadog-challenger-dash0-aims-to-dash-observability-bill-shock) m’a contacté lui-même sur LinkedIn pour me demander de tester le produit. Il a fondé Instana, qu’il a revendu à IBM, et il dirige aujourd’hui Dash0. Il investit aussi dans d’autres startups. Voir un CEO de ce niveau faire le travail d’un commercial pour rester à l’écoute de ses utilisateurs, ça m’a marqué.

Ils ont fait un sacré travail sur le marketing et sur l’expérience utilisateur. Pour moi, ils sont aujourd’hui dans le top de ce qui se fait quand il s’agit de corréler les signaux d’observabilité. Leur force, c’est l’offre SaaS tout-en-un et une interface excellente.

Le point bloquant : ils ne proposent rien aux entreprises qui veulent rester on-premise. On aurait bien aimé une offre managée à installer chez soi.

## Tsuga : des anciens de Datadog qui repartent de zéro

Tsuga, Julien Teyssier m’en a fait une démo dans un café à Paris en début d’année. L’équipe rassemble des anciens de Datadog et d’autres éditeurs. Chez les vendors, ils ont connu des frustrations, ils n’ont pas pu innover comme ils le voulaient, et ils ont monté leur solution pour faire ce qu’ils ne pouvaient pas faire là-bas. J’aime bien le récit, et j’aime bien l’approche. [Leur plateforme](https://www.tsuga.com/product/overview) tourne dans le compte cloud du client, donc les données n’en sortent pas.

Ils ont l’air d’avoir de sacrés résultats. D’après eux, [le journal Le Monde s’en est servi](https://thenextweb.com/news/tsuga-35-million-series-a-observability) pendant les élections municipales. C’est une équipe jeune et novatrice, qui construit quelque chose pour se différencier du marché, et qui a l’air d’y arriver.

Le point faible, c’est le marketing : ce serait bien qu’ils soient un peu plus connus. Mais ça fait partie de leur stratégie. Ils en font peu et visent les très grands comptes.

## Ce que je recommande

Je penche pour l’open source, donc pour ClickHouse, de la PME au grand compte. Son offre cloud convient aussi aux startups et aux PME.

Si c’est une startup qui veut le top du top, avec toutes les intégrations au même endroit et un assistant IA intégré, je recommande Dash0.

Tsuga joue dans une autre catégorie, celle des très grands comptes.
