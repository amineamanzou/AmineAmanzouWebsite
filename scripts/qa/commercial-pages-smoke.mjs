import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright-core";

const host = "127.0.0.1";
const port = "4392";
const baseUrl = `http://${host}:${port}`;
const outputDirectory = "/tmp/amineamanzou-commercial-qa";
await mkdir(outputDirectory, { recursive: true });

const preview = spawn("npm", ["run", "preview", "--", "--host", host, "--port", port, "--strictPort"], {
  cwd: process.cwd(),
  stdio: ["ignore", "pipe", "pipe"],
});

const output = [];
process.on("exit", () => preview.kill("SIGTERM"));
preview.stdout.on("data", (chunk) => output.push(chunk.toString()));
preview.stderr.on("data", (chunk) => output.push(chunk.toString()));

async function waitForPreview() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (output.join("").includes(baseUrl)) return;
    if (preview.exitCode !== null) throw new Error(`Preview stopped early:\n${output.join("")}`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Preview did not start:\n${output.join("")}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const cases = [
  { name: "home-390-light", path: "/", width: 390, height: 844, scheme: "light" },
  { name: "home-768-dark", path: "/", width: 768, height: 1024, scheme: "dark" },
  { name: "home-1024-light", path: "/", width: 1024, height: 900, scheme: "light" },
  { name: "home-1440-dark", path: "/", width: 1440, height: 1000, scheme: "dark" },
  { name: "audit-390-dark", path: "/audit-observabilite/", width: 390, height: 844, scheme: "dark", service: true, offer: true },
  { name: "otel-768-light", path: "/consultant-opentelemetry/", width: 768, height: 1024, scheme: "light", service: true },
  { name: "fractional-1024-dark", path: "/fractional-observability-lead/", width: 1024, height: 900, scheme: "dark", service: true },
  { name: "blog-1440-light", path: "/blog/", width: 1440, height: 1000, scheme: "light" },
  { name: "article-390-light", path: "/blog/opamp-fleet-management-governance/", width: 390, height: 844, scheme: "light" },
  { name: "audit-en-768-dark", path: "/en/observability-audit/", width: 768, height: 1024, scheme: "dark", service: true, offer: true },
];

await waitForPreview();
const playwrightExecutablePath = chromium.executablePath();
const relativeExecutable = playwrightExecutablePath.match(/(?:^|\/)(chromium-\d+\/.*)$/)?.[1];
const executableCandidates = [
  process.env.CHROME_PATH,
  relativeExecutable && process.env.HOME ? `${process.env.HOME}/Library/Caches/ms-playwright/${relativeExecutable}` : undefined,
  relativeExecutable && process.env.HOME ? `${process.env.HOME}/.cache/ms-playwright/${relativeExecutable}` : undefined,
  playwrightExecutablePath,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const executablePath = executableCandidates.find(existsSync);
assert(executablePath, `Chrome executable not found; checked ${executableCandidates.join(", ")}`);
const browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  for (const item of cases) {
    const context = await browser.newContext({
      viewport: { width: item.width, height: item.height },
      colorScheme: item.scheme,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const response = await page.goto(`${baseUrl}${item.path}`, { waitUntil: "networkidle" });
    assert(response?.ok(), `${item.name}: HTTP ${response?.status()}`);
    await page.locator("h1").waitFor({ state: "visible" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(window.innerHeight * 0.8, 400)) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForFunction(() => [...document.images].every((image) => image.complete), undefined, { timeout: 5_000 });
    const brokenImages = await page.locator("img[src]").evaluateAll((images) => images.filter((image) => image.naturalWidth === 0).map((image) => image.getAttribute("src")));
    assert(brokenImages.length === 0, `${item.name}: broken images ${brokenImages.join(", ")}`);

    const layout = await page.evaluate(() => {
      const h1 = document.querySelector("h1")?.getBoundingClientRect();
      return {
        viewport: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        h1Left: h1?.left ?? -1,
        h1Right: h1?.right ?? -1,
        revealHidden: [...document.querySelectorAll("[data-reveal]")].filter((node) => getComputedStyle(node).opacity === "0").length,
      };
    });
    assert(layout.scrollWidth <= layout.viewport + 1, `${item.name}: horizontal overflow ${layout.scrollWidth}/${layout.viewport}`);
    assert(layout.h1Left >= 0 && layout.h1Right <= layout.viewport + 1, `${item.name}: H1 escapes viewport`);
    assert(layout.revealHidden === 0, `${item.name}: ${layout.revealHidden} reveal elements remain hidden with reduced motion`);

    await page.keyboard.press("Tab");
    const focusVisible = await page.evaluate(() => {
      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) return false;
      const box = active.getBoundingClientRect();
      return box.width > 0 && box.height > 0;
    });
    assert(focusVisible, `${item.name}: first keyboard focus is not visible`);

    if (item.service) {
      const href = await page.locator('a[href^="mailto:"]').first().getAttribute("href");
      assert(href?.includes("subject="), `${item.name}: prequalified email subject missing`);
      assert(href?.includes("body="), `${item.name}: prequalified email body missing`);
      const structuredTypes = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => {
        const types = [];
        const visit = (value) => {
          if (Array.isArray(value)) return value.forEach(visit);
          if (!value || typeof value !== "object") return;
          if (typeof value["@type"] === "string") types.push(value["@type"]);
          Object.values(value).forEach(visit);
        };
        scripts.forEach((script) => visit(JSON.parse(script.textContent ?? "{}")));
        return types;
      });
      for (const type of ["Service", "BreadcrumbList", "FAQPage"]) assert(structuredTypes.includes(type), `${item.name}: JSON-LD ${type} missing`);
      assert(structuredTypes.includes("Offer") === Boolean(item.offer), `${item.name}: diagnostic Offer rule is incorrect`);
    }

    await page.screenshot({ path: path.join(outputDirectory, `${item.name}.png`), fullPage: true });
    await context.close();
  }
} finally {
  await browser.close();
  preview.kill("SIGTERM");
}

console.log(JSON.stringify({ ok: true, cases: cases.length, screenshots: outputDirectory }, null, 2));
