import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE } from "./config";

const AuthContext = createContext(null);
const STORAGE_KEY = "yatrasetu_auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Session expired");
        }

        if (active) setUser(data.user);
      } catch {
        if (active) {
          localStorage.removeItem(STORAGE_KEY);
          setToken("");
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      async login(nextToken, nextUser) {
        localStorage.setItem(STORAGE_KEY, nextToken);
        setToken(nextToken);
        setUser(nextUser);
      },
      async logout() {
        try {
          await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          // ignore
        }
        localStorage.removeItem(STORAGE_KEY);
        setToken("");
        setUser(null);
      },
      updateUser(updatedFields) {
        setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
      },
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
