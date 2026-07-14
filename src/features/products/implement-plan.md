# Products Module Implement Plan

เอกสารนี้สรุปขอบเขต แผนงาน และสถานะ implementation ของ module `products` โดยอ้างอิงจาก `screen-specs/products-screen-spec.md` และตรวจสอบกับ source code จริง ณ วันที่ `2026-07-14`

## สถานะโดยรวม

- สถานะ: `Implemented, pending completion and E2E verification`
- Owning route: `src/app/(app)/products`
- Owning feature: `src/features/products`
- ผู้ใช้ใน MVP: `ADMIN`
- Backend เป็น source of truth สำหรับ authentication, authorization, validation, soft delete, image policy และผลกระทบต่อ transaction/inventory

Module นี้มี flow หลักสำหรับ list, search, filter, pagination, create, edit, activate/deactivate และ upload รูปแล้ว แต่ยังขาด image management บางส่วน, accessibility ของ dialog/upload feedback, success toast และการทดสอบ browser/API E2E

## เป้าหมายของ Module

1. ให้ Admin ค้นหาและตรวจสอบ product master ได้รวดเร็ว
2. ให้ Admin เพิ่มและแก้ไขยี่ห้อ น้ำหนัก และราคาสินค้าได้
3. ให้ Admin ปิด/เปิดใช้งานสินค้าด้วย soft delete โดยไม่กระทบ transaction snapshot เดิม
4. ให้ Admin อัปโหลดและจัดการรูปสินค้าได้ โดย access token ไม่อยู่ใน browser JavaScript
5. เก็บ search, filter, page และ page size ไว้ใน URL
6. รองรับ loading, empty, error, permission และ mutation states ที่ชัดเจน
7. ใช้งานได้ทั้ง desktop, tablet, mobile และ keyboard

## ขอบเขต

### In scope

- Product list จาก backend พร้อม pagination meta
- Search ตาม `brand`
- Filter เฉพาะ active หรือรวม inactive
- แสดงรูปหลัก/fallback, brand, weight, ราคาทั้งสาม, status และ updated time
- Create และ edit product
- Activate และ deactivate แบบ soft delete
- Upload รูปหนึ่งไฟล์ต่อ request, preview, primary flag และ retry
- Loading, empty, error, unauthorized, forbidden และ not-found states
- Responsive UI และ accessibility

### Out of scope

- Hard delete product
- Stock balance, movement, stock threshold และ stock status
- Category, SKU, import/export และ bulk actions
- การคำนวณผลกระทบ transaction หรือ historical price snapshot ใน frontend
- Advanced image editor เช่น crop/resize และ bulk upload

## Data และ API Contract

Product ใช้ string สำหรับ ID และ decimal เพื่อหลีกเลี่ยง precision loss ฝั่ง JavaScript

- `GET /products` — list พร้อม `page`, `limit`, `search`, `includeInactive`
- `GET /products/:id` — detail สำหรับหน้า edit
- `POST /products` — create
- `PATCH /products/:id` — update/reactivate
- `DELETE /products/:id` — deactivate แบบ soft delete
- `GET /products/:productId/images` — list images
- `POST /products/:productId/images` — upload แบบ `multipart/form-data`
- `PATCH /products/:productId/images/:imageId` — update sort order/set primary
- `DELETE /products/:productId/images/:imageId` — delete image

Create พร้อมรูปต้องทำตามลำดับ `create product -> รับ productId -> upload image` หาก upload ล้มเหลวต้อง retry ด้วย `productId` เดิมและห้ามสร้าง product ซ้ำ

## Checklist จาก Products Screen Spec

Legend:

- `[x]` มี implementation ใน code แล้ว แต่รายการที่ระบุว่า pending verification ยังไม่ถือว่าผ่าน E2E
- `[ ]` ยังไม่ครบหรือยังไม่มี implementation

### 1. Route, rendering และ data boundary

สถานะ: `Done` จาก source, lint และ production build; browser E2E รวมอยู่ในหมวด verification

- [x] มี route `/products`, `/products/new` และ `/products/[id]/edit`
- [x] Product list เป็น Server Component และอ่าน `searchParams` แบบ async ตาม App Router contract
- [x] เรียก backend ผ่าน `src/features/products/product.api.ts` และ shared server-side API client
- [x] ใช้ `cache: "no-store"` สำหรับ list/detail ที่ต้องอ่านข้อมูลล่าสุด
- [x] API client อ่าน token จาก httpOnly cookie และแนบ Bearer token ฝั่ง server
- [x] รองรับ response `meta.pagination` ผ่าน `apiClientWithMeta`
- [x] รองรับ unauthorized โดย redirect ไป clear session และรองรับ forbidden state
- [x] มี not-found UI ภาษาไทยเฉพาะ product edit และตรวจรูปแบบ decimal product ID ก่อนเรียก backend

หลักฐานหลัก: `product.api.ts`, `src/app/(app)/products/page.tsx`, `src/app/(app)/products/[id]/edit/page.tsx`, `src/lib/api/client.ts`

### 2. List, search, filter และ pagination

สถานะ: `Done` จาก source, lint และ production build; browser/API E2E รวมอยู่ในหมวด verification

- [x] แสดง primary image ก่อน, fallback เป็นรูปแรก และใช้ placeholder เมื่อไม่มีรูป
- [x] แสดง brand, weight, exchange cost, exchange sale price, full tank price, active status และ updated time
- [x] Format ราคา 2 ตำแหน่งและ format วันเวลาตาม `Asia/Bangkok`
- [x] Search ตาม brand พร้อม trim, `maxLength=100`, debounce 400 ms และ submit ด้วย Enter
- [x] Search/filter reset page เป็น 1 และเก็บ state ใน URL
- [x] Filter รองรับ active-only และ include inactive ตาม backend contract
- [x] ไม่แสดง inactive-only filter เพราะ backend ยังไม่มี contract โดยตรง
- [x] Pagination แสดง range, previous/next, current page และ page size 10/20/50/100
- [x] Summary ใช้ข้อมูลจริงจาก pagination และข้อมูลในหน้าปัจจุบัน ไม่สร้าง stock/category metrics ปลอม
- [x] มี empty database และ empty filtered states พร้อม CTA ที่เกี่ยวข้อง
- [x] Search และ status filter ใช้ URL เป็น source of truth จึง sync เมื่อ client navigation หรือ browser back/forward เปลี่ยน query
- [x] Normalize `page`/`limit` ที่ไม่ถูกต้อง และ redirect page ที่เกิน `totalPages` ไปหน้าสุดท้ายโดยรักษา search/filter/page size

หลักฐานหลัก: `product-toolbar.tsx`, `product-table.tsx`, `product-pagination.tsx`, `src/app/(app)/products/page.tsx`

### 3. Create และ edit product

สถานะ: `Done` จาก source, lint และ production build; browser/API E2E รวมอยู่ในหมวด verification

- [x] มีฟอร์ม create/edit ที่ reuse component เดียวกัน
- [x] รองรับ `brand`, `weightKg`, `exchangeCostPrice`, `exchangeSalePrice`, `fullTankPrice`
- [x] Validate brand required/trim/max 100
- [x] Validate weight มากกว่า 0 และ decimal ไม่เกิน 2 ตำแหน่ง
- [x] Validate ราคาทั้งสามไม่ติดลบและ decimal ไม่เกิน 2 ตำแหน่ง
- [x] แสดง field error ด้วย `aria-invalid` และ `aria-describedby`
- [x] ป้องกัน submit ซ้ำด้วย pending/loading state
- [x] ใช้ Server Action สำหรับ create/update และ revalidate product list/edit path
- [x] หน้า edit preload product จาก backend
- [x] Map backend Zod issue path จาก `VALIDATION_ERROR.details` กลับเป็นข้อความไทยใต้ field ที่เกี่ยวข้องโดยไม่เปิดเผย internal message
- [x] เตือนเมื่อมีข้อมูลยังไม่บันทึกก่อน reload/ปิดแท็บหรือกด internal link และปิด guard ก่อน redirect หลังบันทึกสำเร็จ

หลักฐานหลัก: `product-form.tsx`, `product.schema.ts`, `actions.ts`, `product.types.ts`

### 4. Activate/deactivate แบบ soft delete

สถานะ: `Done` จาก source, lint และ production build; browser/API E2E รวมอยู่ในหมวด verification

- [x] Active product แสดง action ปิดใช้งาน
- [x] Inactive product แสดง action เปิดใช้งาน
- [x] Deactivate เรียก `DELETE /products/:id`
- [x] Reactivate เรียก `PATCH /products/:id` ด้วย `{ isActive: true }`
- [x] มี confirmation dialog และข้อความชัดเจนว่าประวัติเดิมไม่ถูกลบ
- [x] ป้องกัน submit ซ้ำและไม่ใช้ optimistic state
- [x] Mutation failure คง dialog ไว้และแสดง message/request ID
- [x] Mutation success revalidate และ refresh list
- [x] Feedback สำเร็จ/ล้มเหลวใช้ global shared Toast พร้อม request ID, auto-dismiss, manual close และ `aria-live`

หลักฐานหลัก: `product-table.tsx`, `actions.ts`, `product.api.ts`

### 5. Product image flow

สถานะ: `Done` จาก source, lint และ production build; authenticated browser/API E2E รวมอยู่ในหมวด verification

- [x] เลือกไฟล์จาก file picker หรือ drag-and-drop ได้หนึ่งไฟล์ต่อครั้ง
- [x] แสดง local preview, ชื่อไฟล์, ขนาดไฟล์, เปลี่ยนไฟล์ และเอาไฟล์ออกได้
- [x] Revoke object URL เมื่อเปลี่ยนไฟล์หรือ unmount
- [x] ส่ง `file`, `sortOrder`, `isPrimary` เป็น `multipart/form-data`
- [x] Upload ผ่าน frontend Route Handler และ server API wrapper โดยไม่เปิด Bearer token ให้ Client Component
- [x] ไม่กำหนด multipart boundary เอง
- [x] Create สำเร็จก่อนแล้วจึง upload ด้วย `productId`
- [x] หาก upload หลัง create ล้มเหลว สามารถ submit ซ้ำด้วย `productId` เดิมโดยไม่สร้าง product ซ้ำ
- [x] หน้า edit แสดง current images และสถานะรูปหลัก
- [x] หน้า edit สามารถ upload รูปเพิ่มและกำหนดรูปที่ upload เป็น primary ได้
- [x] ตั้งรูปเดิมให้เป็น primary ผ่าน secure frontend Route Handler และ image `PATCH`
- [x] แก้ `sortOrder` ของรูปเดิมผ่าน image `PATCH` พร้อม validation และเรียงผลล่าสุด
- [x] ลบรูปเดิมผ่าน image `DELETE` พร้อม confirmation และแจ้งชัดเจนว่า backend ไม่เลือก primary ใหม่อัตโนมัติ
- [x] มี feature API wrappers สำหรับ list/upload/update/delete image ครบ contract
- [x] ตรวจ JPEG/PNG/WebP, ไฟล์ว่าง, ขนาดไม่เกิน 5 MB และจำนวนสูงสุด 10 รูปก่อน upload โดย backend ยังเป็น final authority
- [x] Upload/image mutations มี `aria-busy`, `aria-live`, pending control และ global Toast สำหรับ success/failure/request ID

หลักฐานหลัก: `product-form.tsx`, `src/components/ui/file-picker.tsx`, `src/app/api/products/[productId]/images/route.ts`, `product.api.ts`

### 6. Loading, error และ feedback states

สถานะ: `Done` จาก source, lint และ production build; network/browser E2E รวมอยู่ในหมวด verification

- [x] มี route-level loading skeleton
- [x] มี route-level error boundary
- [x] มี retry action สำหรับ load error
- [x] แสดง request ID เมื่อ backend ส่งมา
- [x] แยก forbidden state และมีทางกลับ dashboard
- [x] แยก empty database กับ empty filtered state
- [x] Mutation มี pending และ failure feedback
- [x] แสดง global success Toast หลัง create/edit และคงอยู่ระหว่าง client navigation กลับรายการสินค้า
- [x] Map network/offline error ที่ API client กลางเป็น copy เฉพาะ “ไม่สามารถเชื่อมต่อบริการได้”
- [x] เพิ่ม `ProductImage` fallback เฉพาะ image ที่โหลดไม่ได้ โดยไม่ให้กระทบทั้ง row หรือ image manager

หลักฐานหลัก: `loading.tsx`, `error.tsx`, `product-load-error.tsx`, `product-form.tsx`, `product-table.tsx`, `product-image.tsx`, `src/lib/api/client.ts`, `src/lib/api/errors.ts`

### 7. Responsive และ accessibility

สถานะ: implementation `Done`; เหลือ authenticated manual keyboard/screen-reader QA ในหมวด verification

- [x] Desktop ใช้ table และรองรับ horizontal overflow
- [x] Mobile ใช้ stacked product rows ไม่บังคับ scroll table หลายคอลัมน์
- [x] Toolbar stack บนจอเล็กและ CTA เพิ่มสินค้ายังเห็นชัด
- [x] Mobile actions สูงอย่างน้อย 44px
- [x] Table มี caption และ icon actions มี accessible name
- [x] Status badge มีข้อความ ไม่สื่อด้วยสีอย่างเดียว
- [x] Form inputs และ file input มี label
- [x] Confirmation dialog รองรับ Escape, backdrop dismiss, focus trap, initial focus ที่ cancel และคืน focus ไป trigger; ระหว่าง mutation จะปิด dialog ไม่ได้
- [x] ใช้ `useId` สร้าง unique dialog title/description IDs ป้องกัน ID ชนเมื่อมี dialog มากกว่าหนึ่งตัว
- [x] Filter/search รักษา focus ที่ control และประกาศ pending/จำนวนผลลัพธ์; pagination/page size ส่ง focus ไป `#product-results`
- [x] Loading skeleton ใช้ responsive stack/width บน mobile และเปลี่ยนเป็น row/grid ตาม breakpoint โดยไม่ใช้ fixed width บนจอเล็ก
- [ ] ทำ manual keyboard และ screen-reader smoke test

หลักฐานหลัก: `product-table.tsx`, `product-toolbar.tsx`, `product-form.tsx`, `src/components/ui/dialog.tsx`

### 8. Permission และ business boundaries

- [x] ไม่เก็บ access token ใน localStorage/sessionStorage/client-readable cookie
- [x] Backend ตรวจ authorization ของ read/mutation และ frontend รองรับ 401/403
- [x] Frontend ไม่ hard delete product
- [x] Frontend ไม่คำนวณ stock/category/threshold ที่ไม่มี contract
- [x] UI ระบุว่าราคาที่แก้มีผลกับรายการใหม่เท่านั้น
- [x] Frontend ไม่แก้ historical transaction snapshots
- [ ] เพิ่ม presentation permission guard ราย action เมื่อ backend มี permission DTO; ปัจจุบันอาศัย ADMIN session/backend response ใน MVP

### 9. Verification และ tests

- [ ] เพิ่ม unit tests สำหรับ `validateProductInput`
- [ ] เพิ่ม component tests สำหรับ ProductForm, toolbar, pagination และ status dialog
- [ ] เพิ่ม E2E: เปิด list ค่า default และ pagination meta ตรง backend
- [ ] เพิ่ม E2E: search debounce/Enter, filter, clear filter, refresh และ back/forward
- [ ] เพิ่ม E2E: create/edit สำเร็จและ validation failure
- [ ] เพิ่ม E2E: deactivate/reactivate สำเร็จและ mutation failure
- [ ] เพิ่ม E2E: create พร้อมรูป, upload success และ partial-success retry โดยไม่สร้างซ้ำ
- [ ] เพิ่ม E2E: upload รูปใน edit, set primary และ delete image หลัง implement
- [ ] เพิ่ม E2E: unauthorized, forbidden, not found, network error และ request ID
- [ ] เพิ่ม E2E viewport desktop/tablet/mobile และ keyboard-only flow
- [ ] ทดสอบกับ authenticated browser และ backend จริง
- [x] `npm run lint` ผ่านในการตรวจ source ล่าสุดวันที่ `2026-07-14`
- [ ] รัน `npm run lint` ซ้ำหลังแก้ product code รอบถัดไป
- [x] Next.js production build ผ่านสำหรับ route/boundary revision นี้วันที่ `2026-07-14`
- [ ] รัน `npm run build` ซ้ำเมื่อแก้ route, server/client boundary หรือ shared imports รอบถัดไป

## ลำดับงานที่แนะนำ

1. ปิด image management contract: list/update primary/update sort/delete พร้อม UI และ confirmation
2. ปรับ shared `Dialog` ให้ผ่าน keyboard/focus accessibility
3. ทำ Toast/feedback flow ให้ success และ error คงอยู่ข้าม navigation ตามที่จำเป็น
4. เติม upload accessibility และ network/offline error mapping
5. เพิ่ม focused unit/component tests
6. ทดสอบ authenticated browser/API E2E ทุก critical flow และ responsive viewport
7. รัน lint/build แล้วอัปเดต checklist ตามผล verification

## เกณฑ์ปิด Module

ถือว่า Products module พร้อมเมื่อ:

- [ ] Critical acceptance criteria ใน `products-screen-spec.md` ผ่านครบ
- [ ] Image management ที่อยู่ใน scope ทำได้ครบโดย backend เป็น authority
- [ ] Dialog, upload และ mutation feedback ผ่าน keyboard/accessibility QA
- [ ] Authenticated browser/API E2E ผ่านทั้ง success, failure และ partial-success flows
- [ ] Desktop, tablet และ mobile ใช้งาน flow หลักได้โดย layout ไม่แตก
- [ ] `npm run lint` ผ่าน
- [ ] `npm run build` ผ่านสำหรับ code revision ล่าสุด
