import { useEffect, useMemo, useState } from "react";
import { BarChart3, RefreshCw, X } from "lucide-react";
import { api } from "../api/client.js";

function StatusBadge({ status }) {
  const styleByStatus = {
    passed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    failed: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
    not_run: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    running: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  };
  const className =
    styleByStatus[status] || "bg-slate-500/15 text-slate-700 dark:text-slate-300";

  return (
    <span className={`rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}>
      {status || "unknown"}
    </span>
  );
}

function ReportCard({ title, report, children }) {
  return (
    <article className="rounded-2xl border border-white/40 bg-white/50 p-4 dark:border-white/10 dark:bg-slate-900/50">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <StatusBadge status={report?.status} />
      </div>
      {report?.message ? (
        <p className="text-xs text-slate-600 dark:text-slate-400">{report.message}</p>
      ) : (
        children
      )}
    </article>
  );
}

export function TestReportsModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/reports/summary");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load test reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const reports = useMemo(() => data?.reports || {}, [data]);
  const k6Asset = useMemo(() => data?.assets || {}, [data]);
  const [showK6Frame, setShowK6Frame] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-3xl border border-white/40 bg-white/80 p-5 shadow-2xl dark:border-white/10 dark:bg-slate-950/90">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
              Quality Report
            </p>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              <BarChart3 className="h-5 w-5" />
              All Test Results
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              className="rounded-xl border border-white/50 bg-white/60 p-2 text-slate-700 transition hover:scale-105 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
              aria-label="Refresh test report"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/50 bg-white/60 p-2 text-slate-700 transition hover:scale-105 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
              aria-label="Close test report"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {error && <p className="mb-3 text-sm text-rose-600 dark:text-rose-300">{error}</p>}

        <div className="grid gap-3 md:grid-cols-3">
          <ReportCard title="Backend (Mocha)" report={reports.backend}>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Passed: {reports.backend?.stats?.passes ?? 0} | Failed: {reports.backend?.stats?.failures ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Duration: {Math.round(reports.backend?.stats?.duration || 0)} ms
            </p>
          </ReportCard>

          <ReportCard title="Selenium E2E" report={reports.selenium}>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Steps passed: {reports.selenium?.steps?.filter((s) => s.status === "passed")?.length ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Last step: {reports.selenium?.steps?.[reports.selenium?.steps?.length - 1]?.name || "N/A"}
            </p>
          </ReportCard>

          <ReportCard title="k6 Load Test" report={reports.k6}>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              p95: {Math.round(reports.k6?.stats?.p95Ms || 0)} ms
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Fail rate: {((reports.k6?.stats?.failedRate || 0) * 100).toFixed(2)}%
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!k6Asset.k6HtmlAvailable}
                onClick={() => setShowK6Frame((v) => !v)}
                className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showK6Frame ? "Hide k6 HTML" : "Show k6 HTML"}
              </button>
              {k6Asset.k6HtmlAvailable ? (
                <a
                  href={k6Asset.k6HtmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-300/70 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Open Full Page
                </a>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Generate `k6-report.html` first
                </span>
              )}
            </div>
          </ReportCard>
        </div>

        {showK6Frame && k6Asset.k6HtmlAvailable && (
          <section className="mt-4 overflow-hidden rounded-2xl border border-white/40 bg-white/50 dark:border-white/10 dark:bg-slate-900/50">
            <div className="border-b border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-white/10 dark:text-slate-300">
              k6 HTML Report Preview
            </div>
            <iframe
              title="k6 html report"
              src={k6Asset.k6HtmlUrl}
              className="h-[28rem] w-full bg-white"
            />
          </section>
        )}

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Updated: {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : "Not available"}
        </p>
      </div>
    </div>
  );
}
