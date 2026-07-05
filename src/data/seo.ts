export const siteUrl = "https://amineamanzou.fr";

export function canonical(path: string): string {
  return new URL(path, siteUrl).toString();
}
