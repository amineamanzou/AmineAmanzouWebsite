# Publication bilingue et audit SEO des articles — 26 septembre 2026

## Publication

À partir du 26 septembre 2026, chaque nouvelle paire FR/EN doit avoir la même date de publication. La cadence est le mardi (versions anglaises futures avancées à la date française). Les dates historiques restent inchangées pour ne pas réécrire la publication réelle. Les contrôles de contenu refusent une paire future décalée, y compris si une des dates précède le début de cette règle.

Les dates contrôlent la présence des articles au prochain build de production. Elles ne constituent pas une garantie de l’heure de mise en ligne si le déploiement échoue.

## Résultats de l’audit

- Canonical propre à chaque version, langue HTML, hreflang réciproques et x-default : contrôlés dans les pages générées et le sitemap.
- Titres et descriptions uniques, un H1 par article, cohérence du titre, de la description et de la langue avec BlogPosting : contrôles ajoutés.
- Auteur : signature visible avec lien vers le site de l’auteur, cohérente avec les données structurées.
- Dates : éléments HTML time pour la publication et, lorsqu’elle existe, la modification ; cohérence avec datePublished/dateModified. Pas de rafraîchissement artificiel des dates historiques.
- Images : URL absolue dans les données structurées et texte alternatif Open Graph vérifiés.
- Publication différée : exclusion des articles futurs du HTML et du sitemap, puis apparition des deux traductions au même build, vérifiée avant et le jour de la prochaine publication.

Le layout ajoute les textes alternatifs Open Graph et Twitter. Le calendrier éditorial et les quatre articles anglais déjà préparés sont alignés sur les mardis français. Les liens internes vers les articles associés et les offres sont conservés.

## Portée et références

Cet audit porte sur le contenu et le HTML généré. Il ne mesure pas les Core Web Vitals terrain, les backlinks ni l’indexation effective dans Search Console. Une sortie simultanée rend les traductions disponibles ensemble ; elle ne garantit pas un gain de classement.

- [Google : versions localisées et hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google : données structurées Article](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google : dates de publication et modification](https://developers.google.com/search/docs/appearance/publication-dates)
