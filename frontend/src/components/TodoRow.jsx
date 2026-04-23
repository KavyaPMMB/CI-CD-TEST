import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Circle,
  GripVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export function TodoRow({
  todo,
  onToggle,
  onDelete,
  onSaveTitle,
  dragAttributes,
  dragListeners,
  setActivatorNodeRef,
  isDragging,
  sortableEnabled,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      setDraft(todo.title);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing, todo.title]);

  const commit = () => {
    const next = draft.trim();
    if (!next) {
      setDraft(todo.title);
      setEditing(false);
      return;
    }
    if (next !== todo.title) onSaveTitle(next);
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: isDragging ? 0.85 : 1,
        y: 0,
        scale: isDragging ? 1.02 : 1,
      }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className={[
        "group flex items-stretch gap-2 rounded-2xl border px-3 py-2.5 backdrop-blur-xl transition-shadow duration-300",
        "border-white/40 bg-white/55 shadow-glass dark:border-white/10 dark:bg-slate-900/50 dark:shadow-glass-lg",
        isDragging ? "z-10 shadow-glass-lg ring-2 ring-indigo-400/50" : "hover:shadow-glass-lg",
        todo.completed ? "opacity-75" : "",
      ].join(" ")}
    >
      {sortableEnabled && (
        <button
          type="button"
          className="mt-0.5 flex cursor-grab touch-none items-start rounded-lg p-1 text-slate-400 opacity-60 transition hover:bg-white/40 hover:text-slate-600 active:cursor-grabbing dark:hover:bg-white/10 dark:hover:text-slate-300"
          ref={setActivatorNodeRef}
          {...dragAttributes}
          {...dragListeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>
      )}

      <button
        type="button"
        onClick={() => onToggle(!todo.completed)}
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/60 text-indigo-500 shadow-neu transition hover:scale-105 active:shadow-neu-inset dark:bg-slate-800/80 dark:text-indigo-300 dark:shadow-none dark:ring-1 dark:ring-white/10"
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
      >
        {todo.completed ? (
          <Check className="h-5 w-5" strokeWidth={2.5} />
        ) : (
          <Circle className="h-5 w-5" strokeWidth={1.75} />
        )}
      </button>

      <div className="min-w-0 flex-1 py-1">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") {
                  setDraft(todo.title);
                  setEditing(false);
                }
              }}
              className="w-full rounded-xl border border-indigo-300/60 bg-white/90 px-3 py-2 text-sm text-slate-900 outline-none ring-2 ring-indigo-400/30 dark:border-indigo-500/40 dark:bg-slate-950/90 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={commit}
              className="rounded-lg bg-indigo-500 px-2 py-2 text-white shadow-md transition hover:bg-indigo-600"
              aria-label="Save"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(todo.title);
                setEditing(false);
              }}
              className="rounded-lg border border-slate-200/80 bg-white/80 p-2 text-slate-600 transition hover:bg-white dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onDoubleClick={() => setEditing(true)}
            className="block w-full text-left"
          >
            <span
              className={[
                "text-[0.95rem] font-medium leading-snug text-slate-800 transition dark:text-slate-100",
                todo.completed ? "line-through decoration-slate-400/80" : "",
              ].join(" ")}
            >
              {todo.title}
            </span>
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
              Double-click to edit
            </span>
          </button>
        )}
      </div>

      {!editing && (
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100 sm:opacity-100">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white/50 hover:text-indigo-600 dark:hover:bg-white/10 dark:hover:text-indigo-300"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete()}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
