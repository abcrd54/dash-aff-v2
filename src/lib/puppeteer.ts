import { mkdirSync } from "node:fs";
import { join } from "node:path";

interface BrowserCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

interface OAuthResult {
  success: boolean;
  error?: string;
  socialAccountId?: string;
  username?: string;
}

interface PlatformOAuthConfig {
  buttons: string[];
  selectors?: string[];
  loginIndicators?: string[];
  pageTypes?: Record<string, string[]>;
}

const PLATFORM_DOMAINS: Record<string, string> = {
  TWITTER: ".twitter.com",
  FACEBOOK: ".facebook.com",
  INSTAGRAM: ".instagram.com",
  TIKTOK: ".tiktok.com",
  THREADS: ".threads.net",
  PINTEREST: ".pinterest.com",
  LINKEDIN: ".linkedin.com",
  YOUTUBE: ".youtube.com",
  REDDIT: ".reddit.com",
  DISCORD: ".discord.com",
  SLACK: ".slack.com",
  MASTODON: ".mastodon.social",
  BLUESKY: ".bsky.social",
  GOOGLE_BUSINESS: ".google.com",
  SNAPCHAT: ".snapchat.com",
};

const PLATFORM_OAUTH: Record<string, PlatformOAuthConfig> = {
  FACEBOOK: {
    buttons: [
      "hubungkan lagi", "lanjutkan sebagai", "lanjutkan", "continue as", "continue",
      "authorize", "allow", "accept", "simpan", "save", "next", "reconnect",
    ],
    selectors: [
      'div[role="button"]:has-text("Hubungkan lagi")',
      'div[role="button"]:has-text("Lanjutkan sebagai")',
      'div[role="button"]:has-text("Lanjutkan"):not(:has-text("sebagai"))',
      'div[role="button"]:has-text("Simpan")',
      'a._42ft._4jy0._517i._517h._51sy',
      'button[type="submit"]',
      'div[role="button"][tabindex="0"]',
    ],
    loginIndicators: ["email", "pass", "login", "log in"],
    pageTypes: {
      "connect": ["hubungkan lagi", "lanjutkan sebagai", "continue as", "hubungkan ulang", "reconnect"],
      "pages": ["pilih halaman", "select pages", "setujui semua halaman", "approve all pages"],
      "business": ["pilih bisnis", "select business", "setujui semua bisnis", "approve all business"],
      "permissions": ["tinjau permintaan", "what you allow", "review the access", "simpan"],
      "already-authorized": ["previously authorized", "you already authorized"],
      "login": ["email or phone", "forgotten password", "create new account"],
    },
  },
  INSTAGRAM: {
    buttons: ["continue as", "continue", "authorize", "allow", "accept"],
    selectors: [
      'button[type="submit"]',
      'div[role="button"][tabindex="0"]',
    ],
    loginIndicators: ["username", "password", "log in", "sign up"],
    pageTypes: {
      "continue-as": ["continue as"],
      "permissions": ["allow access", "would like to"],
      "login": ["phone number", "username", "or", "sign up"],
    },
  },
  TWITTER: {
    buttons: ["authorize app", "authorize", "allow"],
    selectors: [
      'input[type="submit"]',
      'button[type="submit"]',
      'div[role="button"][data-testid*="oauth"]',
    ],
  },
  LINKEDIN: {
    buttons: ["allow", "authorize", "accept"],
    selectors: ['button[type="submit"]'],
  },
  GOOGLE_BUSINESS: {
    buttons: ["continue", "allow", "authorize", "accept"],
    selectors: ['button[type="submit"]', 'div[role="button"]'],
  },
  YOUTUBE: {
    buttons: ["continue", "allow", "authorize", "accept"],
    selectors: ['button[type="submit"]', 'div[role="button"]'],
  },
  TIKTOK: {
    buttons: ["authorize", "allow", "accept", "confirm"],
    selectors: ['button[type="submit"]', 'div[role="button"]'],
  },
  PINTEREST: {
    buttons: ["authorize", "allow", "accept", "give access"],
    selectors: ['button[type="submit"]', 'div[role="button"]'],
  },
  REDDIT: {
    buttons: ["allow", "authorize", "accept"],
    selectors: ['button[type="submit"]', 'input[type="submit"]'],
  },
  DISCORD: {
    buttons: ["authorize", "allow"],
    selectors: ['button[type="submit"]'],
  },
  SLACK: {
    buttons: ["allow", "authorize"],
    selectors: ['button[type="submit"]'],
  },
  THREADS: {
    buttons: ["continue as", "continue", "authorize", "allow"],
    selectors: [
      'button[type="submit"]',
      'div[role="button"][tabindex="0"]',
    ],
    loginIndicators: ["username", "password", "log in"],
    pageTypes: {
      "continue-as": ["continue as"],
      "permissions": ["allow access"],
      "login": ["username", "password", "log in"],
    },
  },
  MASTODON: {
    buttons: ["authorize", "allow"],
    selectors: ['button[type="submit"]'],
  },
  BLUESKY: {
    buttons: ["authorize", "allow", "accept"],
    selectors: ['button[type="submit"]'],
  },
  SNAPCHAT: {
    buttons: ["continue", "authorize", "allow"],
    selectors: ['button[type="submit"]'],
  },
};

const DEFAULT_OAUTH: PlatformOAuthConfig = {
  buttons: ["authorize", "allow", "accept", "continue", "confirm"],
  selectors: ['button[type="submit"]', 'input[type="submit"]', 'div[role="button"]'],
};

export function parseCookies(raw: string, platform?: string): BrowserCookie[] {
  const trimmed = raw.trim();

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    return arr.map((c: any) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path || "/",
      expires: c.expires != null ? Math.floor(c.expires) : -1,
      httpOnly: false,
      secure: c.secure || false,
      sameSite: (c.sameSite || "Lax") as BrowserCookie["sameSite"],
    }));
  }

  const domain = platform ? (PLATFORM_DOMAINS[platform.toUpperCase()] || `.${platform.toLowerCase()}.com`) : "";
  const pairs = trimmed.split(";");
  const cookies: BrowserCookie[] = [];

  for (const pair of pairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) continue;
    const name = pair.substring(0, eqIdx).trim();
    const value = pair.substring(eqIdx + 1).trim();
    if (!name || !value) continue;
    cookies.push({
      name,
      value,
      domain,
      path: "/",
      expires: -1,
      httpOnly: false,
      secure: true,
      sameSite: "Lax",
    });
  }

  return cookies;
}

async function getBrowser(platform?: string) {
  const { default: puppeteer } = await import("puppeteer");
  const isMeta = platform === "FACEBOOK" || platform === "INSTAGRAM" || platform === "THREADS";
  const args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-blink-features=AutomationControlled",
    "--disable-features=IsolateOrigins,site-per-process",
    "--disable-site-isolation-trials",
  ];
  if (isMeta) {
    args.push(
      "--disable-features=VizDisplayCompositor",
      "--disable-accelerated-2d-canvas",
      "--disable-accelerated-video-decode",
      "--window-size=1920,1080",
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    );
  }
  return puppeteer.launch({
    headless: true,
    args,
    timeout: 15000,
    protocolTimeout: 30000,
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface PageDebug {
  url: string;
  title: string;
  visibleButtons: { tag: string; text: string; ariaLabel: string; id: string }[];
  pageType: string;
}

async function capturePageDebug(page: any, config: PlatformOAuthConfig): Promise<PageDebug> {
  return page.evaluate((pageTypes: Record<string, string[]> | undefined) => {
    const bodyText = (document.body.textContent || "").toLowerCase();

    const buttons = Array.from(
      document.querySelectorAll(
        'button, input[type="submit"], div[role="button"], span[role="button"], a[role="button"]'
      )
    ).map((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      return {
        tag: el.tagName.toLowerCase(),
        text: ((el as HTMLElement).textContent || "").trim().slice(0, 80),
        ariaLabel: (el as HTMLElement).getAttribute("aria-label") || "",
        id: (el as HTMLElement).id || "",
      };
    }).filter(Boolean);

    let pageType = "unknown";
    if (pageTypes) {
      for (const [type, indicators] of Object.entries(pageTypes)) {
        if (indicators.some((ind) => bodyText.includes(ind.toLowerCase()))) {
          pageType = type;
          break;
        }
      }
    }

    return {
      url: location.href.slice(0, 200),
      title: document.title.slice(0, 100),
      visibleButtons: buttons as any,
      pageType,
    };
  }, config.pageTypes);
}

async function findAndClickOAuthButton(
  page: any,
  config: PlatformOAuthConfig,
  debugPrefix: string
): Promise<{ clicked: boolean; debug: PageDebug }> {
  const selectors = config.selectors || [];
  const buttons = config.buttons || [];

  // Strategy 1: waitForSelector with platform-specific selectors (filtered by text)
  for (const sel of selectors) {
    for (const btnText of buttons) {
      try {
        // Pyppeteer: wait for selector, then filter by text in page context
        await page.waitForSelector(sel, { timeout: 4000, visible: true });

        const clicked = await page.evaluate(
          (s: string, t: string) => {
            const els = Array.from(document.querySelectorAll(s)) as HTMLElement[];
            for (const el of els) {
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) continue;
              const text = (el.textContent || "").toLowerCase().trim();
              if (text.includes(t)) {
                el.click();
                return true;
              }
            }
            return false;
          },
          sel,
          btnText
        );

        if (clicked) return { clicked: true, debug: null as any };
      } catch {
        // Selector timeout or not found, try next
      }
    }
  }

  // Strategy 2: XPath for exact text matching (case-insensitive)
  for (const btnText of buttons) {
    try {
      const xpath = `//button[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${btnText}')] | //div[@role='button'][contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${btnText}')] | //input[@type='submit'][contains(translate(@value, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${btnText}')]`;
      const elements = await page.$x(xpath);
      for (const el of elements) {
        const visible = await el.boundingBox();
        if (visible) {
          await el.click();
          return { clicked: true, debug: null as any };
        }
      }
    } catch {
      // XPath error, try next
    }
  }

  // Strategy 3: generic text matching (fallback)
  const clicked = await page.evaluate((btns: string[]) => {
    const all = Array.from(
      document.querySelectorAll(
        'button, input[type="submit"], div[role="button"], span[role="button"], a[role="button"]'
      )
    ) as HTMLElement[];

    const visible = all.filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    // Sort by size (largest first) - primary buttons are usually larger
    visible.sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return (rb.width * rb.height) - (ra.width * ra.height);
    });

    for (const btnText of btns) {
      for (const el of visible) {
        const text = (el.textContent || "").toLowerCase().trim();
        // Stricter match: only match if text starts with or equals the button text
        // to avoid matching "Continue with Google" when looking for "Continue"
        if (text === btnText || text.startsWith(btnText + " ")) {
          el.click();
          return true;
        }
      }
    }

    // Relaxed fallback: any match
    for (const btnText of btns) {
      for (const el of visible) {
        const text = (el.textContent || "").toLowerCase().trim();
        if (text.includes(btnText)) {
          el.click();
          return true;
        }
      }
    }

    return false;
  }, buttons);

  const debug = await capturePageDebug(page, config);
  return { clicked, debug };
}

async function detectPageType(page: any, config: PlatformOAuthConfig): Promise<string> {
  return page.evaluate((pageTypes: Record<string, string[]> | undefined) => {
    if (!pageTypes) return "unknown";
    const bodyText = (document.body.textContent || "").toLowerCase();
    for (const [type, indicators] of Object.entries(pageTypes)) {
      if (indicators.some((ind) => bodyText.includes(ind.toLowerCase()))) {
        return type;
      }
    }
    return "unknown";
  }, config.pageTypes);
}

export async function runOAuthFlow(
  oauthUrl: string,
  cookies: BrowserCookie[],
  platform: string
): Promise<OAuthResult> {
  const platformUpper = platform.toUpperCase();
  const config = PLATFORM_OAUTH[platformUpper] || DEFAULT_OAUTH;
  const isMeta = platformUpper === "FACEBOOK" || platformUpper === "INSTAGRAM" || platformUpper === "THREADS";
  const maxSteps = isMeta ? 4 : 3;
  const debugPrefix = `${platformUpper}-${Date.now()}`;

  const timeout = new Promise<OAuthResult>((resolve) => {
    setTimeout(() => resolve({ success: false, error: "OAuth flow timed out after 90s" }), 90000);
  });

  const flow = new Promise<OAuthResult>(async (resolve) => {
    let browser: Awaited<ReturnType<typeof getBrowser>> | null = null;
    try {
      browser = await getBrowser(platformUpper);
      const page = await browser.newPage();

      if (isMeta) {
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
        );
        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, "webdriver", { get: () => false });
          Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
          Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
        });
      }

      const puppeteerCookies = cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path || "/",
        expires: c.expires != null ? Math.floor(c.expires) : -1,
        httpOnly: false,
        secure: c.secure || false,
        sameSite: c.sameSite || "Lax" as const,
      }));
      await page.setCookie(...puppeteerCookies);

      await page.goto(oauthUrl, { waitUntil: "domcontentloaded", timeout: 25000 });

      if (isMeta) {
        try {
          await page.waitForSelector('body', { timeout: 5000 });
          await delay(2000);
        } catch {}
        const pageType = await detectPageType(page, config);
        if (pageType === "login") {
          await page.close();
          resolve({ success: false, error: `${platformUpper} cookies expired — login page detected, please refresh cookies` });
          return;
        }
      }

      for (let step = 0; step < maxSteps; step++) {
        await delay(isMeta ? 1500 : 1000);

        const currentUrl = page.url();

        if (currentUrl.includes("bundle.social")) {
          const urlParams = new URL(currentUrl).searchParams;
          if (urlParams.get("error")) {
            resolve({ success: false, error: urlParams.get("error") || "OAuth denied" });
            return;
          }
          await page.close();
          resolve({ success: true });
          return;
        }

        const { clicked, debug } = await findAndClickOAuthButton(page, config, debugPrefix);

        if (!clicked && step === 0) {
          const pageType = debug.pageType;
          const btnList = debug.visibleButtons.slice(0, 10).map((b: any) => `  [${b.tag}] ${b.text}`).join(" | ");
          const msg = `No OAuth button found on ${platformUpper} [page=${pageType}] ` +
            `Buttons on page: ${btnList || "(none)"}`;
          try {
            const dataDir = process.env.DATA_DIR || "/app/data";
            mkdirSync(join(dataDir, "oauth-debug"), { recursive: true });
            await page.screenshot({ path: join(dataDir, "oauth-debug", `${debugPrefix}-step${step}.png`), fullPage: false });
          } catch {}
          await page.close();
          resolve({ success: false, error: msg });
          return;
        }

        if (!clicked) break;

        try {
          await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 });
        } catch {
          await delay(isMeta ? 3000 : 2000);
        }
      }

      const finalUrl = page.url();
      if (finalUrl.includes("bundle.social")) {
        const urlParams = new URL(finalUrl).searchParams;
        if (urlParams.get("error")) {
          resolve({ success: false, error: urlParams.get("error") || "OAuth denied" });
          return;
        }
        await page.close();
        resolve({ success: true });
        return;
      }

      if (finalUrl.includes("error=")) {
        const urlParams = new URL(finalUrl).searchParams;
        resolve({ success: false, error: urlParams.get("error") || "OAuth denied" });
        return;
      }

      await page.close();
      resolve({ success: false, error: `OAuth incomplete — ended on ${new URL(finalUrl).hostname}` });
    } catch (e: any) {
      resolve({ success: false, error: e.message });
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch {}
      }
    }
  });

  return Promise.race([flow, timeout]);
}