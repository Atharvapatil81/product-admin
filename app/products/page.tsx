"use client";

import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const { username, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <RequireAuth>
      <div className="p-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h1 className="text-lg font-semibold">Product Admin</h1>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>{username}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              Log out
            </button>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Product list, search, filters and pagination land in the next commit.
        </p>
      </div>
    </RequireAuth>
  );
}