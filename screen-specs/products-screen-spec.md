# Screen Specification: จัดการสินค้า (Products)

## 1. Document status

- Status: Ready for review
- Owner: KMG-SERVICE-WEB / `products`
- Last updated: 2026-07-12
- Related design: `/Users/gas.bit/Downloads/2737b2d1-7b32-45b5-9af9-0ce842f38090.png`
- Related API: `../KMG-SERVICE-API/src/modules/products/product-spec.md`, Product routes/schemas/controllers/services ณ 2026-07-12

## 2. Summary

- Purpose: ให้ Admin ค้นหา ตรวจสอบ และจัดการ product master ที่ใช้กับรายการขาย/แลกถัง โดยเห็นราคา สถานะ และรูปสินค้าอย่างรวดเร็ว
- User outcome: Admin เปิดหน้าแล้วค้นหาสินค้า ดูข้อมูลหลัก เพิ่ม แก้ไข เปิดใช้งาน และปิดใช้งานสินค้าได้ โดยไม่ทำลายประวัติ transaction เดิม
- Route: `/products`
- Owning route: `src/app/(app)/products/page.tsx`
- Owning feature: `src/features/products`
- Allowed roles: `ADMIN` เท่านั้นใน MVP ทั้งการแสดง UI และการบังคับสิทธิ์ที่ backend
- Visual thesis: operational workspace สีขาว–น้ำเงินที่หนาแน่นแต่สแกนง่าย ใช้ sidebar เดิมและแบ่ง filter, summary และ table เป็นลำดับชัดเจนตามภาพอ้างอิง
- Interaction thesis: filter เปลี่ยน URL และโหลดผลใหม่, mutation แสดง pending เฉพาะจุด, dialog เปิด/ปิดด้วย transition สั้นและคืน focus ถูกตำแหน่ง

## 3. Scope

### In scope

- Product list พร้อม server-side search, active filter และ pagination
- แสดงรูปหลักหรือ fallback, brand, weight, ราคาทุนแลก, ราคาขายแลก, ราคาถังเต็ม และสถานะ active
- ปุ่มเพิ่มสินค้า, แก้ไขสินค้า, ปิดใช้งานสินค้า และเปิดใช้งานสินค้าที่ inactive
- รองรับ empty/loading/error/permission/mutation states
- เก็บ filter และ pagination ใน URL เพื่อให้ refresh/back/forward/share URL แล้วได้ผลเดิม
- ใช้ product/image API ที่ backend implement แล้ว

### Out of scope

- การปรับยอด stock, inventory movement, import/export และ bulk action
- การ hard delete สินค้า
- category, SKU, stock threshold และ stock status จนกว่าจะมี approved data contract
- การคำนวณผลกระทบ transaction, inventory หรือ historical price snapshots ใน frontend
- รายละเอียดหน้าสร้าง/แก้ไขและ image manager เชิงลึก ซึ่งควรมี screen spec แยก แต่ navigation และผลลัพธ์หลัง mutationถูกกำหนดไว้ในเอกสารนี้

## 4. Sources and decisions

### Confirmed sources

- `AGENTS.md`: Server Components เป็นค่าเริ่มต้น, API อยู่ใน `src/lib/api`/feature wrapper, reuse shared UI/icon/app shell และ backend เป็น business authority
- `Context.md`, `Business-Flow.md`, `Database-Design.md`: product ใช้ soft delete และการแก้ master data ต้องไม่เปลี่ยน transaction snapshots เดิม
- `Frontend-Architecture.md`, `Frontend-Implement-Plan.md`: route `/products`, feature-oriented ownership และ browser ต้องไม่ถือ access token
- Product implementation: `GET /products`, `GET /products/:id`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id` และ image operations ใช้งานจริงภายใต้ Bearer auth/ADMIN
- List query ที่ยืนยันแล้ว: `page` (default 1), `limit` (default 20, max 100), `search` (ค้นเฉพาะ brand), `includeInactive` (default false); sort คือ `createdAt DESC, id DESC`
- Product DTO ที่ยืนยันแล้ว: string ID/decimals, `brand`, `weightKg`, `exchangeCostPrice`, `exchangeSalePrice`, `fullTankPrice`, `isActive`, `images`, timestamps
- Next.js local docs: page/layout เป็น App Router Server Components โดยค่าเริ่มต้น; runtime data fetch ไม่ cache โดยค่าเริ่มต้น; Client Components ใช้เฉพาะ interaction; Server Actions ต้องตรวจ auth/authorization อีกครั้ง

### Assumptions

- ใช้ภาษาไทยให้สอดคล้อง app shell ปัจจุบัน แม้ภาพอ้างอิงใช้หัวข้อภาษาอังกฤษบางส่วน
- หน้าแรกใช้ `page=1`, `limit=20`, `includeInactive=false` ตาม backend contract
- search submit หลังหยุดพิมพ์ 400 ms หรือกด Enter และ trim ค่า; URL ที่มี search ว่างจะไม่ส่ง parameter
- ปุ่ม “รีเฟรช” ทำ `router.refresh()` โดยรักษา query เดิม และไม่ทำ polling อัตโนมัติ
- ราคาทั้งสามช่องแสดง 2 ตำแหน่งพร้อมตัวคั่นหลักพันและหน่วยบาทใน header
- รูปสินค้าใช้ primary image ก่อน; ถ้าไม่มี primary ใช้รูปแรกตามลำดับ API; ถ้าไม่มีรูปใช้ shared product placeholder
- การแก้ไข/เปิดใช้งานใช้ route `/products/[id]/edit`; การสร้างใช้ `/products/new`

### Open decisions and conflicts

- ภาพมี “หมวดหมู่”, SKU, filter หมวดหมู่/ยี่ห้อ และสถานะพร้อมขาย/ต่ำกว่าขั้นต่ำ/หมดสต็อก แต่ Product API ไม่มี field เหล่านี้
- ภาพมีจำนวนคงเหลือและ summary stock; Product API ไม่คืน inventory balance และไม่มี threshold contract ห้าม frontend เดาสถานะจากจำนวน
- Product API spec ส่วนหัวเขียนว่า “Proposed/ยังไม่มี implementation” แต่ routes/schema/service/repository มี implementation แล้ว ให้ยึด tested source implementation เหนือข้อความสถานะเก่า และควรอัปเดตหัวเอกสาร API
- ภาพแสดง 10 รายการต่อหน้า แต่ backend default คือ 20; สเปกนี้ยึด 20 จนกว่าผลิตภัณฑ์จะอนุมัติเปลี่ยน default หรือส่ง `limit=10` ชัดเจน
- ยังไม่มี permission DTO ราย action; MVP ถือว่า session role `ADMIN` เห็น action ทั้งหมด แต่ backend ต้องตรวจทุก request

## 5. Navigation and workflow

- Entry points: sidebar `คลังสินค้า > สินค้า`, URL `/products`, กลับจาก `/products/new` หรือ `/products/[id]/edit`
- Exit paths: sidebar routes, `เพิ่มสินค้า`, `แก้ไขสินค้า`
- Primary workflow: เปิดหน้า → server อ่าน URL query → fetch list → สแกน summary/list → ค้นหา/กรอง/เปลี่ยนหน้า → เปิด create/edit หรือเปลี่ยนสถานะ
- Alternate paths: ไม่มีสินค้า, filter ไม่พบผล, session หมดอายุ, ไม่มีสิทธิ์, backend ล้มเหลว, mutation conflict/validation failure
- หลัง create/update สำเร็จ: กลับ `/products`, revalidate/refresh list และ toast “บันทึกข้อมูลสินค้าแล้ว”
- หลัง deactivate สำเร็จ: ปิด dialog, refresh list; แถวหายเมื่อ `includeInactive=false` หรือเปลี่ยนเป็น inactive เมื่อแสดงทั้งหมด

## 6. Screen composition

| Region | Content | Shared component | Responsive behavior |
| --- | --- | --- | --- |
| App shell | sidebar/mobile nav/current user | `AppSidebar`, `MobileNav`, `NavigationMenu` | sidebar desktop; drawer/mobile nav บนจอแคบ |
| Page header | “สินค้า”, “จัดการข้อมูลสินค้าและราคาขาย”, วันที่/notification/profile จาก shell | `PageHeader` | description ซ่อนตาม behavior เดิม; action ไม่อยู่ใน header บน mobile |
| Toolbar | search, status filter, refresh, add product | `Input`, proposed styled `Select`, `Button`, shared icons | desktop 1 แถว; tablet wrap; mobile stack โดย add product ยังคงเห็นชัด |
| Summary strip | จำนวนผลลัพธ์ทั้งหมด, active, inactive เฉพาะเมื่อ API รองรับ | `Card`/`CardContent` แบบ compact หรือ proposed `MetricSummary` | 3 columns → horizontal scroll/stack; ไม่ render fake metrics |
| Product table | image + brand/weight, three prices, status, updated time, actions | proposed compound `Table` primitives, `Button`, shared icons | horizontal scroll ที่ tablet; compact stacked rows/cards ที่ mobile |
| Pagination | result range, previous/page/next, page size | proposed `Pagination` | wrap เป็น 2 แถว; controls ≥44px |
| Status dialog | ยืนยันปิดใช้งาน หรือยืนยันเปิดใช้งาน | proposed accessible `Dialog` | centered desktop; bottom-sheet-like width on mobile |
| Feedback | success/error toast | `Toast` | viewport-safe, screen-reader announced |

## 7. Data contract

| UI datum | API/source field | Requirement | Format/fallback | Ownership or notes |
| --- | --- | --- | --- | --- |
| Product ID | `product.id` | Required | decimal string; ไม่แสดงใน table | backend identifier |
| รูปสินค้า | `product.images[]` | Required array | primary → first → placeholder; alt `รูปสินค้า {brand} {weight}` | current master image URL; URL ไม่ใช่ persistent ID |
| ยี่ห้อ | `product.brand` | Required | plain text | current master; editable |
| น้ำหนัก | `product.weightKg` | Required | `{value} กก.`; preserve decimal meaning | current master; editable |
| ราคาทุนแลก | `product.exchangeCostPrice` | Required | `th-TH`, 2 decimals | THB; editable; backend validates |
| ราคาขายแลก | `product.exchangeSalePrice` | Required | `th-TH`, 2 decimals | THB; editable; historical snapshot ไม่เปลี่ยน |
| ราคาถังเต็ม | `product.fullTankPrice` | Required | `th-TH`, 2 decimals | THB; editable; historical snapshot ไม่เปลี่ยน |
| สถานะ | `product.isActive` | Required | badge “ใช้งาน” / “ปิดใช้งาน” พร้อม text/icon | backend authority |
| แก้ไขล่าสุด | `product.updatedAt` | Required | `th-TH`, Asia/Bangkok; fallback “—” ถ้า parse ไม่ได้ | read-only |
| Pagination | `meta.pagination` | Required for list | page/limit/totalItems/totalPages | ปัจจุบัน `apiClient` คืนเฉพาะ `data`; wrapper ต้องรองรับ meta |
| Search | URL `search` → query `search` | Optional | trim, max 100 | backend ค้นเฉพาะ brand |
| Status filter | URL `status` mapped to `includeInactive` | Derived | “ใช้งาน”=`false`; “ทั้งหมด”=`true`; “ปิดใช้งาน” ต้อง client-filter ไม่ได้ | ดู API gap |

### Read operations

- `GET /products?page={n}&limit={n}&search={term?}&includeInactive={boolean}` ผ่าน `src/features/products/product.api.ts`
- `GET /products/:id` ใช้หน้ารายละเอียด/แก้ไข ไม่จำเป็นต่อ list row
- Fetch ใน Server Component ผ่าน server-side `apiClient`; token มาจาก httpOnly cookie เท่านั้น
- Product list ต้องรับทั้ง `data.products` และ `meta.pagination`; shared response/client contract ปัจจุบันต้องขยายโดยไม่กระทบ caller เดิม

### Mutations

- Create: `POST /products` JSON fields `brand`, `weightKg`, `exchangeCostPrice`, `exchangeSalePrice`, `fullTankPrice`
- Update/reactivate: `PATCH /products/:id`; reactivate ส่ง `{ isActive: true }`
- Deactivate: `DELETE /products/:id`; เป็น idempotent soft delete
- Image endpoints แยกจาก list screen และควรอยู่ใน product form/image manager
- ทุก mutation ต้องทำผ่าน Server Action หรือ frontend Route Handler ที่ตรวจ session/role และเรียก feature wrapper; success แล้ว `revalidatePath('/products')`

### API gaps

- Blocker ต่อการทำภาพแบบตรงทุกช่อง: ไม่มี category, SKU, inventory quantity, stock threshold/status และ aggregated stock summary
- Major: ไม่มี `isActive` filter แบบเลือก inactive-only; `includeInactive=true` คืนทั้งสองสถานะ
- Major: current `apiClient<T>()` ทิ้ง `meta`, ทำให้ใช้ server pagination ไม่ได้โดยไม่ขยาย response contract
- Minor: ไม่มี facets สำหรับ brand/category dropdown; ห้ามโหลดทุกหน้าเพื่อสร้าง dropdown ใน browser
- Proposal: เพิ่ม endpoint/read model ที่ backend เป็นเจ้าของ เช่น product list DTO รวม `inventoryBalance` และ `stockStatus` ที่ backend derive ตาม approved threshold หรือเพิ่ม dedicated summary/facet endpoints
- จนกว่า gap จะปิด: ซ่อน category/brand dropdown, stock columns และ stock summary; แสดง summary เฉพาะ `totalItems` และ active/inactive เมื่อแหล่งข้อมูลยืนยันได้ ห้ามใช้ mock numbers

## 8. Rendering and component boundaries

- Server-rendered regions: page header, URL query parsing, initial API read, summary ที่ยืนยันได้, table content และ pagination links
- Client-interactive regions: debounced search/status toolbar, refresh button, deactivate/reactivate confirmation dialog, mutation pending/toast
- Cache/refresh behavior: fresh operational data (`cache: 'no-store'`); filter/page navigation fetch ใหม่; manual refresh รักษา URL; ไม่มี silent polling
- Shared dependencies: `PageHeader`, app shell, `Button`, `Input`, `Card`, `Toast`, icons; ต้องขยาย `Select`, `Table`, `Dialog` ให้มี styling/semantics ก่อนใช้งาน
- Proposed reusable components: `StatusBadge`, `Pagination`, `EmptyState`, `ProductImage`; วาง domain-neutral component ใต้ `src/components/ui`/`icon` และ product-specific composition ใต้ `src/features/products`
- Page file ทำเฉพาะ route composition/data boundary; product toolbar/table/actions อยู่ใน feature folder
- Next.js deprecation/behavior note: อย่าใช้ Pages Router data methods; URL search params และ dynamic params ใน App Router version นี้เป็น async contract ตาม local docs เมื่อ type ของ page ต้องใช้

## 9. UI states

| State | Visible behavior/copy | Available actions | Recovery or transition |
| --- | --- | --- | --- |
| Initial loading | shell/header คงอยู่; toolbar/table skeleton ที่รักษาความสูง | navigation ยังใช้ได้ | replace เมื่อ server data พร้อม |
| Background refresh | content เดิมคงอยู่, refresh แสดง spinner/`aria-busy` | ห้ามกด refresh ซ้ำ | success replace data; failure toast |
| Populated success | แสดงผลลัพธ์, range และ pagination จาก server | search/filter/create/edit/status | URL navigation หรือ mutation |
| Empty database | “ยังไม่มีสินค้า” + “เพิ่มสินค้าแรก” | เพิ่มสินค้า, รีเฟรช | ไป `/products/new` |
| Empty filtered | “ไม่พบสินค้าที่ตรงกับคำค้นหรือเงื่อนไข” | ล้างตัวกรอง, รีเฟรช | กลับ page 1 พร้อม filter ใหม่ |
| Partial image | placeholder เฉพาะ row; table ยังใช้งานได้ | actions ปกติ | ไม่ fail ทั้งหน้าเพราะรูปเดียว |
| Validation error | ใต้ field ใน form/dialog ตาม error; list query invalid normalize หรือแสดง request error | แก้ค่า/ลองใหม่ | submit ใหม่ |
| API error | “โหลดข้อมูลสินค้าไม่สำเร็จ” และ request ID ถ้ามี | “ลองอีกครั้ง” | refresh query เดิม |
| Mutation pending | ปุ่มต้นทาง disabled + spinner; dialog ปิดไม่ได้ด้วย submit ซ้ำ | cancel disabled เฉพาะช่วง critical request | success/failure |
| Mutation failure | dialog/input คงอยู่; “ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง” + request ID | ลองใหม่/ยกเลิก | ไม่มี optimistic state ค้าง |
| Unauthorized | redirect ไป clear-session/login ตาม auth boundary | login | กลับหลัง auth ตาม policy |
| Forbidden | “คุณไม่มีสิทธิ์เข้าถึงหน้าสินค้า” | กลับแดชบอร์ด | backend 403 authoritative |
| Not found | ใช้กับ edit/detail ไม่ใช่ list: “ไม่พบสินค้านี้” | กลับรายการสินค้า | `/products` |
| Offline/network | “ไม่สามารถเชื่อมต่อบริการได้” | ลองอีกครั้ง | request ใหม่; ไม่อ้างว่า mutation สำเร็จ |

## 10. Interaction contract

| Action | Visibility/enabled rule | Confirmation | Pending behavior | Success | Failure |
| --- | --- | --- | --- | --- | --- |
| Search | ADMIN; enabled เมื่อหน้า ready | ไม่มี | debounce 400 ms, reset page=1 | URL/data update | error region; query คงอยู่ |
| Status filter | ADMIN | ไม่มี | reset page=1 | URL/data update | คืนค่าที่เลือกและแสดง error |
| Refresh | ADMIN | ไม่มี | spinner, disabled | list refresh; toast ไม่จำเป็น | error toast + retry |
| Add product | ADMIN | ไม่มี | navigation feedback จาก route | `/products/new` | route error boundary |
| Edit | ADMIN; ทุก row รวม inactive | ไม่มี | navigate | `/products/{id}/edit` | not-found/error state |
| Deactivate | เฉพาะ active row | dialog: “ปิดใช้งานสินค้านี้?” และแจ้งว่าจะไม่ลบประวัติ | confirm disabled/spinner; no optimistic removal | toast “ปิดใช้งานสินค้าแล้ว”; refresh | dialog คงอยู่; แสดง backend message ที่ปลอดภัย |
| Reactivate | เฉพาะ inactive row | dialog: “เปิดใช้งานสินค้านี้อีกครั้ง?” | เช่นเดียวกัน | toast “เปิดใช้งานสินค้าแล้ว”; refresh | เช่นเดียวกัน |
| Change page/size | เมื่อ pagination มีมากกว่า 1 หน้า/รองรับ size | ไม่มี | table pending | URL/data update; scroll/focus heading/table | error with retry |

## 11. Field and validation rules

### List controls

| Field | Input/control | Frontend guidance | Backend-authoritative rule | Error copy |
| --- | --- | --- | --- | --- |
| ค้นหา | search input | trim, 1–100 chars; placeholder “ค้นหาจากยี่ห้อสินค้า” | backend partial case-insensitive brand match | “คำค้นหาต้องไม่เกิน 100 ตัวอักษร” |
| สถานะ | select | ใช้งาน/ทั้งหมด; inactive-only ยังไม่เปิดจน API รองรับ | `includeInactive` parsing | “ตัวกรองสถานะไม่ถูกต้อง” |
| จำนวนต่อหน้า | select | 10/20/50/100; default 20 | integer 1–100 | normalize เป็น 20 หาก URL ไม่ถูกต้อง |

### Product write fields (summary for linked create/edit screen)

| Field | Input/control | Frontend guidance | Backend-authoritative rule | Error copy |
| --- | --- | --- | --- | --- |
| ยี่ห้อ | text | required, trim, max 100 | string 1–100 | “กรุณาระบุยี่ห้อไม่เกิน 100 ตัวอักษร” |
| น้ำหนัก (กก.) | decimal | required, >0, max 2 decimals | decimal string >0 | “น้ำหนักต้องมากกว่า 0 และมีทศนิยมไม่เกิน 2 ตำแหน่ง” |
| ราคาทุนแลก | decimal | required, ≥0, max 2 decimals | decimal string ≥0 | “ราคาต้องไม่ติดลบและมีทศนิยมไม่เกิน 2 ตำแหน่ง” |
| ราคาขายแลก | decimal | เหมือนด้านบน | backend authority | เหมือนด้านบน |
| ราคาถังเต็ม | decimal | เหมือนด้านบน | backend authority | เหมือนด้านบน |
| เปิดใช้งาน | switch/checkbox (edit only) | ไม่ส่งใน create | optional boolean ใน PATCH | “ไม่สามารถเปลี่ยนสถานะได้” |

Frontend validation เป็น assistive เท่านั้น ต้องแสดง validation/error จาก backend และห้าม derive price/stock business rules เพิ่มเอง

## 12. Responsive behavior

- Desktop ≥1280px: toolbar แถวเดียว, summary แนวนอน, table ทุกคอลัมน์; action เป็น icon buttons พร้อม tooltip/accessible label
- Tablet 768–1279px: toolbar wrap 2 แถว; table horizontal scroll โดย sticky คอลัมน์สินค้าและ actions ถ้าทำได้โดยไม่บัง content
- Mobile <768px: toolbar stack; CTA “เพิ่มสินค้า” full width; product list เปลี่ยนเป็น stacked row/card แสดงรูป+brand+weight, status, ราคาขายแลกเป็นข้อมูลเด่น และ disclosure สำหรับราคาที่เหลือ/updated time
- Dense table strategy: mobile ไม่ย่อ font จนอ่านยากและไม่บังคับ scroll กว้างหลายคอลัมน์; actions ใช้ข้อความ “แก้ไข”/“ปิดใช้งาน” หรือ icon พร้อม visible tooltip ไม่ใช้สีอย่างเดียว
- Pagination mobile: previous/next + “หน้า X จาก Y”; page number ทั้งหมดไม่จำเป็น

## 13. Accessibility

- Heading/landmarks: shell `nav`, page `main`, `h1` เดียวจาก `PageHeader`, toolbar เป็น `form role=search`, table มี caption ที่ซ่อนได้
- Labels: ทุก input/select มี `<label>`; icon buttons มี Thai `aria-label` เช่น “แก้ไขสินค้า ปตท. 15 กก.”
- Keyboard/focus: tab order ตามภาพ; Enter submit search; Escape ปิด dialog; dialog trap focus, initial focus ที่ cancel สำหรับ destructive action และคืน focus ไปปุ่มเดิมเมื่อปิด
- Errors: route error ใช้ `role=alert`; mutation/toast ใช้ `aria-live=polite` (urgent auth/permission ใช้ assertive ตามเหมาะสม)
- Status: badge มีข้อความ “ใช้งาน/ปิดใช้งาน” ไม่พึ่งสี; loading ใช้ `aria-busy`; disabled state ชัดเจน
- Images: meaningful alt ตาม product; decorative placeholder icon ซ่อนจาก screen reader
- Touch target: actions อย่างน้อย 44×44px บน mobile

## 14. Acceptance criteria

1. Given Admin มี session ถูกต้อง เมื่อเปิด `/products` โดยไม่มี query แล้วเห็นเฉพาะ active products หน้า 1 จำนวนไม่เกิน 20 รายการ เรียงตาม backend พร้อม pagination ที่ตรงกับ `meta`.
2. Given product มี primary image เมื่อ list render แล้วรูปนั้นถูกใช้; เมื่อไม่มีรูป จะแสดง placeholder โดยหน้าไม่ fail.
3. Given Admin พิมพ์ยี่ห้อ เมื่อ debounce หรือกด Enter แล้ว URL มี `search`, page reset เป็น 1 และผลลัพธ์มาจาก server search.
4. Given filter/search ไม่พบสินค้า เมื่อ response สำเร็จแบบ array ว่าง จะแสดง “ไม่พบสินค้าที่ตรงกับคำค้นหรือเงื่อนไข” และปุ่มล้างตัวกรอง.
5. Given ไม่มีสินค้าเลย เมื่อเปิด default list จะแสดง “ยังไม่มีสินค้า” และ CTA “เพิ่มสินค้าแรก”.
6. Given active product เมื่อ Admin ยืนยัน “ปิดใช้งาน” แล้ว frontend เรียก `DELETE /products/:id` เพียงครั้งเดียว, ป้องกัน submit ซ้ำ, refresh list และไม่แสดงข้อความว่า record ถูกลบถาวร.
7. Given backend ตอบ mutation failure เมื่อดำเนินการแล้ว dialog และข้อมูลเดิมยังอยู่, ไม่มี optimistic state ค้าง และมี retry/request ID เมื่อมี.
8. Given inactive product แสดงอยู่ เมื่อ Admin เลือกเปิดใช้งานแล้ว frontend ส่ง `PATCH { isActive: true }`, refresh list และแสดงผลตาม response ล่าสุด.
9. Given unauthenticated/forbidden request เมื่อเข้า screen แล้ว token ไม่ถูกเปิดเผยใน browser storage และผู้ใช้ถูก redirect หรือเห็น forbidden state ตาม status จริง.
10. Given viewport mobile เมื่อเปิดหน้าแล้ว primary action, search, status และข้อมูลจำเป็นของสินค้าใช้งานได้โดยไม่ต้องเลื่อนแนวนอนผ่าน table หลายคอลัมน์.
11. Given keyboard-only user เมื่อเปิด/ปิด confirmation dialog แล้ว focus ถูก trap และคืนกลับ trigger; ทุก action มี accessible name.
12. Given API ยังไม่คืน stock/category เมื่อเปิดหน้าแล้ว UI ไม่แสดงตัวเลข mock, ไม่คำนวณ low-stock เอง และไม่แสดง filter ที่ทำงานไม่ตรง contract.
13. Given Admin แก้ราคา เมื่อบันทึกสำเร็จแล้ว list แสดง master price ล่าสุด แต่ UI ไม่อ้างว่าราคาใน transaction history ถูกแก้ย้อนหลัง.

## 15. Risks and follow-up

- Implementation mismatches: route/table/API/types/schema ปัจจุบันเป็น placeholder; `Select`, `Table`, `Dialog` เป็น raw wrappers ที่ยังไม่พอสำหรับภาพและ accessibility; `apiClient` ไม่คืน response meta
- Breaking-change concerns: การขยาย `apiClient` ให้คืน meta อาจกระทบ auth callers ควรเพิ่ม overload/helper เช่น `apiClientWithMeta` แทนเปลี่ยน return shape ทั้งระบบทันที
- Dependencies: backend running contract, session cookie, product list meta, image host configuration และ approved decision เรื่อง stock/category
- API document follow-up: เปลี่ยนสถานะ `product-spec.md` จาก “ยังไม่มี implementation” ให้ตรงกับ source/test ปัจจุบัน
- Product follow-up: แยก screen spec สำหรับ create/edit/image manager ก่อน implement forms เต็มรูปแบบ
- Design follow-up: หากต้องตรงภาพทุกช่อง ให้ product/backend owners อนุมัติ category/SKU/stock threshold และ composite read model ก่อน
- Verification for implementation phase: lint เสมอ; build เมื่อเพิ่ม route/server-client boundary/shared imports; browser test desktop/tablet/mobile และ auth/error flows

