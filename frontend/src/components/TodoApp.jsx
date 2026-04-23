import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ListTodo, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTodos } from "../hooks/useTodos.js";
import { TodoFilters } from "./TodoFilters.jsx";
import { SortableTodoRow } from "./SortableTodoRow.jsx";
import { TodoRow } from "./TodoRow.jsx";
import { ThemeToggle } from "./ThemeToggle.jsx";

function sortTodos(list) {
  return [...list].sort((a, b) => {
    const ao = a.order ?? 0;
    const bo = b.order ?? 0;
    if (ao !== bo) return ao - bo;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}

export function TodoApp({ theme, onToggleTheme, user, onLogout }) {
  const {
    todos,
    loading,
    error,
    refetch,
    createTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
  } = useTodos();
  const [filter, setFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const sorted = useMemo(() => sortTodos(todos), [todos]);

  const filtered = useMemo(() => {
    if (filter === "completed") return sorted.filter((t) => t.completed);
    if (filter === "pending") return sorted.filter((t) => !t.completed);
    return sorted;
  }, [sorted, filter]);

  const counts = useMemo(
    () => ({
      all: sorted.length,
      pending: sorted.filter((t) => !t.completed).length,
      completed: sorted.filter((t) => t.completed).length,
    }),
    [sorted]
  );

  const sortableIds = useMemo(() => filtered.map((t) => t._id), [filtered]);

  const onAdd = async (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t || submitting) return;
    setSubmitting(true);
    try {
      await createTodo(t);
      setTitle("");
      toast.success("Task added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add task");
    } finally {
      setSubmitting(false);
    }
  };

  const onToggle = async (id, completed) => {
    try {
      await updateTodo(id, { completed });
      toast.success(completed ? "Marked complete" : "Marked pending");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const onSaveTitle = async (id, nextTitle) => {
    try {
      await updateTodo(id, { title: nextTitle });
      toast.success("Task updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save");
    }
  };

  const onDelete = async (id) => {
    try {
      await deleteTodo(id);
      toast.success("Task removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleDragEnd = async (event) => {
    if (filter !== "all") return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortableIds.indexOf(active.id);
    const newIndex = sortableIds.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const nextIds = arrayMove(sortableIds, oldIndex, newIndex);
    try {
      await reorderTodos(nextIds);
      toast.success("Order saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reorder failed");
      refetch();
    }
  };

  const listSection = (
    <AnimatePresence mode="popLayout">
      {filtered.length === 0 && !loading ? (
        <motion.div
          key="empty"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/50 bg-white/30 px-8 py-16 text-center dark:border-white/15 dark:bg-slate-900/30"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-indigo-600 dark:text-indigo-300">
            <ListTodo className="h-8 w-8" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">
              {error ? "Something went wrong" : "Nothing here yet"}
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
              {error
                ? error
                : filter === "all"
                  ? "Add your first task above. Drag handles appear here to reorder when viewing all tasks."
                  : filter === "completed"
                    ? "No completed tasks. Finish something to see it here."
                    : "All caught up — no pending tasks."}
            </p>
            {error && (
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500"
              >
                Retry
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3" role="list">
          {filter === "all" ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                {filtered.map((todo) => (
                  <div key={todo._id} role="listitem">
                    <SortableTodoRow
                      id={todo._id}
                      todo={todo}
                      onToggle={(c) => onToggle(todo._id, c)}
                      onDelete={() => onDelete(todo._id)}
                      onSaveTitle={(next) => onSaveTitle(todo._id, next)}
                    />
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            filtered.map((todo) => (
              <motion.div
                key={todo._id}
                layout
                role="listitem"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                <TodoRow
                  todo={todo}
                  onToggle={(c) => onToggle(todo._id, c)}
                  onDelete={() => onDelete(todo._id)}
                  onSaveTitle={(next) => onSaveTitle(todo._id, next)}
                  sortableEnabled={false}
                />
              </motion.div>
            ))
          )}
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-10 sm:pt-14">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          {/* <p className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-indigo-600/90 dark:text-indigo-300/90">
            <Sparkles className="h-4 w-4" />
            MERN demo
          </p> */}
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Focus Todos
          </h1>
          {/* <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Glassmorphic UI, smooth motion, drag to reorder on the All tab, and a tiny Express API on MongoDB.
          </p> */}
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Signed in as {user?.name || user?.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            data-testid="logout-button"
            type="button"
            onClick={onLogout}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 bg-white/50 text-slate-600 shadow-glass backdrop-blur-xl transition hover:scale-105 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 dark:shadow-glass-lg"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <section className="rounded-[1.75rem] border border-white/50 bg-white/45 p-5 shadow-glass-lg backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/45 sm:p-6">
        <form onSubmit={onAdd} className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            data-testid="todo-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            className="flex-1 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-medium text-slate-900 shadow-inner outline-none ring-indigo-400/0 transition placeholder:text-slate-400 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            data-testid="add-todo-button"
            type="submit"
            disabled={submitting || !title.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Add task"
            )}
          </button>
        </form>

        <div className="mb-6">
          <TodoFilters value={filter} onChange={setFilter} counts={counts} />
          {filter !== "all" && (
            <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              Reordering is available on the <span className="font-semibold">All</span> tab.
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading your tasks…</p>
          </div>
        ) : (
          listSection
        )}
      </section>
    </div>
  );
}
