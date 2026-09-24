import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ProductOverridesProvider } from "@/context/ProductOverridesContext";

export const metadata: Metadata = {
  title: "Product Admin",
  description: "Admin dashboard for managing products",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ProductOverridesProvider>{children}</ProductOverridesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}