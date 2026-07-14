import Link from "next/link";
import { ArrowLeftIcon, PackageIcon } from "@/components/icon/icons";

export function ProductNotFound() {
  return (
    <section
      aria-labelledby="product-not-found-heading"
      className="grid min-h-[420px] place-items-center border-y border-slate-200 bg-white px-6 py-14 text-center sm:rounded-2xl sm:border sm:shadow-sm"
    >
      <div className="max-w-md">
        <span
          aria-hidden="true"
          className="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-50 text-blue-500"
        >
          <PackageIcon className="size-8" />
        </span>
        <h2
          className="mt-5 text-xl font-bold text-[#071a43]"
          id="product-not-found-heading"
        >
          ไม่พบสินค้านี้
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          สินค้าอาจไม่มีอยู่หรือรหัสสินค้าไม่ถูกต้อง กรุณากลับไปเลือกสินค้าจากรายการล่าสุด
        </p>
        <Link
          className="mx-auto mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#1685ff_0%,#0036bf_100%)] px-5 text-sm font-bold text-white shadow-lg shadow-blue-700/25 transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-200"
          href="/products"
        >
          <ArrowLeftIcon className="size-4" />
          กลับรายการสินค้า
        </Link>
      </div>
    </section>
  );
}
