"use client";

import { useEffect, useRef, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useProductQueryState } from "@/hooks/useProductQueryState";
import { useDebounce } from "@/hooks/useDebounce";
import { useProductOverrides } from "@/context/ProductOverridesContext";
import ProductFormModal from "@/components/ProductFormModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  fetchProducts,
  fetchCategories,
  Product,
} from "@/services/productService";

export default function ProductsPageContent() {
  const { username, logout } = useAuth();
  const router = useRouter();
  const { state, setState } = useProductQueryState();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const [searchInput, setSearchInput] = useState(state.q);
  const debouncedSearch = useDebounce(searchInput, 400);
  const requestIdRef = useRef(0);

  const { applyOverrides, addProduct, editProduct, deleteProduct, addedProducts } =
    useProductOverrides();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

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
        category: state.q ? "" : state.category,
        sortBy: state.sortBy,
        order: state.order,
        limit: state.pageSize,
        skip: (state.page - 1) * state.pageSize,
      },
      controller.signal
    )
      .then((data) => {
        if (myRequestId !== requestIdRef.current) return;

        const merged = applyOverrides(data.products);
        const withLocalAdds =
          state.page === 1 && !state.q && !state.category
            ? [...addedProducts, ...merged]
            : merged;

        setProducts(withLocalAdds);
        setTotal(data.total);
        setStatus("success");

        const totalPages = Math.max(1, Math.ceil(data.total / state.pageSize));
        if (state.page > totalPages) {
          setState({ page: totalPages });
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (myRequestId !== requestIdRef.current) return;
        setStatus("error");
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.q, state.category, state.sortBy, state.order, state.page, state.pageSize, addedProducts]);

  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  const from = total === 0 ? 0 : (state.page - 1) * state.pageSize + 1;
  const to = Math.min(state.page * state.pageSize, total);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-100">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">Product Admin</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium text-slate-600">{username}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Search products…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="min-w-[220px] flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={state.category}
              disabled={!!state.q}
              onChange={(e) => setState({ category: e.target.value, page: 1 })}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
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
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              <option value="">Sort by…</option>
              <option value="title-asc">Title (A–Z)</option>
              <option value="price-asc">Price (low–high)</option>
              <option value="price-desc">Price (high–low)</option>
              <option value="rating-desc">Rating (high–low)</option>
            </select>
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormOpen(true);
              }}
              className="ml-auto rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              + Add product
            </button>
          </div>
          {state.q && (
            <p className="mb-4 -mt-2 text-xs font-medium text-slate-500">
              Category filter is disabled while searching — the API can only
              do one at a time, so search takes priority.
            </p>
          )}

          {status === "loading" && (
            <div className="rounded-lg border border-slate-200 bg-white py-16 text-center text-sm font-medium text-slate-500 shadow-sm">
              Loading products…
            </div>
          )}
          {status === "error" && (
            <div className="rounded-lg border border-slate-200 bg-white py-16 text-center text-sm font-medium text-slate-500 shadow-sm">
              Something went wrong loading products.
              <div className="mt-3">
                <button
                  onClick={() => setState({ page: state.page })}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {status === "success" && products.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white py-16 text-center text-sm font-medium text-slate-500 shadow-sm">
              No products match your filters.
            </div>
          )}

          {status === "success" && products.length > 0 && (
            <>
              <table className="hidden w-full border-collapse overflow-hidden rounded-lg border border-slate-200 bg-white text-sm shadow-sm md:table">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="p-3"></th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="h-10 w-10 rounded object-cover ring-1 ring-slate-200"
                        />
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        <button
                          onClick={() => router.push(`/products/${p.id}`)}
                          className="text-left hover:text-indigo-600"
                        >
                          {p.title}
                        </button>
                      </td>
                      <td className="p-3 text-slate-600">{p.category}</td>
                      <td className="p-3 font-medium text-slate-900">${p.price}</td>
                      <td className="p-3 text-slate-600">{p.rating.toFixed(1)}★</td>
                      <td className="p-3 text-slate-600">{p.stock}</td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setFormOpen(true);
                          }}
                          className="mr-3 text-xs font-semibold text-slate-600 hover:text-indigo-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingId(p.id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-col gap-3 md:hidden">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="h-14 w-14 rounded object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <button
                        onClick={() => router.push(`/products/${p.id}`)}
                        className="text-left font-semibold text-slate-900 hover:text-indigo-600"
                      >
                        {p.title}
                      </button>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-medium text-slate-500">
                        <span>{p.category}</span>
                        <span>${p.price}</span>
                        <span>{p.rating.toFixed(1)}★</span>
                        <span>{p.stock} in stock</span>
                      </div>
                      <div className="mt-2 flex gap-3 text-xs font-semibold">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setFormOpen(true);
                          }}
                          className="text-slate-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingId(p.id)}
                          className="text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-600">
                  Showing {from}–{to} of {total}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={state.page <= 1}
                    onClick={() => setState({ page: state.page - 1 })}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => Math.abs(n - state.page) <= 2)
                    .map((n) => (
                      <button
                        key={n}
                        onClick={() => setState({ page: n })}
                        className={`rounded-md border px-3 py-1.5 font-medium ${
                          n === state.page
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  <button
                    disabled={state.page >= totalPages}
                    onClick={() => setState({ page: state.page + 1 })}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
                <select
                  value={state.pageSize}
                  onChange={(e) =>
                    setState({ pageSize: parseInt(e.target.value, 10), page: 1 })
                  }
                  className="rounded-md border border-slate-300 bg-white px-2 py-1.5 font-medium text-slate-700"
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

      {formOpen && (
        <ProductFormModal
          categories={categories}
          existing={editingProduct}
          onClose={() => setFormOpen(false)}
          onSubmit={(data) => {
            if (editingProduct) {
              editProduct(editingProduct.id, data);
              setProducts((prev) =>
                prev.map((p) =>
                  p.id === editingProduct.id ? { ...p, ...data } : p
                )
              );
            } else {
              const newProduct: Product = {
                ...data,
                id: -Date.now(),
                rating: 0,
                thumbnail: "https://placehold.co/100",
                images: [],
                reviews: [],
              };
              addProduct(newProduct);
              setProducts((prev) => [newProduct, ...prev]);
              setTotal((t) => t + 1);
            }
            setFormOpen(false);
          }}
        />
      )}
      {deletingId !== null && (
        <ConfirmDialog
          title="Delete product?"
          message="This can't be undone."
          onCancel={() => setDeletingId(null)}
          onConfirm={() => {
            deleteProduct(deletingId);
            setProducts((prev) => prev.filter((p) => p.id !== deletingId));
            setTotal((t) => Math.max(0, t - 1));
            setDeletingId(null);
          }}
        />
      )}
    </RequireAuth>
  );
}
