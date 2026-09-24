import { Suspense } from "react";
import ProductsPageContent from "./ProductsPageContent";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500 shadow-sm">
            Loading products…
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}