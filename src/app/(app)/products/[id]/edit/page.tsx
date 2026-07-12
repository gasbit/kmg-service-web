import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app-shell/page-header";
import { ApiError } from "@/lib/api/errors";
import { getProduct } from "@/features/products/product.api";
import { ProductForm } from "@/features/products/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product;
  try { product = await getProduct(id); } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
  return (
    <main>
      <PageHeader description={`แก้ไขข้อมูล ${product.brand} ${Number(product.weightKg).toLocaleString("th-TH")} กก.`} title="แก้ไขสินค้า" />
      <div className="p-4 sm:p-6 lg:p-8 lg:pt-4"><ProductForm product={product} /></div>
    </main>
  );
}
