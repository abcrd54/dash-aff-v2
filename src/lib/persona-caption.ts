import { getServiceClient } from "./proxy";

interface GeneratePersonaCaptionInput {
  personaId: string;
  groupName: string;
  topic: string;
  niche?: string;
  affiliateLink?: string;
}

interface PersonaCaptionResponse {
  captions?: unknown;
}

const clean = (value: string, maxLength: number) => value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLength);

export function buildPersonaCaptionContext(input: GeneratePersonaCaptionInput): string {
  const groupName = clean(input.groupName, 200);
  const niche = clean(input.niche || "", 300);
  const topic = clean(input.topic, 2000);
  const affiliateLink = clean(input.affiliateLink || "", 1000);
  return [
    `Grup tujuan: ${groupName}`,
    niche ? `Niche grup: ${niche}` : "",
    `Topik atau produk: ${topic}`,
    affiliateLink ? `Link affiliate: ${affiliateLink}` : "",
    "Hasil harus berupa caption final yang siap diposting, tanpa pembuka atau penjelasan tambahan.",
  ].filter(Boolean).join("\n");
}

export function extractPersonaCaption(result: PersonaCaptionResponse): string {
  return Array.isArray(result.captions) && typeof result.captions[0] === "string"
    ? result.captions[0].trim()
    : "";
}

export async function generatePersonaCaption(input: GeneratePersonaCaptionInput): Promise<string> {
  const client = getServiceClient("aff-personal");
  const result = await client.postJSON<PersonaCaptionResponse>("/api/content/generate-caption", {
    personaId: input.personaId,
    topic: buildPersonaCaptionContext(input),
    mode: "affiliate",
    count: 1,
  });

  const caption = extractPersonaCaption(result);
  if (!caption) throw new Error("Persona tidak menghasilkan caption yang valid");
  return caption;
}
