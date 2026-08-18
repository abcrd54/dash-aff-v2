const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

function getKey(): CryptoKey {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(ENCRYPTION_KEY!).slice(0, 32);
  return crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

let cachedKey: CryptoKey | null = null;

async function ensureKey(): Promise<CryptoKey | null> {
  if (!ENCRYPTION_KEY) {
    console.warn("[encrypt] ENCRYPTION_KEY not set — encryption disabled");
    return null;
  }
  if (!cachedKey) {
    cachedKey = await getKey();
  }
  return cachedKey;
}

export async function encrypt(text: string): Promise<string> {
  const key = await ensureKey();
  if (!key) return text;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(text)
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return "enc:" + btoa(String.fromCharCode(...combined));
}

export async function decrypt(encrypted: string): Promise<string> {
  if (!encrypted.startsWith("enc:")) return encrypted;
  const key = await ensureKey();
  if (!key) return encrypted.slice(4);
  const combined = Uint8Array.from(atob(encrypted.slice(4)), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}