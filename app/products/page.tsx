"use client";

import { useEffect, useRef, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useProductQueryState } from "@/hooks/useProductQueryState";
import { useDebounce } from "@/hooks/useDebounce";
import {
  fetchProducts,
  fetchCategories,
  Product,
} from "@/services/productService";

export default function ProductsPage() {
  const { username, logout } = useAuth();
  const router = useRouter();
  const { state, setState } = useProductQueryState();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  // Local typed value, separate from the URL's `q`. Only the debounced
  // version below updates the URL and triggers a fetch.
  const [searchInput, setSearchInput] = useState(state.q);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Guards against stale responses: only the most recent request's result
  // is allowed to update state.
  const requestIdRef = useRef(0);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  // When the debounced search value changes, push it into the URL and
  // reset to page 1 (only if it's actually different from what's there).
  useEffect(() => {
    if (debouncedSearch !== state.q) {
      setState({ q: debouncedSearch, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    const myRequestId = ++requestIdRef.current;
    const controller = new AbortController();
    setStatus("loading");

    fetchProducts(
      {
        q: state.q,
        category: state.q ? "" : state.category, // search wins over category
        sortBy: state.sortBy,
        order: state.order,
        limit: state.pageSize,
        skip: (state.page - 1) * state.pageSize,
      },
      controller.signal
    )
      .then((data) => {
        if (myRequestId !== requestIdRef.current) return; // a newer request already started, drop this one
        setProducts(data.products);
        setTotal(data.total);
        setStatus("success");

        // If the requested page is beyond what actually exists (?page=999),
        // snap back to the last valid page instead of showing a blank/broken page.
        const totalPages = Math.max(1, Math.ceil(data.total / state.pageSize));
        if (state.page > totalPages) {
          setState({ page: totalPages });
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return; // cancelled on purpose, not a real error
        if (myRequestId !== requestIdRef.current) return;
        setStatus("error");
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.q, state.category, state.sortBy, state.order, state.page, state.pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  const from = total === 0 ? 0 : (state.page - 1) * state.pageSize + 1;
  const to = Math.min(state.page * state.pageSize, total);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
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

        <div className="p-6">
          {/* Toolbar: search, category, sort */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Search products…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="min-w-[220px] flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={state.category}
              disabled={!!state.q}
              onChange={(e) => setState({ category: e.target.value, page: 1 })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={state.sortBy ? `${state.sortBy}-${state.order}` : ""}
              onChange={(e) => {
                const [sortBy, order] = e.target.value
                  ? e.target.value.split("-")
                  : ["", "asc"];
                setState({ sortBy, order: order as "asc" | "desc" });
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Sort by…</option>
              <option value="title-asc">Title (A–Z)</option>
              <option value="price-asc">Price (low–high)</option>
              <option value="price-desc">Price (high–low)</option>
              <option value="rating-desc">Rating (high–low)</option>
            </select>
          </div>
          {state.q && (
            <p className="mb-4 -mt-2 text-xs text-gray-500">
              Category filter is disabled while searching — the API can only
              do one at a time, so search takes priority.
            </p>
          )}

          {/* States */}
          {status === "loading" && (
            <div className="py-16 text-center text-sm text-gray-500">
              Loading products…
            </div>
          )}
          {status === "error" && (
            <div className="py-16 text-center text-sm text-gray-500">
              Something went wrong loading products.
              <div className="mt-3">
                <button
                  onClick={() => setState({ page: state.page })} // re-triggers the effect
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {status === "success" && products.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-500">
              No products match your filters.
            </div>
          )}

          {status === "success" && products.length > 0 && (
            <>
              {/* Desktop table */}
              <table className="hidden w-full border-collapse overflow-hidden rounded-lg border border-gray-200 bg-white text-sm md:table">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                    <th className="p-3"></th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100">
                      <td className="p-3">
                        <img src={p.thumbnail} alt={p.title} className="h-10 w-10 rounded object-cover" />
                      </td>
                      <td className="p-3 font-medium">
                        <button onClick={() => router.push(`/products/${p.id}`)} className="text-left hover:text-indigo-600">
                             {p.title}
                        </button>
                      </td>
                      <td className="p-3 text-gray-500">{p.category}</td>
                      <td className="p-3">${p.price}</td>
                      <td className="p-3">{p.rating.toFixed(1)}★</td>
                      <td className="p-3">{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="flex flex-col gap-3 md:hidden">
                {products.map((p) => (
                  <div key={p.id} className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3">
                    <img src={p.thumbnail} alt={p.title} className="h-14 w-14 rounded object-cover" />
                    <div>
                     <button onClick={() => router.push(`/products/${p.id}`)} className="font-medium text-left hover:text-indigo-600">
                            {p.title}
                     </button>
                      <div className="mt-1 flex gap-3 text-xs text-gray-500">
                        <span>{p.category}</span>
                        <span>${p.price}</span>
                        <span>{p.rating.toFixed(1)}★</span>
                        <span>{p.stock} in stock</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-gray-500">
                  Showing {from}–{to} of {total}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={state.page <= 1}
                    onClick={() => setState({ page: state.page - 1 })}
                    className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => Math.abs(n - state.page) <= 2)
                    .map((n) => (
                      <button
                        key={n}
                        onClick={() => setState({ page: n })}
                        className={`rounded-md border px-3 py-1.5 ${
                          n === state.page
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  <button
                    disabled={state.page >= totalPages}
                    onClick={() => setState({ page: state.page + 1 })}
                    className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
                <select
                  value={state.pageSize}
                  onChange={(e) =>
                    setState({ pageSize: parseInt(e.target.value, 10), page: 1 })
                  }
                  className="rounded-md border border-gray-300 px-2 py-1.5"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}