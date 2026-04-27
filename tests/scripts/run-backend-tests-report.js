import { spawn } from "node:child_process";
import path from "node:path";
import { promises as fs } from "node:fs";

const mochaBin = path.resolve(process.cwd(), "backend", "node_modules", "mocha", "bin", "mocha.js");
const reportDir = path.resolve(process.cwd(), "tests", "results");
const reportPath = path.join(reportDir, "backend-report.json");

async function run() {
  const startedAt = new Date().toISOString();
  const args = [
    mochaBin,
    "backend/test/**/*.test.js",
    "--timeout",
    "300000",
    "--exit",
    "--reporter",
    "json",
  ];

  const child = spawn(process.execPath, args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || "test",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const exitCode = await new Promise((resolve) => {
    child.on("close", resolve);
  });

  let parsed = null;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    parsed = null;
  }

  const report = {
    test: "backend-mocha",
    status: exitCode === 0 ? "passed" : "failed",
    startedAt,
    finishedAt: new Date().toISOString(),
    stats: parsed?.stats || null,
    tests: parsed?.tests?.map((t) => ({
      title: t.fullTitle || t.title,
      duration: t.duration,
    })) || [],
    failures: parsed?.failures?.map((f) => ({
      title: f.fullTitle || f.title,
      error: f.err?.message || "Test failure",
    })) || [],
    stderr: stderr.trim() || null,
  };

  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  if (parsed?.stats) {
    console.log(
      `Backend report saved: ${parsed.stats.passes} passed, ${parsed.stats.failures} failed.`
    );
  } else {
    console.log("Backend report saved (raw output not parseable as JSON).");
  }

  if (exitCode !== 0) {
    if (stderr.trim()) process.stderr.write(`${stderr.trim()}\n`);
    if (!parsed && stdout.trim()) process.stderr.write(`${stdout.trim()}\n`);
    process.exit(exitCode);
  }
}

run().catch((err) => {
  console.error("Failed to run backend test report:", err?.message || err);
  process.exit(1);
});
