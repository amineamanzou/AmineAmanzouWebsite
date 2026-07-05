import { defineConfig } from "astro/config";

const site = process.env.SITE_URL ?? "https://amineamanzou.fr";
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  output: "static",
  trailingSlash: "always",
  site,
  base,
});
