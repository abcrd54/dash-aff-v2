import { getServiceBySlug } from "./config";

const PROXY_TIMEOUT_MS = 30000;

export function getServiceClient(slug: string) {
  const service = getServiceBySlug(slug);
  if (!service) {
    throw new Error(`Service "${slug}" not found`);
  }

  const makeUrl = (path: string) => `${service.base_url}${path}`;

  const doFetch = async (init: RequestInit) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
    try {
      const res = await fetch(init.url as string, { ...init, signal: controller.signal });
      return res;
    } catch (e: any) {
      if (e.name === "AbortError") throw new Error(`Request to "${slug}" timed out`);
      throw new Error(`Failed to connect to service "${slug}": ${e.message}`);
    } finally {
      clearTimeout(timer);
    }
  };

  return {
    fetch: async (path: string, init?: RequestInit) => {
      return doFetch({
        ...init,
        url: makeUrl(path),
        headers: {
          "Content-Type": "application/json",
          "x-api-key": service.api_key,
          ...init?.headers,
        },
      });
    },

    getJSON: async <T>(path: string): Promise<T> => {
      const res = await doFetch({
        method: "GET",
        url: makeUrl(path),
        headers: { "x-api-key": service.api_key },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Proxy error ${res.status}: ${text}`);
      }
      try {
        return await res.json() as T;
      } catch {
        throw new Error(`Service "${slug}" returned invalid JSON (status ${res.status})`);
      }
    },

    postJSON: async <T>(path: string, body: unknown): Promise<T> => {
      const res = await doFetch({
        method: "POST",
        url: makeUrl(path),
        headers: { "Content-Type": "application/json", "x-api-key": service.api_key },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Proxy error ${res.status}: ${text}`);
      }
      try {
        return await res.json() as T;
      } catch {
        throw new Error(`Service "${slug}" returned invalid JSON (status ${res.status})`);
      }
    },

    deleteJSON: async <T>(path: string): Promise<T> => {
      const res = await doFetch({
        method: "DELETE",
        url: makeUrl(path),
        headers: { "x-api-key": service.api_key },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Proxy error ${res.status}: ${text}`);
      }
      try {
        return await res.json() as T;
      } catch {
        throw new Error(`Service "${slug}" returned invalid JSON (status ${res.status})`);
      }
    },
  };
}
