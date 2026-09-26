// Preserve historical publication dates; enforce the policy for every new pair.
export const simultaneousPublicationFrom = "2026-09-26";

export function publicationPairErrors(entries) {
  const dates = entries.map((entry) => entry.publishedAt);
  if (dates.some((date) => !/^\d{4}-\d{2}-\d{2}$/.test(date ?? ""))) {
    return ["each translation must have a publication date"];
  }
  if (dates.some((date) => date >= simultaneousPublicationFrom) && new Set(dates).size !== 1) {
    return ["French and English translations must publish on the same day"];
  }
  return [];
}
