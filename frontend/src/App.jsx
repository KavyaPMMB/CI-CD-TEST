import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { api, setAuthToken } from "./api/client.js";
import { AuthCard } from "./components/AuthCard.jsx";
import { ParticlesBackground } from "./components/ParticlesBackground.jsx";
import { TodoApp } from "./components/TodoApp.jsx";
import { hasSupabaseConfig, supabase } from "./lib/supabase.js";

function getStoredTheme() {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem("theme") === "dark" ? "dark" : "light";
}

export default function App() {
  const [theme, setTheme] = useState(getStoredTheme);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    setAuthToken(token);
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) return;
    let alive = true;

    const bootstrap = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!alive) return;
      if (error || !data.session) {
        setToken("");
        setUser(null);
        setAuthToken("");
        return;
      }
      const session = data.session;
      setToken(session.access_token);
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || null,
      });
      setAuthToken(session.access_token);
    };

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setToken("");
        setUser(null);
        setAuthToken("");
        return;
      }
      setToken(session.access_token);
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || null,
      });
      setAuthToken(session.access_token);
    });

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (hasSupabaseConfig || !token || user) return;
    api
      .get("/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => {
        setToken("");
        setUser(null);
      });
  }, [token, user]);

  const handleAuthenticated = ({ token: nextToken, user: nextUser }) => {
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    if (supabase) supabase.auth.signOut();
    setToken("");
    setUser(null);
    setAuthToken("");
  };

  return (
    <div className="relative min-h-svh overflow-hidden bg-mesh-light bg-fixed transition-colors duration-500 dark:bg-mesh-dark">
      <ParticlesBackground theme={theme} />
      <div className="relative z-10">
        {token && user ? (
          <TodoApp
            user={user}
            onLogout={logout}
            theme={theme}
            onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          />
        ) : (
          <AuthCard onAuthenticated={handleAuthenticated} />
        )}
      </div>
      <Toaster richColors closeButton position="top-center" theme={theme} />
    </div>
  );
}
