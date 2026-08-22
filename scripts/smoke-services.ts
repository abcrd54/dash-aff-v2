import { requiredEnv, requiredHttpUrl } from "../src/lib/env";

interface Probe {
  name: string;
  url: string;
  apiKey?: string;
}

const probes: Probe[] = [
  { name: "kumux-mail", url: `${requiredHttpUrl("KUMAIL_URL")}/api/metrics`, apiKey: requiredEnv("KUMAIL_API_KEY") },
  { name: "persona", url: `${requiredHttpUrl("PERSONA_SERVICE_URL")}/api/personas`, apiKey: requiredEnv("PERSONA_SERVICE_API_KEY") },
  { name: "kumavps", url: `${requiredHttpUrl("BUNSOCIAL_URL")}/api/health`, apiKey: requiredEnv("BUNSOCIAL_API_KEY") },
];

let failed = false;
for (const probe of probes) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(probe.url, {
      headers: probe.apiKey ? { "x-api-key": probe.apiKey } : undefined,
      signal: controller.signal,
    });
    console.log(`${probe.name}=${response.status}`);
    if (!response.ok) failed = true;
  } catch (error: any) {
    failed = true;
    console.error(`${probe.name}=ERROR ${error.name === "AbortError" ? "timeout" : error.message}`);
  } finally {
    clearTimeout(timeout);
  }
}

if (failed) process.exit(1);
