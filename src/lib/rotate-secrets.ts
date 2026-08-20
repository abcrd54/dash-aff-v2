import { getDB } from "../db";
import { reencryptIfNeeded } from "./encrypt";

export async function rotateStoredSecrets(): Promise<number> {
  const db = getDB();
  const rows = db.query("SELECT id, password, access_token, api_key FROM affiliate_accounts").all() as Array<{
    id: number; password: string | null; access_token: string | null; api_key: string | null;
  }>;
  let changes = 0;
  for (const row of rows) {
    const password = row.password ? await reencryptIfNeeded(row.password) : null;
    const accessToken = row.access_token ? await reencryptIfNeeded(row.access_token) : null;
    const apiKey = row.api_key ? await reencryptIfNeeded(row.api_key) : null;
    if (password !== row.password || accessToken !== row.access_token || apiKey !== row.api_key) {
      db.query("UPDATE affiliate_accounts SET password = ?, access_token = ?, api_key = ? WHERE id = ?")
        .run(password, accessToken, apiKey, row.id);
      changes++;
    }
  }
  return changes;
}
