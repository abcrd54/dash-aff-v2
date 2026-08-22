const unsafePlaceholderValues = new Set([
  "dev-key",
  "change-this-to-a-random-key",
  "replace-with-your-provider-key",
]);

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim() || "";
  if (!value || unsafePlaceholderValues.has(value)) {
    throw new Error(`Required environment variable ${name} is missing or uses an example value`);
  }
  return value;
}

export function requiredHttpUrl(name: string): string {
  const value = requiredEnv(name).replace(/\/$/, "");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Required environment variable ${name} must be a valid URL`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Required environment variable ${name} must use http or https`);
  }
  return value;
}
