import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/app-shell/page-header";
import { ApiError } from "@/lib/api/errors";
import { getProduct } from "@/features/products/product.api";
import { ProductForm } from "@/features/products/product-form";
import { ProductLoadError } from "@/features/products/product-load-error";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9][0-9]*$/.test(id)) notFound();

  let product;
  try {
    product = await getProduct(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/api/auth/session/clear");
    }
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      return (
        <main>
          <PageHeader description="แก้ไขข้อมูลและราคาสินค้า" title="แก้ไขสินค้า" />
          <div className="p-4 sm:p-6 lg:p-8 lg:pt-4">
            <ProductLoadError forbidden requestId={error.requestId} />
          </div>
        </main>
      );
    }
    throw error;
  }

  return (
    <main>
      <PageHeader description={`แก้ไขข้อมูล ${product.brand} ${Number(product.weightKg).toLocaleString("th-TH")} กก.`} title="แก้ไขสินค้า" />
      <div className="p-4 sm:p-6 lg:p-8 lg:pt-4"><ProductForm product={product} /></div>
    </main>
  );
}
