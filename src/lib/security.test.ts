import { describe, expect, test } from "bun:test";
import { decrypt, encrypt, getActiveEncryptionVersion, getEncryptedVersion, reencryptIfNeeded } from "./encrypt";
import { createSessionCookie, verifySessionCookie } from "../middleware/auth";

describe("credential encryption", () => {
  test("round-trips using authenticated versioned encryption", async () => {
    const ciphertext = await encrypt("sensitive-value");
    expect(ciphertext).not.toContain("sensitive-value");
    expect(getEncryptedVersion(ciphertext)).toBe(getActiveEncryptionVersion());
    expect(await decrypt(ciphertext)).toBe("sensitive-value");
    expect(await reencryptIfNeeded(ciphertext)).toBe(ciphertext);
  });

  test("rejects a modified ciphertext", async () => {
    const ciphertext = await encrypt("sensitive-value");
    const tampered = ciphertext.slice(0, -1) + (ciphertext.endsWith("A") ? "B" : "A");
    expect(decrypt(tampered)).rejects.toThrow();
  });
});

describe("signed sessions", () => {
  const user = { id: 7, username: "tester", role: "user", email: "t@example.com", session_version: 3 };

  test("accepts an intact unexpired session", async () => {
    const payload = await verifySessionCookie(await createSessionCookie(user, 60));
    expect(payload?.id).toBe(user.id);
    expect(payload?.sv).toBe(user.session_version);
  });

  test("rejects tampering and expiration", async () => {
    const cookie = await createSessionCookie(user, 60);
    expect(await verifySessionCookie(cookie + "x")).toBeNull();
    expect(await verifySessionCookie(await createSessionCookie(user, -1))).toBeNull();
  });
});
