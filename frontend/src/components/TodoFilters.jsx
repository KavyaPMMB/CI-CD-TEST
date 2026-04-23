import { motion } from "framer-motion";

const tabs = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
];

export function TodoFilters({ value, onChange, counts }) {
  return (
    <div className="relative flex rounded-2xl border border-white/40 bg-white/40 p-1 shadow-neu backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none dark:ring-1 dark:ring-white/10">
      {tabs.map((tab) => {
        const active = value === tab.id;
        const count =
          tab.id === "all"
            ? counts.all
            : tab.id === "pending"
              ? counts.pending
              : counts.completed;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="relative flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition dark:text-slate-300"
          >
            {active && (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-md"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <span
              className={[
                "relative z-10 flex items-center justify-center gap-1.5",
                active ? "text-white" : "",
              ].join(" ")}
            >
              {tab.label}
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-200",
                ].join(" ")}
              >
                {count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
