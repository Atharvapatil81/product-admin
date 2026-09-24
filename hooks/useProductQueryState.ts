"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const VALID_PAGE_SIZES = [10, 20, 50];

export interface ProductQueryState {
  page: number;
  pageSize: number;
  q: string;
  category: string;
  sortBy: string;
  order: "asc" | "desc";
}

// Reads page/search/filter/sort straight from the URL, and sanitizes bad
// values (?page=abc, ?page=999, etc.) instead of letting them break the page.
export function useProductQueryState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawPageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const pageSize = VALID_PAGE_SIZES.includes(rawPageSize) ? rawPageSize : 10;

  const state: ProductQueryState = {
    page,
    pageSize,
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    sortBy: searchParams.get("sortBy") || "",
    order: (searchParams.get("order") as "asc" | "desc") || "asc",
  };

  const setState = useCallback(
    (patch: Partial<ProductQueryState>) => {
      const next = { ...state, ...patch };
      const params = new URLSearchParams();
      params.set("page", String(next.page));
      params.set("pageSize", String(next.pageSize));
      if (next.q) params.set("q", next.q);
      if (next.category) params.set("category", next.category);
      if (next.sortBy) params.set("sortBy", next.sortBy);
      if (next.sortBy) params.set("order", next.order);
      router.push(`${pathname}?${params.toString()}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, router, pathname]
  );

  return { state, setState };
}