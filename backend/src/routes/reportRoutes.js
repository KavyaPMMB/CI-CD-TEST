import { Router } from "express";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../../");

async function readJsonIfPresent(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function mapK6Summary(summary) {
  if (!summary?.metrics) return null;
  const metric = (key) => {
    const raw = summary.metrics[key] || {};
    return raw.values ? raw.values : raw;
  };
  const duration = metric("http_req_duration");
  const failed = metric("http_req_failed");
  const requests = metric("http_reqs");
  const p95 = duration["p(95)"] ?? null;
  const failedRate = failed.rate ?? failed.value ?? null;
  const isPassed =
    (typeof failedRate === "number" ? failedRate < 0.01 : false) &&
    (typeof p95 === "number" ? p95 < 800 : false);

  return {
    status: isPassed ? "passed" : "failed",
    thresholds: summary.metrics,
    stats: {
      avgMs: duration.avg ?? null,
      p90Ms: duration["p(90)"] ?? null,
      p95Ms: p95,
      maxMs: duration.max ?? null,
      failedRate,
      totalRequests: requests.count ?? null,
      requestRate: requests.rate ?? null,
    },
  };
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

router.get("/summary", async (_req, res) => {
  const backendReportPath = path.join(repoRoot, "tests", "results", "backend-report.json");
  const seleniumReportPath = path.join(repoRoot, "tests", "results", "selenium-report.json");
  const k6SummaryPath = path.join(repoRoot, "k6-summary.json");
  const k6HtmlPath = path.join(repoRoot, "k6-report.html");

  const [backendReport, seleniumReport, k6Summary, k6HtmlAvailable] = await Promise.all([
    readJsonIfPresent(backendReportPath),
    readJsonIfPresent(seleniumReportPath),
    readJsonIfPresent(k6SummaryPath),
    fileExists(k6HtmlPath),
  ]);

  const mappedK6 = mapK6Summary(k6Summary);
  res.json({
    generatedAt: new Date().toISOString(),
    reports: {
      backend: backendReport || { status: "not_run", message: "Run npm run test:backend:report" },
      selenium: seleniumReport || { status: "not_run", message: "Run npm run test:e2e" },
      k6: mappedK6 || { status: "not_run", message: "Run npm run test:load" },
    },
    assets: {
      k6HtmlAvailable,
      k6HtmlUrl: k6HtmlAvailable ? "/reports/k6-html" : null,
    },
  });
});

router.get("/k6-html", async (_req, res) => {
  const k6HtmlPath = path.join(repoRoot, "k6-report.html");
  try {
    await fs.access(k6HtmlPath);
    res.sendFile(k6HtmlPath);
  } catch {
    res.status(404).json({
      message: "k6-report.html not found. Generate it first, then refresh.",
    });
  }
});

export default router;
