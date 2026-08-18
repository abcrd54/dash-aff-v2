import { generateMailbox, checkMessages, getMessageDetail } from "./kumail";
import { signup, getToken, getUserMe, setupProfile, createApiKey, createTeam } from "./bunsocial";
import { createAffiliateAccount, updateAffiliateAccount } from "./db";

interface OnboardingData {
  user_id: number;
  name: string;
  email_domain: string;
  password: string;
  first_name: string;
  last_name: string;
  org_name: string;
  timezone: string;
  identity: string;
}

interface BatchEvent {
  accountIndex: number;
  accountName: string;
  step: string;
  status: string;
  detail?: string;
}

const FIRST_NAMES = [
  "Adi", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hadi",
  "Indah", "Joko", "Kartika", "Lina", "Maya", "Nina", "Oka", "Putri",
  "Rina", "Sari", "Tina", "Umar", "Vina", "Wati", "Yoga", "Zara",
];

const LAST_NAMES = [
  "Santoso", "Wijaya", "Kusuma", "Pratama", "Hartono", "Saputra",
  "Nugroho", "Hidayat", "Rahman", "Putra", "Sari", "Lestari",
  "Anggraini", "Susanti", "Firmansyah", "Gunawan",
];

const ORG_SUFFIXES = [
  "Digital", "Creative", "Media", "Studio", "Agency", "Solutions",
  "Tech", "Innovation", "Lab", "Works",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function randomPassword(): string {
  return randomString(12);
}

function generateAccountData(userId: number, index: number, identity: string): OnboardingData {
  const suffix = randomString(4).toUpperCase();
  const firstName = randomItem(FIRST_NAMES);
  const lastName = randomItem(LAST_NAMES);
  const orgSuffix = randomItem(ORG_SUFFIXES);

  return {
    user_id: userId,
    name: `BSOC-${suffix}`,
    email_domain: randomItem(["icloud", "outlook", "hotmail", "gmail"]),
    password: randomPassword(),
    first_name: firstName,
    last_name: lastName,
    org_name: `${firstName} ${orgSuffix}`,
    timezone: "Asia/Jakarta",
    identity,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function* runSingleOnboarding(
  data: OnboardingData,
  accountIndex: number,
  accountName: string,
  signal?: AbortSignal
): AsyncGenerator<BatchEvent> {
  let accountId: number | null = null;
  const passwordHash = await Bun.password.hash(data.password, "bcrypt");

  const emit = (step: string, status: string, detail?: string): BatchEvent => ({
    accountIndex,
    accountName,
    step,
    status,
    detail,
  });

  const checkAbort = () => {
    if (signal?.aborted) {
      throw new Error("ABORT: Process cancelled");
    }
  };

  try {
    checkAbort();
    yield emit("generate_email", "running", "Generating disposable email...");
    const email = await generateMailbox([data.email_domain]);
    checkAbort();
    yield emit("generate_email", "done", email);

    const account = createAffiliateAccount({
      user_id: data.user_id,
      name: email,
      email,
      password_hash: passwordHash,
      first_name: data.first_name,
      last_name: data.last_name,
      org_name: data.org_name,
      timezone: data.timezone,
      identity: data.identity,
    });
    accountId = account.id;
    updateAffiliateAccount(accountId, { status: "email_created" });

    checkAbort();
    yield emit("signup", "running", "Registering account...");
    await signup(email, data.password);
    checkAbort();
    yield emit("signup", "done", "Account registered");
    updateAffiliateAccount(accountId, { status: "signed_up" });

    checkAbort();
    yield emit("poll_inbox", "running", "Waiting for verification email...");
    updateAffiliateAccount(accountId, { status: "waiting_email" });

    let verifyUrl: string | null = null;
    for (let attempt = 1; attempt <= 12; attempt++) {
      checkAbort();
      yield emit("poll_inbox", "running", `Checking inbox... (attempt ${attempt}/12)`);

      const messages = await checkMessages(email);
      for (const msg of messages) {
        if (msg.subject.toLowerCase().includes("confirm") || msg.subject.toLowerCase().includes("verify")) {
          const detail = await getMessageDetail(email, msg.id);
          const match = detail.html.match(/https?:\/\/[^\s"'<>]+type=signup[^\s"'<>]*/i);
          if (match) {
            verifyUrl = match[0].replace(/&amp;/g, "&");
            break;
          }
        }
      }
      if (verifyUrl) break;
      await delay(5000);
    }

    if (!verifyUrl) {
      throw new Error("Verification email not found after 12 attempts");
    }
    checkAbort();
    yield emit("poll_inbox", "done", "Verification link found");

    checkAbort();
    yield emit("verify_link", "running", "Verifying email...");
    await fetch(verifyUrl);
    checkAbort();
    yield emit("verify_link", "done", "Email verified");
    updateAffiliateAccount(accountId, { status: "verified" });

    checkAbort();
    yield emit("get_token", "running", "Getting access token...");
    const tokenRes = await getToken(email, data.password);
    const accessToken = tokenRes.data.accessToken;
    checkAbort();
    yield emit("get_token", "done", "Access token obtained");
    updateAffiliateAccount(accountId, { access_token: accessToken, status: "token_obtained" });

    checkAbort();
    yield emit("setup_profile", "running", "Setting up profile...");
    await setupProfile(accessToken, {
      firstName: data.first_name,
      lastName: data.last_name,
      organizationName: data.org_name,
      timezone: data.timezone,
    });
    checkAbort();
    yield emit("setup_profile", "done", "Profile setup complete");
    updateAffiliateAccount(accountId, { status: "setup_done" });

    checkAbort();
    yield emit("get_org", "running", "Getting organization ID...");
    const userMe = await getUserMe(accessToken);
    const orgId = userMe.data.organizationId;
    checkAbort();
    yield emit("get_org", "done", `Organization: ${orgId}`);
    updateAffiliateAccount(accountId, { org_id: orgId, status: "org_obtained" });

    checkAbort();
    yield emit("create_api_key", "running", "Creating API key...");
    const keyRes = await createApiKey(accessToken, orgId, data.name);
    checkAbort();
    yield emit("create_api_key", "done", keyRes.data.key);
    updateAffiliateAccount(accountId, {
      api_key: keyRes.data.key,
      api_key_id: keyRes.data.id,
      status: "api_key_created",
    });

    checkAbort();
    yield emit("create_team", "running", "Creating team...");
    const team = await createTeam(keyRes.data.key, `${data.org_name} Team`);
    checkAbort();
    yield emit("create_team", "done", `Team "${team.name}" created (${team.id})`);
    updateAffiliateAccount(accountId, {
      team_id: team.id,
      status: "done",
    });

    checkAbort();
    yield emit("complete", "done", "Onboarding complete!");
  } catch (e: any) {
    if (accountId) {
      const finalStatus = e.message?.startsWith("ABORT:") ? "cancelled" : "failed";
      updateAffiliateAccount(accountId, { status: finalStatus, error: e.message });
    }
    const finalStatus = e.message?.startsWith("ABORT:") ? "cancelled" : "failed";
    yield emit("error", finalStatus, e.message);
  }
}

export async function* runBatchOnboarding(
  userId: number,
  count: number,
  identity: string,
  signal?: AbortSignal
): AsyncGenerator<BatchEvent> {
  for (let i = 0; i < count; i++) {
    if (signal?.aborted) {
      yield { accountIndex: i + 1, accountName: "System", step: "cancelled", status: "cancelled", detail: "Process cancelled" };
      break;
    }
    const data = generateAccountData(userId, i, identity);
    yield* runSingleOnboarding(data, i + 1, data.name, signal);
  }
}

export { runSingleOnboarding as runOnboarding };