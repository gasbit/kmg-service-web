import { apiClient, apiClientWithMeta } from "@/lib/api/client";
import type { Product, ProductImage, ProductListQuery, ProductPagination, ProductWriteInput } from "./product.types";

export async function getProducts(query: ProductListQuery = {}) {
  const result = await apiClientWithMeta<{ products: Product[] }>("/products", { cache: "no-store", query });
  const pagination = result.meta?.pagination as ProductPagination | undefined;
  return {
    products: result.data.products,
    pagination: pagination ?? { page: query.page ?? 1, limit: query.limit ?? 20, totalItems: result.data.products.length, totalPages: 1 },
  };
}

export function getProduct(id: string) { return apiClient<Product>(`/products/${id}`, { cache: "no-store" }); }
export function createProduct(input: ProductWriteInput) { return apiClient<Product>("/products", { method: "POST", body: input }); }
export function updateProduct(id: string, input: Partial<ProductWriteInput> & { isActive?: boolean }) { return apiClient<Product>(`/products/${id}`, { method: "PATCH", body: input }); }
export function deactivateProduct(id: string) { return apiClient<Product>(`/products/${id}`, { method: "DELETE" }); }
export function uploadProductImage(productId: string, formData: FormData) { return apiClient<ProductImage>(`/products/${productId}/images`, { method: "POST", body: formData }); }
