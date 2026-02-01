import { spawn } from "bun";
import crypto from "node:crypto";

// Types
interface ProviderStats {
  provider: string;
  weeklyLeftPercent: number;
  resetTime: string;
}

// Configuration
const COMMANDS = [
  { provider: "Codex", cmd: ["codexbar", "usage", "--provider", "codex", "--source", "auto"] },
  { provider: "Claude", cmd: ["codexbar", "usage", "--provider", "claude", "--source", "oauth"] },
  // { provider: "Gemini", cmd: ["codexbar", "usage", "--provider", "gemini", "--source", "auto"] },
];

const BAR_LENGTH = 10;
const BAR_FILLED_CHAR = "█";
const BAR_EMPTY_CHAR = "░";

async function runCommand(cmd: string[]): Promise<string> {
  try {
    const proc = spawn(cmd, {
      stdout: "pipe",
      stderr: "pipe",
    });

    const output = await new Response(proc.stdout).text();
    const error = await new Response(proc.stderr).text();

    // Wait for process to exit
    const exitCode = await proc.exited;

    if (exitCode !== 0) {
      console.warn(`Warning: Command '${cmd.join(" ")}' failed with code ${exitCode}. Stderr: ${error}`);
      return "";
    }
    return output;
  } catch (e) {
    console.warn(`Error running '${cmd.join(" ")}':`, e);
    return "";
  }
}

function parseOutput(providerName: string, output: string): ProviderStats | null {
  if (!output) return null;

  // 1. Find "Weekly: X% left"
  const weeklyMatch = output.match(/Weekly:\s*(\d+)%\s*left/i);
  if (!weeklyMatch) return null;
  const weeklyLeftPercent = parseInt(weeklyMatch[1], 10);

  // 2. Find "Resets in Xd Yh" (Looking for the reset time specifically associated with Weekly)
  // The example shows "Resets in ..." comes after "Weekly: ...".
  // We'll look for the 'Resets in' line that follows the Weekly line.
  const lines = output.split('\n');
  let foundWeekly = false;
  let resetTime = "unknown";

  for (const line of lines) {
    if (line.includes("Weekly:")) {
      foundWeekly = true;
      continue;
    }
    if (foundWeekly && line.trim().startsWith("Resets in")) {
      resetTime = line.trim().replace("Resets in", "").trim();
      break;
    }
  }

  // Format reset time to match example (remove spaces usually, e.g. "4d 18h" -> "4d18h")
  const formattedResetTime = resetTime.replace(/\s+/g, '');

  return {
    provider: providerName,
    weeklyLeftPercent,
    resetTime: formattedResetTime,
  };
}

function generateProgressBar(percentLeft: number): string {
  // User example: "0% left" -> 0% bar? Or is it inverted?
  // Usually a progress bar shows "Usage".
  // If 4% is left, usage is 96%.
  // However, the user example showed "0%[█░░░░░░░]" for "0% left" (or similar).
  // Let's assume the bar represents the *percentage displayed* (the text).
  // If the text says "4%", the bar should probably represent 4%.
  // BUT, looking at the user's example:
  // "Codex(4d18h) 0%[█░░░░░░░]" -> 0% text, 1 block? That's contradictory.
  // "Claude(1d5h) 1%[█░░░░░░░]" -> 1% text, 1 block.
  // I will assume the bar represents the *value displayed*.
  // And I will map 0-100 to 10 blocks.

  const filledCount = percentLeft <= 1 ? 0 : Math.min(BAR_LENGTH, Math.ceil((percentLeft / 100) * BAR_LENGTH));
  const emptyCount = BAR_LENGTH - filledCount;

  return `${BAR_FILLED_CHAR.repeat(filledCount)}${BAR_EMPTY_CHAR.repeat(emptyCount)}`;
}

function pctEncode(str) {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function buildOAuth1Header({
  method,
  url,
  params, // all request params that are being signed (body/query)
  consumerKey,
  consumerSecret,
  accessToken,
  accessTokenSecret,
}) {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  // 1) Merge OAuth params + request params for signing
  const all = { ...oauthParams, ...params };

  // 2) Create normalized parameter string
  const normalized = Object.entries(all)
    .map(([k, v]) => [pctEncode(k), pctEncode(String(v))])
    .sort(([ak, av], [bk, bv]) => (ak === bk ? (av < bv ? -1 : av > bv ? 1 : 0) : ak < bk ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  // 3) Signature base string
  const baseString = [
    method.toUpperCase(),
    pctEncode(url),
    pctEncode(normalized),
  ].join("&");

  // 4) Signing key
  const signingKey = `${pctEncode(consumerSecret)}&${pctEncode(accessTokenSecret)}`;

  // 5) Signature
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  const headerParams = { ...oauthParams, oauth_signature: signature };

  // 6) Build Authorization header
  const authHeader =
    "OAuth " +
    Object.entries(headerParams)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${pctEncode(k)}="${pctEncode(String(v))}"`)
      .join(", ");

  return authHeader;
}

async function updateProfileBio({ description }) {
  const endpoint = "https://api.x.com/1.1/account/update_profile.json";
  const method = "POST";

  // These params MUST match exactly what you send in the body
  const params = { description };

  const consumerKey = Bun.env.X_CONSUMER_KEY;
  const consumerSecret = Bun.env.X_CONSUMER_SECRET;
  const accessToken = Bun.env.X_ACCESS_TOKEN;
  const accessTokenSecret = Bun.env.X_ACCESS_TOKEN_SECRET;


  const authorization = buildOAuth1Header({
    method,
    url: endpoint,
    params,
    consumerKey,
    consumerSecret,
    accessToken,
    accessTokenSecret,
  });

  const body = new URLSearchParams(params);

  const res = await fetch(endpoint, {
    method,
    headers: {
      Authorization: authorization,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function main() {
  const results = await Promise.all(
    COMMANDS.map(async ({ provider, cmd }) => {
      const output = await runCommand(cmd);
      return parseOutput(provider, output);
    })
  );

  const lines = results
    .filter((r): r is ProviderStats => r !== null)
    .map(stat => {
      // User format: Codex 0%[█░░░░░░░] 4d18h
      const bar = generateProgressBar(stat.weeklyLeftPercent);
      return `${stat.provider} ${stat.weeklyLeftPercent}% ${bar} ⏳${stat.resetTime}`;
    });

  const finalString = lines.join("\n");

  console.log("--- Generated String ---");
  console.log(finalString);
  console.log("------------------------");


  // Placeholder Fetch Request
  try {

      const description = `${finalString}
talk to my agent. asyncpreneur. dad. builder. n=1.
co-founder @gankstergg, https://besthosting.network`;

console.log('Description:\n'+description);
console.log('length:',description.length);
      const response = await updateProfileBio({
        description: description
      });
    console.log(`Fetch status: ${response}`);
  } catch (error) {
    console.log("Fetch failed:", error);
  }
}

main();
