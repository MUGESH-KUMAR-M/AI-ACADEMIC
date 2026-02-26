"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import * as authLib from "@/lib/auth";

interface AuthContextValue {
  user: api.UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<api.UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = authLib.getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const me = await api.getMe(token);
      setUser(me);
    } catch {
      authLib.clearTokens();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const signIn = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    authLib.saveTokens(res.access_token, res.refresh_token);
    const me = await api.getMe(res.access_token);
    setUser(me);
    router.push("/dashboard");
  };

  const signOut = async () => {
    const token = authLib.getAccessToken();
    if (token) {
      try {
        await api.logout(token);
      } catch {}
    }
    authLib.clearTokens();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
