import { requiredEnv, requiredHttpUrl } from "./env";

export interface ServiceConfig {
  slug: string;
  base_url: string;
  api_key: string;
}

function services(): ServiceConfig[] {
  return [{
    slug: "aff-personal",
    base_url: requiredHttpUrl("PERSONA_SERVICE_URL"),
    api_key: requiredEnv("PERSONA_SERVICE_API_KEY"),
  }];
}

export function getServices(): ServiceConfig[] {
  return services();
}

export function getServiceBySlug(slug: string): ServiceConfig | undefined {
  return services().find((s) => s.slug === slug);
}
