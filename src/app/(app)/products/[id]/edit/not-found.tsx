import { PageHeader } from "@/components/app-shell/page-header";
import { ProductNotFound } from "@/features/products/product-not-found";

export default function ProductEditNotFound() {
  return (
    <main>
      <PageHeader
        description="ตรวจสอบรหัสสินค้า หรือกลับไปเลือกสินค้าจากรายการล่าสุด"
        title="ไม่พบสินค้า"
      />
      <div className="py-4 sm:p-6 lg:p-8 lg:pt-4">
        <ProductNotFound />
      </div>
    </main>
  );
}
