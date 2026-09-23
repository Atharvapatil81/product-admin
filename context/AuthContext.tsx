"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getToken, getUsername, setSession, clearSession } from "@/lib/auth";
import { loginRequest } from "@/services/authService";

interface AuthContextValue {
  username: string | null;
  isReady: boolean; // becomes true once we've checked localStorage on mount
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // On first mount, restore the session from localStorage (if any).
  // Without this, refreshing the page would always look "logged out"
  // for a split second and then flicker.
  useEffect(() => {
    setUsername(getUsername());
    setIsReady(true);
  }, []);

  async function login(u: string, password: string) {
    const data = await loginRequest(u, password);
    setSession(data.accessToken, data.username);
    setUsername(data.username);
  }

  function logout() {
    clearSession();
    setUsername(null);
  }

  return (
    <AuthContext.Provider
      value={{
        username,
        isReady,
        isAuthenticated: !!username && !!getToken(),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}