"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Wrap any protected page's content in this. It waits for the auth context
// to finish checking localStorage (isReady), then bounces to /login if
// there's no session. Until then it renders nothing, so we never flash
// protected content to a logged-out visitor.
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady || !isAuthenticated) return null;

  return <>{children}</>;
}