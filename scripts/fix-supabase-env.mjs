import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const envPath = path.join(process.cwd(), ".env");
const mode = process.argv.includes("--pooler-only") ? "pooler-only" : "standard";
const text = readFileSync(envPath, "utf8");

function parseEnv(source) {
  const entries = new Map();
  const lines = source.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed
      .slice(index + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    entries.set(key, value);
  }

  return entries;
}

function normalizeUrl(raw, target) {
  const url = new URL(raw);

  if (!url.pathname || url.pathname === "/") {
    url.pathname = "/postgres";
  }

  if (target === "transaction") {
    if (!url.hostname.includes(".pooler.supabase.com")) {
      throw new Error(
        "Cannot derive a transaction pooler URL from a direct Supabase host. Paste the Supabase pooler URL into DATABASE_URL first.",
      );
    }

    url.port = "6543";
    url.searchParams.set("pgbouncer", "true");
    url.searchParams.set("connection_limit", "1");
    url.searchParams.delete("connect_timeout");
  }

  if (target === "session") {
    url.port = "5432";
    url.searchParams.delete("pgbouncer");
    url.searchParams.delete("connection_limit");
    url.searchParams.set("connect_timeout", "30");
  }

  return url.toString();
}

function upsertLine(source, key, value) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escaped}=.*$`, "m");
  const replacement = `${key}="${value}"`;

  if (pattern.test(source)) {
    return source.replace(pattern, replacement);
  }

  return `${source.trimEnd()}\n${replacement}\n`;
}

const env = parseEnv(text);
const baseUrl = env.get("DATABASE_URL") || env.get("DIRECT_URL");

if (!baseUrl) {
  console.error("DATABASE_URL or DIRECT_URL is required in .env before fixing.");
  process.exit(1);
}

let databaseUrl;
let directUrl;

try {
  databaseUrl = normalizeUrl(baseUrl, "transaction");
  directUrl =
    mode === "pooler-only"
      ? normalizeUrl(baseUrl, "transaction")
      : normalizeUrl(baseUrl, "session");
} catch (error) {
  console.error(`Could not parse database URL: ${error.message}`);
  process.exit(1);
}

let output = upsertLine(text, "DATABASE_URL", databaseUrl);
output = upsertLine(output, "DIRECT_URL", directUrl);
writeFileSync(envPath, output);

const database = new URL(databaseUrl);
const direct = new URL(directUrl);

console.log(".env updated without printing credentials.");
console.log(`DATABASE_URL -> ${database.hostname}:${database.port}`);
console.log(`DIRECT_URL -> ${direct.hostname}:${direct.port}`);

if (mode === "pooler-only") {
  console.log("Pooler-only mode uses port 6543 for both URLs as a network fallback.");
}
