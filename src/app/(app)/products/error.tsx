"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/app-shell/page-header";
import { ProductLoadError } from "@/features/products/product-load-error";

export default function ProductsError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main><PageHeader description="จัดการข้อมูลสินค้าและราคาขาย" title="สินค้า" /><div className="p-4 sm:p-6 lg:p-8 lg:pt-4"><ProductLoadError requestId={error.digest} /></div></main>;
}
