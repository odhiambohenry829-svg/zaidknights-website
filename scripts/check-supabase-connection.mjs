import { readFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import process from "node:process";

const envPath = path.join(process.cwd(), ".env");
const envText = readFileSync(envPath, "utf8");

const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      const key = line.slice(0, index).trim();
      const value = line
        .slice(index + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");

      return [key, value];
    }),
);

const vars = ["DATABASE_URL", "DIRECT_URL"];

function inspectUrl(name) {
  const value = env[name];

  if (!value) {
    return { name, error: "missing" };
  }

  try {
    const url = new URL(value);

    return {
      name,
      protocol: url.protocol,
      username: url.username ? `${url.username.slice(0, 12)}...` : "(none)",
      host: url.hostname,
      port: Number(url.port || 5432),
      database: url.pathname.replace(/^\//, "") || "(none)",
      pgbouncer: url.searchParams.get("pgbouncer") || "(not set)",
      connectTimeout: url.searchParams.get("connect_timeout") || "(not set)",
    };
  } catch (error) {
    return { name, error: error.message };
  }
}

function canReach(host, port, timeout = 8000) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const startedAt = Date.now();

    socket.setTimeout(timeout);

    socket.once("connect", () => {
      socket.destroy();
      resolve({ ok: true, ms: Date.now() - startedAt });
    });

    socket.once("timeout", () => {
      socket.destroy();
      resolve({ ok: false, reason: `timeout after ${timeout}ms` });
    });

    socket.once("error", (error) => {
      resolve({ ok: false, reason: error.code || error.message });
    });
  });
}

const inspected = vars.map(inspectUrl);

for (const item of inspected) {
  console.log(`\n${item.name}`);

  if (item.error) {
    console.log(`  error: ${item.error}`);
    continue;
  }

  console.log(`  host: ${item.host}`);
  console.log(`  port: ${item.port}`);
  console.log(`  database: ${item.database}`);
  console.log(`  username: ${item.username}`);
  console.log(`  pgbouncer: ${item.pgbouncer}`);
  console.log(`  connect_timeout: ${item.connectTimeout}`);
}

for (const item of inspected.filter((item) => !item.error)) {
  const result = await canReach(item.host, item.port);
  const status = result.ok ? `reachable in ${result.ms}ms` : `not reachable (${result.reason})`;
  console.log(`\n${item.name} ${item.host}:${item.port} is ${status}`);
}

console.log("\nNo passwords or full connection strings were printed.");
