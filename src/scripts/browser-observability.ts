export type BrowserObservabilityConfig = {
  apiKey: string;
  endpoint: string;
  environment: string;
  service: string;
  site: string;
  version: string;
};

const SAFE_ERROR_NAMES = new Set([
  "Error",
  "EvalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
]);

const SAFE_RESOURCE_TYPES = new Set([
  "audio",
  "embed",
  "iframe",
  "img",
  "link",
  "object",
  "script",
  "source",
  "track",
  "video",
]);

let initPromise: Promise<void> | undefined;

function validateConfig(config: BrowserObservabilityConfig): void {
  const missing = Object.entries(config)
    .filter(([, value]) => value.trim() === "")
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Browser observability is enabled but missing: ${missing.join(", ")}`);
  }

  const endpoint = new URL(config.endpoint);
  if (endpoint.protocol !== "https:" && endpoint.hostname !== "localhost" && endpoint.hostname !== "127.0.0.1") {
    throw new Error("Browser observability endpoint must use HTTPS outside local development");
  }
}

function safeRoute(): string {
  const pathname = window.location.pathname.endsWith("/")
    ? window.location.pathname
    : `${window.location.pathname}/`;
  const staticRoutes = new Set([
    "/",
    "/blog/",
    "/contact/",
    "/dossier/",
    "/privacy/",
    "/en/",
    "/en/blog/",
    "/en/contact/",
    "/en/dossier/",
    "/en/privacy/",
  ]);

  if (staticRoutes.has(pathname)) return pathname;
  if (/^\/blog\/[^/]+\/$/.test(pathname)) return "/blog/:slug/";
  if (/^\/en\/blog\/[^/]+\/$/.test(pathname)) return "/en/blog/:slug/";
  return "/other/";
}

function safeErrorName(value: unknown): string {
  if (!(value instanceof Error)) return "UnknownError";
  return SAFE_ERROR_NAMES.has(value.name) ? value.name : "Error";
}

function safeResourceType(target: EventTarget | null): string {
  if (!(target instanceof Element)) return "other";
  const type = target.tagName.toLowerCase();
  return SAFE_RESOURCE_TYPES.has(type) ? type : "other";
}

export function initBrowserObservability(config: BrowserObservabilityConfig): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    validateConfig(config);

    // Keep this import behind the explicit consent gate. The SDK chunk must not
    // be requested merely because a visitor loaded a page.
    const { default: HyperDX } = await import("@hyperdx/browser");

    HyperDX.init({
      advancedNetworkCapture: false,
      apiKey: config.apiKey,
      consoleCapture: false,
      disableIntercom: true,
      disableReplay: true,
      instrumentations: {
        connectivity: false,
        console: false,
        document: true,
        errors: false,
        fetch: false,
        interactions: false,
        longtask: true,
        postload: false,
        socketio: false,
        visibility: false,
        webvitals: true,
        websocket: false,
        xhr: false,
      },
      maskAllInputs: true,
      maskAllText: true,
      recordCanvas: false,
      service: config.service,
      tracePropagationTargets: [],
      tracesUrl: `${config.endpoint.replace(/\/$/, "")}/v1/traces`,
      otelResourceAttributes: {
        "deployment.environment": config.environment,
        "deployment.environment.name": config.environment,
        "service.namespace": "web-frontend",
        "service.version": config.version,
        "site.name": config.site,
      },
    });

    window.addEventListener("error", (event) => {
      if (!(event.error instanceof Error)) return;
      HyperDX.addAction("browser.error", {
        "error.type": safeErrorName(event.error),
        "page.route": safeRoute(),
      });
    });

    const handleResourceError = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      HyperDX.addAction("browser.resource.error", {
        "page.route": safeRoute(),
        "resource.type": safeResourceType(event.target),
      });
    };
    document.addEventListener("error", handleResourceError, true);

    window.addEventListener("unhandledrejection", (event) => {
      HyperDX.addAction("browser.unhandledrejection", {
        "error.type": safeErrorName(event.reason),
        "page.route": safeRoute(),
      });
    });
  })().catch((error) => {
    initPromise = undefined;
    throw error;
  });

  return initPromise;
}
