import { PageHeader } from "@/components/app-shell/page-header";
import { ProductForm } from "@/features/products/product-form";

export default function NewProductPage() {
  return (
    <main>
      <PageHeader description="เพิ่มข้อมูลและราคาสำหรับสินค้าใหม่" title="เพิ่มสินค้า" />
      <div className="p-4 sm:p-6 lg:p-8 lg:pt-4"><ProductForm /></div>
    </main>
  );
}
