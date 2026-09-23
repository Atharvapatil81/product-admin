"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Guards against the "click Login many times fast" rule — once a
    // request is in flight, further submits are ignored until it settles.
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
      router.push("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8">
        <h1 className="mb-1 text-2xl font-semibold text-gray-900">
          Product Admin
        </h1>
        <p className="mb-6 text-sm text-gray-500">Sign in to continue</p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Username
            </label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-xs text-gray-400">
          Try <span className="font-medium">emilys</span> /{" "}
          <span className="font-medium">emilyspass</span>
        </p>
      </div>
    </div>
  );
}