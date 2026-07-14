export type ProductImage = {
  id: string;
  url: string;
  originalName: string | null;
  mimeType: string;
  fileSize: number;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  brand: string;
  weightKg: string;
  exchangeCostPrice: string;
  exchangeSalePrice: string;
  fullTankPrice: string;
  isActive: boolean;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type ProductListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  includeInactive?: boolean;
};

export type ProductPagination = { page: number; limit: number; totalItems: number; totalPages: number };
export type ProductWriteInput = Pick<Product, "brand" | "weightKg" | "exchangeCostPrice" | "exchangeSalePrice" | "fullTankPrice">;

export type ProductActionState = {
  imageUploadFailed?: boolean;
  ok: boolean;
  message: string;
  productId?: string;
  productSaved?: boolean;
  requestId?: string;
  fieldErrors?: Partial<Record<keyof ProductWriteInput, string>>;
};
