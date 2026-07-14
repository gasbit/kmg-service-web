"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircleIcon, EditIcon, PauseCircleIcon, TrashIcon } from "@/components/icon/icons";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/lib/hooks/use-toast";
import { setProductActiveAction } from "./actions";
import { ProductImage } from "./product-image";
import type { Product } from "./product.types";

const money = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });
const formatDate = (value: string) => { const parsed = new Date(value); return Number.isNaN(parsed.valueOf()) ? "—" : date.format(parsed); };

function ProductVisual({ product }: { product: Product }) {
  const image = product.images.find((item) => item.isPrimary) ?? product.images[0];
  return <ProductImage alt={`รูปสินค้า ${product.brand} ${product.weightKg} กิโลกรัม`} className="size-12 rounded-xl border border-slate-200" image={image} />;
}

function StatusBadge({ active }: { active: boolean }) { return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{active ? <CheckCircleIcon className="size-3.5" /> : <PauseCircleIcon className="size-3.5" />}{active ? "ใช้งาน" : "ปิดใช้งาน"}</span>; }

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Product | null>(null);
  const [pending, startTransition] = useTransition();
  const confirm = () => selected && startTransition(async () => {
    const result = await setProductActiveAction(selected.id, !selected.isActive);
    toast({
      description: result.ok ? undefined : result.message,
      requestId: result.requestId,
      title: result.ok ? result.message : "เปลี่ยนสถานะสินค้าไม่สำเร็จ",
      variant: result.ok ? "success" : "error",
    });
    if (result.ok) { setSelected(null); router.refresh(); }
  });

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <caption className="sr-only">รายการสินค้า</caption>
          <TableHeader><TableRow><TableHead>สินค้า</TableHead><TableHead>ราคาทุนแลก (บาท)</TableHead><TableHead>ราคาขายแลก (บาท)</TableHead><TableHead>ราคาถังเต็ม (บาท)</TableHead><TableHead>สถานะ</TableHead><TableHead>แก้ไขล่าสุด</TableHead><TableHead className="text-right">จัดการ</TableHead></TableRow></TableHeader>
          <TableBody>{products.map((product) => <TableRow key={product.id} className={!product.isActive ? "bg-slate-50/60" : undefined}>
            <TableCell><div className="flex min-w-52 items-center gap-3"><ProductVisual product={product} /><div><p className="font-semibold text-[#071a43]">{product.brand}</p><p className="mt-0.5 text-xs text-slate-500">{Number(product.weightKg).toLocaleString("th-TH")} กก.</p></div></div></TableCell>
            <TableCell className="font-medium">{money.format(Number(product.exchangeCostPrice))}</TableCell><TableCell className="font-bold text-blue-600">{money.format(Number(product.exchangeSalePrice))}</TableCell><TableCell className="font-medium">{money.format(Number(product.fullTankPrice))}</TableCell>
            <TableCell><StatusBadge active={product.isActive} /></TableCell><TableCell className="whitespace-nowrap text-xs text-slate-500">{formatDate(product.updatedAt)}</TableCell>
            <TableCell><div className="flex justify-end gap-2"><Link aria-label={`แก้ไขสินค้า ${product.brand}`} className="grid size-10 place-items-center rounded-lg border border-blue-200 text-blue-600 transition hover:bg-blue-50" href={`/products/${product.id}/edit`}><EditIcon className="size-4" /></Link><button aria-label={`${product.isActive ? "ปิด" : "เปิด"}ใช้งานสินค้า ${product.brand}`} className={`grid size-10 place-items-center rounded-lg border transition ${product.isActive ? "border-red-200 text-red-500 hover:bg-red-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"}`} onClick={() => setSelected(product)} type="button">{product.isActive ? <TrashIcon className="size-4" /> : <CheckCircleIcon className="size-4" />}</button></div></TableCell>
          </TableRow>)}</TableBody>
        </Table>
      </div>
      <div className="divide-y divide-slate-100 md:hidden">{products.map((product) => <article className="p-5" key={product.id}><div className="flex items-start gap-3"><ProductVisual product={product} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-semibold text-[#071a43]">{product.brand}</h2><p className="text-xs text-slate-500">{Number(product.weightKg).toLocaleString("th-TH")} กก.</p></div><StatusBadge active={product.isActive} /></div><p className="mt-4 text-xs text-slate-500">ราคาขายแลก</p><p className="text-xl font-bold text-blue-600">฿{money.format(Number(product.exchangeSalePrice))}</p></div></div><dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs"><div><dt className="text-slate-500">ราคาทุนแลก</dt><dd className="mt-1 font-semibold text-slate-800">฿{money.format(Number(product.exchangeCostPrice))}</dd></div><div><dt className="text-slate-500">ราคาถังเต็ม</dt><dd className="mt-1 font-semibold text-slate-800">฿{money.format(Number(product.fullTankPrice))}</dd></div></dl><div className="mt-4 flex gap-2"><Link className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 font-semibold text-blue-600" href={`/products/${product.id}/edit`}><EditIcon className="size-4" />แก้ไข</Link><button className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border font-semibold ${product.isActive ? "border-red-200 text-red-600" : "border-emerald-200 text-emerald-700"}`} onClick={() => setSelected(product)} type="button">{product.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}</button></div></article>)}</div>
      <Dialog description={selected ? selected.isActive ? <>สินค้านี้จะไม่สามารถเลือกใช้ในรายการใหม่ แต่ประวัติเดิมจะไม่ถูกลบ</> : <>สินค้านี้จะกลับมาเลือกใช้ในรายการใหม่ได้</> : null} footer={<><Button disabled={pending} onClick={() => setSelected(null)} variant="secondary">ยกเลิก</Button><Button isLoading={pending} loadingText="กำลังบันทึก" onClick={confirm}>{selected?.isActive ? "ยืนยันปิดใช้งาน" : "ยืนยันเปิดใช้งาน"}</Button></>} open={Boolean(selected)} title={selected?.isActive ? "ปิดใช้งานสินค้านี้?" : "เปิดใช้งานสินค้านี้อีกครั้ง?"} />
    </>
  );
}
