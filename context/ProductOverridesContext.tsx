"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@/services/productService";

interface Overrides {
  added: Product[];
  edited: Record<number, Partial<Product>>;
  deletedIds: number[];
}

const STORAGE_KEY = "product_overrides";

function loadOverrides(): Overrides {
  if (typeof window === "undefined") return { added: [], edited: {}, deletedIds: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { added: [], edited: {}, deletedIds: [] };
  } catch {
    return { added: [], edited: {}, deletedIds: [] };
  }
}

interface Ctx {
  addProduct: (p: Omit<Product, "id">) => void;
  editProduct: (id: number, patch: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  applyOverrides: (apiProducts: Product[]) => Product[];
  addedProducts: Product[];
}

const ProductOverridesContext = createContext<Ctx | undefined>(undefined);

export function ProductOverridesProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Overrides>({ added: [], edited: {}, deletedIds: [] });

  useEffect(() => {
    setOverrides(loadOverrides());
  }, []);

  function persist(next: Overrides) {
    setOverrides(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function addProduct(p: Omit<Product, "id">) {
    // Negative id so it can never collide with a real DummyJSON id.
    const newProduct: Product = { ...p, id: -Date.now() };
    persist({ ...overrides, added: [newProduct, ...overrides.added] });
  }

  function editProduct(id: number, patch: Partial<Product>) {
    if (id < 0) {
      // Editing a locally-added product — patch it directly in `added`.
      persist({
        ...overrides,
        added: overrides.added.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      });
    } else {
      persist({ ...overrides, edited: { ...overrides.edited, [id]: patch } });
    }
  }

  function deleteProduct(id: number) {
    if (id < 0) {
      persist({ ...overrides, added: overrides.added.filter((p) => p.id !== id) });
    } else {
      persist({ ...overrides, deletedIds: [...overrides.deletedIds, id] });
    }
  }

  function applyOverrides(apiProducts: Product[]): Product[] {
    return apiProducts
      .filter((p) => !overrides.deletedIds.includes(p.id))
      .map((p) => (overrides.edited[p.id] ? { ...p, ...overrides.edited[p.id] } : p));
  }

  return (
    <ProductOverridesContext.Provider
      value={{ addProduct, editProduct, deleteProduct, applyOverrides, addedProducts: overrides.added }}
    >
      {children}
    </ProductOverridesContext.Provider>
  );
}

export function useProductOverrides() {
  const ctx = useContext(ProductOverridesContext);
  if (!ctx) throw new Error("useProductOverrides must be used inside <ProductOverridesProvider>");
  return ctx;
}