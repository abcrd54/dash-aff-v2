export interface ServiceConfig {
  slug: string;
  base_url: string;
  api_key: string;
}

const services: ServiceConfig[] = [
  {
    slug: "aff-personal",
    base_url: process.env.PERSONA_SERVICE_URL || "",
    api_key: process.env.PERSONA_SERVICE_API_KEY || "",
  },
].filter((s) => s.base_url && s.api_key);

export function getServices(): ServiceConfig[] {
  return services;
}

export function getServiceBySlug(slug: string): ServiceConfig | undefined {
  return services.find((s) => s.slug === slug);
}