const ACTIVE_KEY_VERSION = process.env.ENCRYPTION_KEY_VERSION || "v1";

function loadKeyring(): Record<string, string> {
  let keys: Record<string, string> = {};
  if (process.env.ENCRYPTION_KEYS) {
    try {
      keys = JSON.parse(process.env.ENCRYPTION_KEYS);
    } catch {
      throw new Error("ENCRYPTION_KEYS must be a JSON object of version-to-secret entries");
    }
  }
  if (process.env.ENCRYPTION_KEY) keys[ACTIVE_KEY_VERSION] ||= process.env.ENCRYPTION_KEY;
  if (!keys[ACTIVE_KEY_VERSION]) throw new Error(`Encryption key ${ACTIVE_KEY_VERSION} is not configured`);
  return keys;
}

const keyring = loadKeyring();
const keyCache = new Map<string, CryptoKey>();

async function getKey(version: string): Promise<CryptoKey> {
  const secret = keyring[version];
  if (!secret) throw new Error(`Encryption key ${version} is unavailable`);
  const cached = keyCache.get(version);
  if (cached) return cached;
  const material = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  const key = await crypto.subtle.importKey("raw", material, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  keyCache.set(version, key);
  return key;
}

export function getActiveEncryptionVersion(): string {
  return ACTIVE_KEY_VERSION;
}

export function getEncryptedVersion(value: string): string | null {
  if (!value.startsWith("enc:")) return null;
  const parts = value.split(":", 3);
  return parts.length === 3 ? parts[1] : "v1";
}

export async function encrypt(text: string): Promise<string> {
  const key = await getKey(ACTIVE_KEY_VERSION);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text));
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return `enc:${ACTIVE_KEY_VERSION}:${btoa(String.fromCharCode(...combined))}`;
}

export async function decrypt(value: string): Promise<string> {
  if (!value.startsWith("enc:")) return value;
  const parts = value.split(":", 3);
  const version = parts.length === 3 ? parts[1] : "v1";
  const payload = parts.length === 3 ? parts[2] : value.slice(4);
  const key = await getKey(version);
  const combined = Uint8Array.from(atob(payload), (char) => char.charCodeAt(0));
  if (combined.length < 29) throw new Error("Encrypted credential is malformed");
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: combined.slice(0, 12) }, key, combined.slice(12)
  );
  return new TextDecoder().decode(decrypted);
}

export async function reencryptIfNeeded(value: string): Promise<string> {
  if (getEncryptedVersion(value) === ACTIVE_KEY_VERSION) return value;
  return encrypt(await decrypt(value));
}
