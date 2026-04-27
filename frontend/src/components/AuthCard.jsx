import { useState } from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api/client.js";
import { hasSupabaseConfig, supabase } from "../lib/supabase.js";

export function AuthCard({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (!hasSupabaseConfig || !supabase) {
        const endpoint = isRegister ? "/auth/register" : "/auth/login";
        const payload = isRegister ? { name, email, password } : { email, password };
        const { data } = await api.post(endpoint, payload);
        onAuthenticated?.(data);
        toast.success(isRegister ? "Account created (backend auth mode)" : "Welcome back");
        return;
      }

      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        toast.success("Account created. Check email if confirmation is enabled.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (err) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md items-center px-4 py-10">
      <section className="w-full rounded-[1.75rem] border border-white/50 bg-white/50 p-6 shadow-glass-lg backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/45 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
          MERN demo
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isRegister ? "Create your account" : "Sign in to Skynetclouds Todos"}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {isRegister
            ? "Register a demo account and start managing tasks."
            : "Use your account to access your personal todo list."}
        </p>
        {!hasSupabaseConfig && (
          <p className="mt-2 rounded-xl border border-amber-300/40 bg-amber-100/70 px-3 py-2 text-xs text-amber-800 dark:border-amber-300/20 dark:bg-amber-500/10 dark:text-amber-200">
            Supabase env is missing, so this app is using backend JWT auth fallback mode.
          </p>
        )}

        <form onSubmit={submit} className="mt-6 space-y-3">
          {isRegister && (
            <input
              data-testid="auth-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-medium text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100"
              required
            />
          )}
          <input
            data-testid="auth-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-medium text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100"
            required
          />
          <input
            data-testid="auth-password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-medium text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100"
            minLength={6}
            required
          />

          <button
            data-testid="auth-submit-button"
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isRegister ? (
              <UserPlus className="h-4 w-4" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          data-testid="auth-toggle-button"
          type="button"
          onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
          className="mt-4 text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300"
        >
          {isRegister ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </section>
    </div>
  );
}
