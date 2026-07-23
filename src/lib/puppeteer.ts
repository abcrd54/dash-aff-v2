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

interface PlatformOAuthConfig {
  buttons: string[];
  selectors?: string[];
  loginIndicators?: string[];
}

const PLATFORM_OAUTH: Record<string, PlatformOAuthConfig> = {
  FACEBOOK: {
    buttons: ["continue as", "continue", "authorize", "allow", "accept"],
    selectors: [
      'div[aria-label="Continue as"]',
      'div[aria-label="Continue"]',
      'button[name="__CONFIRM__"]',
      'div[role="button"]:not([aria-label="Close"])',
    ],
    loginIndicators: ["email", "pass", "login", "log in"],
  },
  INSTAGRAM: {
    buttons: ["continue as", "continue", "authorize", "allow", "accept"],
    selectors: [
      'div[aria-label="Continue as"]',
      'button[type="submit"]',
      'div[role="button"]:not([aria-label="Close"])',
    ],
    loginIndicators: ["username", "password", "log in", "sign up"],
  },
  TWITTER: {
    buttons: ["authorize app", "authorize", "allow"],
  },
  LINKEDIN: {
    buttons: ["allow", "authorize", "accept"],
  },
  GOOGLE_BUSINESS: {
    buttons: ["continue", "allow", "authorize", "accept"],
  },
  YOUTUBE: {
    buttons: ["continue", "allow", "authorize", "accept"],
  },
  TIKTOK: {
    buttons: ["authorize", "allow", "accept", "confirm"],
  },
  PINTEREST: {
    buttons: ["authorize", "allow", "accept", "give access"],
  },
  REDDIT: {
    buttons: ["allow", "authorize", "accept"],
  },
  DISCORD: {
    buttons: ["authorize", "allow"],
  },
  SLACK: {
    buttons: ["allow", "authorize"],
  },
  THREADS: {
    buttons: ["continue as", "continue", "authorize", "allow"],
    selectors: [
      'div[aria-label="Continue as"]',
      'div[role="button"]:not([aria-label="Close"])',
    ],
    loginIndicators: ["username", "password", "log in"],
  },
  MASTODON: {
    buttons: ["authorize", "allow"],
  },
  BLUESKY: {
    buttons: ["authorize", "allow", "accept"],
  },
  SNAPCHAT: {
    buttons: ["continue", "authorize", "allow"],
  },
};

const DEFAULT_OAUTH: PlatformOAuthConfig = {
  buttons: ["authorize", "allow", "accept", "continue", "confirm"],
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
  return puppeteer.launch({ headless: true, args });
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function findOAuthButton(page: any, config: PlatformOAuthConfig): Promise<boolean> {
  const buttons = config.buttons || [];
  const selectors = config.selectors || [];

  if (selectors.length > 0) {
    const found = await page.evaluate((sels: string[]) => {
      for (const sel of sels) {
        try {
          const el = document.querySelector(sel);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              (el as HTMLElement).click();
              return true;
            }
          }
        } catch {}
      }
      return false;
    }, selectors);
    if (found) return true;
  }

  return page.evaluate((btns: string[]) => {
    const all = Array.from(
      document.querySelectorAll(
        'button, input[type="submit"], a[role="button"], div[role="button"], span[role="button"]'
      )
    ) as HTMLElement[];

    const visible = all.filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

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
}

async function isLoginPage(page: any, config: PlatformOAuthConfig): Promise<boolean> {
  const indicators = config.loginIndicators || [];
  if (indicators.length === 0) return false;
  return page.evaluate((ind: string[]) => {
    const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]'));
    const hasInputs = inputs.some((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    if (!hasInputs) return false;
    const body = (document.body.textContent || "").toLowerCase();
    return ind.some((word) => body.includes(word));
  }, indicators);
}

export async function runOAuthFlow(
  oauthUrl: string,
  cookies: BrowserCookie[],
  platform: string
): Promise<OAuthResult> {
  let browser: Awaited<ReturnType<typeof getBrowser>> | null = null;
  const platformUpper = platform.toUpperCase();
  const config = PLATFORM_OAUTH[platformUpper] || DEFAULT_OAUTH;
  const isMeta = platformUpper === "FACEBOOK" || platformUpper === "INSTAGRAM" || platformUpper === "THREADS";
  const maxSteps = isMeta ? 4 : 3;

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

    await page.goto(oauthUrl, { waitUntil: "networkidle2", timeout: 30000 });

    if (isMeta) {
      await delay(2000);
      const isLogin = await isLoginPage(page, config);
      if (isLogin) {
        await page.close();
        return { success: false, error: `${platformUpper} cookies expired — login page detected, please refresh cookies` };
      }
    }

    for (let step = 0; step < maxSteps; step++) {
      await delay(isMeta ? 1500 : 1000);

      const currentUrl = page.url();

      if (currentUrl.includes("bundle.social")) {
        const urlParams = new URL(currentUrl).searchParams;
        if (urlParams.get("error")) {
          return { success: false, error: urlParams.get("error") || "OAuth denied" };
        }
        await page.close();
        return { success: true };
      }

      const buttonClicked = await findOAuthButton(page, config);

      if (!buttonClicked && step === 0) {
        await page.close();
        return { success: false, error: `No OAuth button found on ${platformUpper} — cookies may be expired or platform requires manual auth` };
      }

      if (!buttonClicked) break;

      try {
        await page.waitForNavigation({ waitUntil: "networkidle2", timeout: isMeta ? 20000 : 15000 });
      } catch {
        await delay(isMeta ? 3000 : 2000);
      }
    }

    const finalUrl = page.url();
    if (finalUrl.includes("bundle.social")) {
      const urlParams = new URL(finalUrl).searchParams;
      if (urlParams.get("error")) {
        return { success: false, error: urlParams.get("error") || "OAuth denied" };
      }
      await page.close();
      return { success: true };
    }

    if (finalUrl.includes("error=")) {
      const urlParams = new URL(finalUrl).searchParams;
      return { success: false, error: urlParams.get("error") || "OAuth denied" };
    }

    await page.close();
    return { success: false, error: `OAuth incomplete — ended on ${new URL(finalUrl).hostname}` };
  } catch (e: any) {
    return { success: false, error: e.message };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}