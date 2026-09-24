"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { fetchProductById, Product } from "@/services/productService";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "notfound" | "error">("loading");

  useEffect(() => {
    // Bad/non-numeric id in the URL (e.g. /products/abc) — don't even call the API.
    if (!Number.isFinite(id) || id <= 0) {
      setStatus("notfound");
      return;
    }

    setStatus("loading");
    fetchProductById(id)
      .then((data) => {
        setProduct(data);
        setStatus("success");
      })
      .catch((err) => {
        // DummyJSON returns a 404-style error for ids that don't exist.
        if (err.message?.toLowerCase().includes("not found")) {
          setStatus("notfound");
        } else {
          setStatus("error");
        }
      });
  }, [id]);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => router.push("/products")}
          className="mb-4 text-sm text-indigo-600"
        >
          ← Back to products
        </button>

        {status === "loading" && (
          <div className="py-16 text-center text-sm text-gray-500">Loading…</div>
        )}

        {status === "error" && (
          <div className="py-16 text-center text-sm text-gray-500">
            Something went wrong.
            <div className="mt-3">
              <button
                onClick={() => setStatus("loading")}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {status === "notfound" && (
          <div className="py-16 text-center">
            <h1 className="text-xl font-semibold text-gray-900">Product not found</h1>
            <p className="mt-2 text-sm text-gray-500">
              There's no product with id "{params.id}".
            </p>
          </div>
        )}

        {status === "success" && product && (
          <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex gap-2 overflow-x-auto">
                {product.images.slice(0, 4).map((img, i) => (
                  <img key={i} src={img} alt="" className="h-40 w-40 rounded object-cover" />
                ))}
              </div>
              <div>
                <h1 className="text-xl font-semibold">{product.title}</h1>
                <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                <p className="mt-3 text-2xl font-semibold">${product.price}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {product.rating.toFixed(1)}★ · {product.stock} in stock
                </p>
                <p className="mt-4 text-sm text-gray-700">{product.description}</p>
              </div>
            </div>

            {product.reviews && product.reviews.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h2 className="mb-2 text-sm font-semibold">Reviews</h2>
                {product.reviews.map((r, i) => (
                  <div key={i} className="border-t border-gray-100 py-2 text-sm first:border-t-0">
                    <span className="font-medium">{r.reviewerName}</span> — {r.rating}★
                    <p className="text-gray-600">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}