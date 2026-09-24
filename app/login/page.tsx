"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">
          Product Admin
        </h1>
        <p className="mb-6 text-sm text-slate-500">Sign in to continue</p>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Username
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
<div>
  <label className="mb-1 block text-xs font-semibold text-slate-700">
    Password
  </label>
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      autoComplete="current-password"
      required
    />
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
      tabIndex={-1}
    >
      {showPassword ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  </div>
</div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-xs text-slate-400">
          Try <span className="font-semibold text-slate-600">emilys</span> /{" "}
          <span className="font-semibold text-slate-600">emilyspass</span>
        </p>
      </div>
    </div>
  );
}
