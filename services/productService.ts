import { api } from "@/lib/axios";

export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
  description: string;
  images: string[];
  reviews?: { reviewerName: string; comment: string; rating: number }[];
}

interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductQuery {
  q?: string;
  category?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  limit: number;
  skip: number;
}

// The API can't search and filter by category in the same request, so we
// decide here: if there's a search term, search wins and category is ignored.
export async function fetchProducts(query: ProductQuery, signal?: AbortSignal) {
  const { q, category, sortBy, order, limit, skip } = query;

  let url = "/products";
  const params: Record<string, string | number> = { limit, skip };

  if (q) {
    url = "/products/search";
    params.q = q;
  } else if (category) {
    url = `/products/category/${category}`;
  }

  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || "asc";
  }

  const { data } = await api.get<ProductListResponse>(url, { params, signal });
  return data;
}

export async function fetchCategories(): Promise<string[]> {
  const { data } = await api.get<{ slug: string; name: string }[]>(
    "/products/categories"
  );
  return data.map((c) => c.slug);
}

export async function fetchProductById(id: number): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
}