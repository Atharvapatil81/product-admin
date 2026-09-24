"use client";

import { useState } from "react";
import { Product } from "@/services/productService";

interface Props {
  categories: string[];
  existing?: Product | null;
  onClose: () => void;
  onSubmit: (data: { title: string; category: string; price: number; stock: number; description: string }) => void;
}

export default function ProductFormModal({ categories, existing, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState(existing?.title || "");
  const [category, setCategory] = useState(existing?.category || categories[0] || "");
  const [price, setPrice] = useState(existing ? String(existing.price) : "");
  const [stock, setStock] = useState(existing ? String(existing.stock) : "");
  const [description, setDescription] = useState(existing?.description || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (title.trim().length < 3) next.title = "Title must be at least 3 characters.";
    const priceNum = parseFloat(price);
    if (!(priceNum > 0)) next.price = "Enter a price greater than 0.";
    const stockNum = parseInt(stock, 10);
    if (!(stockNum >= 0)) next.stock = "Enter a stock quantity of 0 or more.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return; // guards against rapid double-click submits
    if (!validate()) return;

    setIsSubmitting(true);
    onSubmit({
      title: title.trim(),
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      description: description.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">{existing ? "Edit product" : "Add product"}</h2>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-600">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-600">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-600">Price</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">Stock</label>
            <input value={stock} onChange={(e) => setStock(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs text-gray-600">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={3} />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-60">
            {existing ? "Save changes" : "Add product"}
          </button>
        </div>
      </form>
    </div>
  );
}