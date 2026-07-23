# Screen Specification: สร้างรายการใหม่ (New Transaction)

## 1. Document status

- Status: Ready for review
- Owner: KMG-SERVICE-WEB / `transactions`
- Last updated: 2026-07-23
- Related designs:
  - `/Users/gas.bit/Downloads/Generated image 1.png`
  - `/Users/gas.bit/Downloads/Generated image 1 (1).png`
  - `/Users/gas.bit/Downloads/Generated image 1 (2).png`
- Related API:
  - `../KMG-SERVICE-API/src/modules/transactions/transaction-spec.md`
  - `../KMG-SERVICE-API/src/modules/transactions/transaction.routes.ts`
  - `../KMG-SERVICE-API/src/modules/transactions/transaction.schema.ts`
  - `../KMG-SERVICE-API/src/modules/transactions/transaction.service.ts`
  - `../KMG-SERVICE-API/src/modules/transactions/transaction.types.ts`
  - `../KMG-SERVICE-API/src/modules/products/product-spec.md`
- User-approved decisions:
  - คงหน้าตาข้อมูลลูกค้าตามภาพ แต่ปิดใช้งาน “ลูกค้าเดิม” ใน MVP
  - เมื่อเลือก “คืนถัง” ให้ส่งต่อไป flow เลือกรายการยืมเดิม
  - ไม่มีส่วนลด
  - ตารางสินค้าใช้เฉพาะข้อมูลที่ Product API รองรับ
  - รายการยืมถังมีวันคาดว่าจะคืนและเงินมัดจำแยกต่อสินค้า

## 2. Summary

- Purpose: ให้ Admin สร้าง transaction ใหม่อย่างถูกประเภท ผ่าน wizard ที่แบ่งข้อมูลเป็นขั้นสั้น ๆ และส่งข้อมูลไปยัง backend โดยไม่ย้าย business authority มาไว้ใน browser
- User outcome: Admin เลือกประเภทรายการ กรอก customer snapshot เลือกสินค้าและจำนวน ตรวจสอบข้อมูล แล้วสร้างรายการสำเร็จพร้อมเห็นเลขรายการ สถานะ และเลขคิวเมื่อเป็นรายการส่งแก๊ส
- Route: `/transactions/new`
- Owning route: `src/app/(app)/transactions/new/page.tsx`
- Owning feature: `src/features/transactions`
- Related handoff route: `/loans?intent=return` สำหรับ `RETURN_CYLINDER`
- Allowed roles: `ADMIN` เท่านั้นใน MVP ทั้งการแสดง UI และ backend enforcement
- Visual thesis: ใช้ app shell สีกรมท่าเดิม พื้นที่ทำงานสีขาว–เทา และ stepper สีน้ำเงินตามภาพ โดยเน้นความชัดเจนของขั้นตอนมากกว่าการแสดงข้อมูลพร้อมกันทั้งหมด
- Interaction thesis: wizard เก็บ draft เฉพาะใน memory ของ Client Component, validate เฉพาะขั้นที่กำลังออก, แสดง summary จาก master data เพื่อการตรวจสอบ แต่ backend เป็นผู้ derive ราคา ต้นทุน ยอดรวม สถานะ คิว และ stock effects จริง

## 3. Scope

### In scope

- Wizard 4 ขั้น:
  1. เลือกประเภทรายการ
  2. ข้อมูลลูกค้า
  3. รายการสินค้า
  4. ยืนยันข้อมูล
- รองรับการสร้างโดยตรง 4 ประเภท:
  - `DELIVERY_EXCHANGE`
  - `WALK_IN_EXCHANGE`
  - `BORROW_CYLINDER`
  - `BUY_FULL_TANK`
- แสดงตัวเลือก `RETURN_CYLINDER` และส่งต่อไป flow เลือกรายการยืมเดิม
- Customer snapshot แบบกรอกใหม่: ชื่อ เบอร์โทร และที่อยู่
- คง UI “ลูกค้าเดิม” และช่องค้นหาตามภาพในสถานะ disabled
- คงกลุ่มประเภทเอกสาร/เลขเอกสารตามภาพในสถานะ disabled พร้อมคำอธิบายว่า API ยังไม่รองรับ
- Product search/list/pagination จาก active product master
- แสดงรูปสินค้า ยี่ห้อ น้ำหนัก ราคาตาม transaction type และจำนวนที่เลือก
- Borrow fields ต่อสินค้า: วันที่คาดว่าจะคืนและเงินมัดจำ
- Summary และ confirmation โดยไม่มีส่วนลด
- Loading, empty, validation, API error, insufficient stock, inactive product, unauthorized และ forbidden states
- ป้องกัน duplicate product และ duplicate submission
- ส่ง mutation ผ่าน server-side auth boundary

### Out of scope

- Customer master, การค้นหาลูกค้าจริง และการบันทึกเลขเอกสาร
- การสร้าง `RETURN_CYLINDER` ผ่าน `POST /transactions`
- การออกแบบรายละเอียดเต็มของ Loan Return screen; เอกสารนี้กำหนดเฉพาะ handoff
- ส่วนลด, price override, cost override และการแก้ราคาจากหน้าสร้างรายการ
- SKU, category, product type, stock balance, stock threshold และ stock availability indicator
- การเลือกถังเปล่าเป็น product แยก; `EMPTY_IN` เป็น backend-owned inventory effect ของ exchange
- อุปกรณ์ที่ไม่อยู่ใน Product contract ปัจจุบัน
- Payment method, payment status, receipt และ print
- การบันทึก draft ลง `localStorage`, `sessionStorage`, cookie หรือ backend
- การเปลี่ยนสถานะ transaction หลังสร้าง; อยู่ใน transaction detail/queue workflow

## 4. Sources and decisions

### Confirmed sources

- `AGENTS.md`: ใช้ Server Components เป็นค่าเริ่มต้น, interactive UI อยู่ใน Client Component ขนาดจำกัด, ใช้ shared UI/icons/app shell และห้ามถือ access token ใน browser JavaScript
- `Context.md`, `Business-Flow.md`, `Database-Design.md`: transaction รองรับหลายสินค้าและต้องเก็บ customer/product/price snapshots โดย backend เป็นผู้ดูแล queue, stock, loan และ status effects
- `Frontend-Architecture.md`, `Frontend-Implement-Plan.md`: route `/transactions/new` เป็น client-heavy form; final total ใน frontend เป็นเพียง display preview
- Transaction implementation ปัจจุบัน mount ที่ `/api/transactions`, ใช้ Bearer JWT และ `ADMIN` role
- `POST /api/transactions` รองรับเฉพาะ `DELIVERY_EXCHANGE`, `WALK_IN_EXCHANGE`, `BORROW_CYLINDER` และ `BUY_FULL_TANK`
- `RETURN_CYLINDER` ต้องเกิดจาก loan return workflow ที่อ้างอิง loan เดิม
- Create request ไม่รับ `status`, `transactionNo`, `queueDate`, `queueNo`, `itemAction`, `unitPrice`, `costPrice`, `lineTotal`, `totalAmount` หรือ `customerId`
- Backend derive ราคาและต้นทุนจาก active product master:
  - Delivery/Walk-in ใช้ `exchangeSalePrice` / `exchangeCostPrice`
  - Buy full tank ใช้ `fullTankPrice` / `fullTankCostPrice`
  - Borrow ใช้ `unitPrice = 0.00`; deposit ไม่รวม transaction total
- `customerName` บังคับทุก create type; `customerAddress` บังคับเฉพาะ `DELIVERY_EXCHANGE`
- Product ซ้ำใน create payload ไม่ได้รับอนุญาต
- `BORROW_CYLINDER` เก็บ `expectedReturnDate` และ `depositAmount` แยกต่อ item; expected date เป็น optional และ deposit default `"0.00"`
- Product list รองรับ `page`, `limit`, `search` ที่ค้นเฉพาะ brand และ `includeInactive`; product DTO มีรูป ยี่ห้อ น้ำหนัก ราคา และ active status แต่ไม่มี stock/SKU/category
- Next.js guide ของ version ใน repository: page/layout เป็น Server Components โดยค่าเริ่มต้น; interactive wizard เป็น Client Component; Server Action ต้องตรวจ authentication/authorization ซ้ำ; props จาก server ไป client ต้อง serializable
- Next.js version ที่ตรวจคือ `16.2.9`; guide ที่เกี่ยวข้องไม่มี deprecation notice สำหรับรูปแบบนี้ แต่มี security warning ให้ตรวจ authentication/authorization ภายในทุก Server Action แม้ route จะถูก guard แล้ว

### User-approved conflict resolutions

- Customer UI: คงโครงตามภาพ แต่ `ลูกค้าเดิม` และการค้นหาลูกค้า disabled; `ลูกค้าใหม่` ถูกเลือกเป็นค่าเริ่มต้น
- Return cylinder: เลือกประเภทได้ แต่ปุ่มถัดไปส่งไป flow เลือกรายการยืมเดิมแทน wizard create ปกติ
- Discount: ตัดออกทั้ง input, calculation และ payload
- Product table: ไม่แสดง stock, SKU, category หรือสถานะ stock; แสดงเฉพาะข้อมูล Product API จริง
- Borrow fields: แสดงต่อสินค้าในขั้นที่ 3

### Assumptions

- ภาษา UI หลักเป็นภาษาไทย; `New Transaction` ในภาพเปลี่ยนเป็นหัวข้อ `สร้างรายการใหม่` ให้ตรง navigation ปัจจุบัน
- การเลือก `RETURN_CYLINDER` ยังไม่ navigate ทันที เพื่อป้องกันการแตะผิด; card ถูกเลือกก่อน แล้วปุ่มหลักเปลี่ยนข้อความเป็น `เลือกรายการยืม` และ navigate เมื่อกด
- Handoff ใช้ `/loans?intent=return`; Loan feature ต้องอ่าน query นี้และเปิดมุมมอง active loans สำหรับเลือกคืน
- ช่อง “ชื่อที่อยู่” เป็น label ชั่วคราวใน draft และไม่ถูก persist แยก
- ช่องที่อยู่แบบแยกส่วนถูกรวมเป็น `customerAddress` หนึ่ง string ก่อนส่ง โดยเรียง: ที่อยู่ → ตำบล/แขวง → อำเภอ/เขต → จังหวัด → รหัสไปรษณีย์ → หมายเหตุที่อยู่; ตัดช่องว่างหัวท้าย, ไม่รวมค่าที่ว่าง และเชื่อมส่วนด้วยช่องว่างหนึ่งตัว
- จังหวัดใช้ `Select` ตามภาพ โดยอ่านรายการจาก proposed domain-neutral constant `src/lib/constants/thai-provinces.ts`; ต้องตรวจรายชื่อ 77 จังหวัดก่อน implement และไม่ต้องเรียก backend
- Address note เป็นส่วนหนึ่งของ `customerAddress`; transaction-level `note` เป็น field แยกในขั้นยืนยัน
- กลุ่มประเภทเอกสาร/เลขเอกสารยังคงตำแหน่งตามภาพแต่ disabled เพื่อไม่ให้ผู้ใช้กรอกข้อมูลที่ API ไม่ persist
- Product list แสดง active products เท่านั้น และใช้ backend pagination default `20` รายการต่อหน้า
- Search product ทำเมื่อกด Enter/ปุ่มค้นหา หรือหยุดพิมพ์ 400 ms; ค้นเฉพาะ brand ตาม API
- Preview price ใช้ current product master ที่โหลดมา แต่ข้อความกำกับต้องแจ้งว่า `ราคาสุดท้ายยืนยันโดยระบบเมื่อสร้างรายการ`
- หลัง create สำเร็จ navigate ไป `/transactions/{id}` และ toast `สร้างรายการสำเร็จ`
- Draft อยู่ใน memory เท่านั้น การ refresh/tab close ทำให้ draft หาย; การออกจาก route หลังเริ่มกรอกต้องมี confirm dialog

### Open decisions and API gaps

- Blocker สำหรับ Return flow: loan list/return API และ frontend Loan feature ยังไม่มี implementation ที่ใช้งานได้ แม้ transaction contract กำหนดว่าต้องใช้ workflow นี้
- Major: Customer API ยังไม่มี จึงไม่สามารถเปิด `ลูกค้าเดิม`, customer search หรือ `customerId`
- Major: API ไม่มี document type/document number; UI ต้อง disabled จน contract ได้รับอนุมัติ
- Major: Transaction API specification header ระบุว่า “ยังไม่มี implementation” แต่ routes/schema/service/repository/tests มี implementation แล้ว ควรอัปเดตสถานะเอกสาร backend
- Major documentation mismatch: เอกสาร frontend เก่าบางส่วนใช้ `/api/v1` และ client-supplied pricing แต่ implementation จริงใช้ `/api` และ server-derived pricing; สเปกนี้ยึด implementation/transaction contract ปัจจุบัน
- Minor: ยังไม่มี endpoint ที่ค้น product ด้วย weight หรือ sort ตามชื่อ; UI ห้ามแสดง control ที่สัญญาว่าทำได้
- Permission contract ยังมีเฉพาะ `ADMIN`; future roles ไม่อยู่ในสเปกนี้

## 5. Navigation and workflow

### Entry points

- Sidebar `รายการ > สร้างรายการใหม่`
- ปุ่ม `สร้างรายการใหม่` จาก dashboard หรือ transaction history
- URL `/transactions/new`

### Exit paths

- `ยกเลิก` → `/transactions`
- Back จาก step 2–4 → step ก่อนหน้าโดยรักษา draft
- Create สำเร็จ → `/transactions/{id}`
- `RETURN_CYLINDER` → `/loans?intent=return`
- Sidebar navigation หลังเริ่มกรอก → confirm `ออกจากหน้านี้หรือไม่? ข้อมูลที่ยังไม่บันทึกจะหาย`

### Primary workflow

1. Server page ตรวจ session/role และโหลด active product หน้าแรกผ่าน feature API wrapper
2. Client wizard เริ่มที่ step 1 โดยยังไม่เลือกประเภท
3. Admin เลือก transaction type
4. ถ้าเลือก `RETURN_CYLINDER`, ปุ่มหลักเปลี่ยนเป็น `เลือกรายการยืม`; เมื่อกดให้ navigate ไป Loan Return flow
5. สำหรับอีก 4 ประเภท กด `ถัดไป` ไป step 2
6. Step 2 แสดง `ลูกค้าใหม่` เป็นตัวเลือกที่ใช้งานได้ และกรอก customer snapshot
7. ระบบ validate field ที่จำเป็นตามประเภทก่อนเข้า step 3
8. Step 3 ค้นหา product, เพิ่มจำนวน และถ้าเป็น borrow ให้กรอกเงื่อนไขต่อ item
9. ต้องมี product อย่างน้อย 1 รายการก่อนเข้า step 4
10. Step 4 แสดงประเภท ลูกค้า ที่อยู่ รายการสินค้า preview total และ note
11. Admin กด `ยืนยันสร้างรายการ`
12. Server-side mutation ตรวจ session/role, validate payload และเรียก `POST /api/transactions`
13. Success: revalidate `/dashboard`, `/transactions`, `/queues`, `/loans`; navigate ไป transaction detail
14. Failure: คง draft/step 4 ไว้ แสดง error ที่แก้ไขหรือ retry ได้ และไม่อ้างว่ารายการถูกสร้าง

### Type-specific workflow

| Type | Step 2 requirement | Step 3 behavior | Preview pricing | Success result |
| --- | --- | --- | --- | --- |
| `DELIVERY_EXCHANGE` | ชื่อและที่อยู่บังคับ; เบอร์โทร optional | Product + quantity | `exchangeSalePrice` | `PENDING`, มี queue date/no จาก backend |
| `WALK_IN_EXCHANGE` | ชื่อบังคับ; เบอร์/ที่อยู่ optional | Product + quantity | `exchangeSalePrice` | `COMPLETED` |
| `BORROW_CYLINDER` | ชื่อบังคับ; เบอร์/ที่อยู่ optional | Product + quantity + expected date + deposit ต่อ item | `0.00`; deposit แสดงแยก | `COMPLETED`, backend สร้าง loan ต่อ item |
| `BUY_FULL_TANK` | ชื่อบังคับ; เบอร์/ที่อยู่ optional | Product + quantity | `fullTankPrice` | `COMPLETED` |
| `RETURN_CYLINDER` | ไม่เข้า step 2 | ไม่เข้า generic product picker | Not applicable | Handoff ไป Loan Return |

### Alternate and failure paths

- Product master ว่าง: แสดง empty state และ link ไป `/products/new`; ห้ามไป step 4
- Search ไม่พบ: แสดง `ไม่พบสินค้าที่ตรงกับคำค้น` พร้อมปุ่มล้างคำค้น
- Product inactive ระหว่างเลือกกับ submit: backend `CONFLICT`; แจ้งให้กลับ step 3 และ refresh product list
- Stock ไม่พอ: backend `INSUFFICIENT_STOCK`; คง draftและชี้รายการที่เกี่ยวข้องเมื่อ `details` ระบุได้
- Session หมดอายุ: clear session/redirect login; ห้ามเก็บ draft ที่มี PII ลง storage
- Network/API fail: คง draftใน memoryและให้ retry
- Duplicate click: submit เพียง request เดียว

## 6. Screen composition

| Region | Content | Shared component | Responsive behavior |
| --- | --- | --- | --- |
| App shell | Sidebar/mobile nav/user/date/notification | `AppSidebar`, `MobileNav`, `NavigationMenu`, `PageHeader` | Sidebar desktop; drawer mobile; content ไม่ render sidebar ซ้ำ |
| Page header | `สร้างรายการใหม่` | `PageHeader` | วันที่ซ่อนตาม behavior เดิมบนจอแคบ |
| Stepper | 4 ขั้นพร้อม current/completed/upcoming state | Proposed shared `Stepper` | Desktop แนวนอน; mobile แสดง `ขั้น X จาก 4` + ชื่อ current step และ compact progress |
| Step 1 heading | `เลือกประเภทรายการ` / `กรุณาเลือกประเภทรายการที่ต้องการทำ` | `TextLabel` | Center desktop; left aligned mobile |
| Type cards | 5 transaction types พร้อมชื่อและคำอธิบาย | `Card`, `Button` semantics, shared transaction icons | 3+2 grid desktop; 2 columns tablet; 1 column mobile |
| Step 2 customer panel | Customer mode, disabled search/document UI, name/phone | `Card`, `Input`, `Select`, `TextLabel` | 2 panels desktop; stack mobile |
| Step 2 address panel | Address label, address, subdistrict, district, province, postal code, note | `Card`, `Input`, proposed shared `Textarea`, `Select` | 3-column subfields desktop; stack mobile |
| Step 3 toolbar | Brand search and clear search | `Input`, `Button`, `SearchIcon` | One row desktop; stack mobile |
| Step 3 product table | Image, brand/weight, applicable price, quantity selector, selected amount | `Table`, `Input`/quantity control, shared icons | Desktop table; mobile stacked product rows |
| Step 3 selected summary | Selected items, quantities, per-line preview, borrow terms, preview total | `Card`, `Button`, `TrashIcon` | Right rail desktop; below list mobile |
| Step 3 borrow fields | Expected return date, deposit amount, item note per selected product | `Input`, `TextLabel` | Inline expandable selected row desktop; stacked mobile |
| Step 3 pagination | Result range, previous/next/pages | Proposed shared `Pagination` | Compact previous/next on mobile |
| Step 4 summary | Type, customer snapshot, address, items, borrow terms, note, preview totals, backend-authority notice | `Card`, `TextLabel` | 2-column summary desktop; single column mobile |
| Footer actions | Cancel, Back, Next/Select loan/Confirm | `Button` | อยู่ใน document flow; ชิดล่าง viewport เมื่อ content สั้น และต่อท้าย content เมื่อยาว |
| Feedback | Inline errors, alert summary, toast, confirm-leave dialog | `Dialog`, `Toast` | Viewport-safe; error summaryอยู่ก่อน current step content |

### Step 1 type-card copy

| Type | Thai label | Description |
| --- | --- | --- |
| `DELIVERY_EXCHANGE` | ส่งแก๊สแลกถัง | จัดส่งแก๊สและรับถังเปล่า |
| `WALK_IN_EXCHANGE` | แลกหน้าร้าน | ลูกค้านำถังมาแลกที่ร้าน |
| `BORROW_CYLINDER` | ยืมถัง | ยืมถังแก๊สและระบุเงื่อนไขต่อสินค้า |
| `RETURN_CYLINDER` | คืนถัง | เลือกรายการยืมเดิมเพื่อบันทึกการคืน |
| `BUY_FULL_TANK` | ซื้อถังเต็ม | ซื้อถังเต็มโดยไม่มีถังเปล่ามาแลก |

## 7. Data contract

### Wizard and customer data

| UI datum | API/source field | Requirement | Format/fallback | Ownership or notes |
| --- | --- | --- | --- | --- |
| Current step | Client wizard state | Derived | 1–4 | UI only |
| Transaction type | `transactionType` | Required | enum code; Thai label in UI | User selected; backend validates |
| Customer mode | UI state | Derived | `NEW`; `EXISTING` disabled | ไม่ส่ง API |
| Customer search | No API field | Not available | disabled + `ยังไม่เปิดใช้งาน` | Future Customer Master |
| Document type | No API field | Not available | disabled + `ยังไม่รองรับ` | ห้ามเก็บหรือส่ง |
| Document number | No API field | Not available | disabled | ห้ามเก็บหรือส่ง |
| ชื่อ-นามสกุล/ชื่อลูกค้า | `customerName` | Required | trim, 1–150 chars | Snapshot; backend authority |
| เบอร์โทรศัพท์ | `customerPhone` | Optional | trim; fallback `—` | Snapshot; max 50 |
| ชื่อที่อยู่ | Draft only | Optional | เช่น `บ้าน`, `ที่ทำงาน` | ไม่ persist แยก |
| ที่อยู่ | ส่วนหนึ่งของ `customerAddress` | Conditional | multiline plain text | Required for delivery |
| ตำบล/แขวง | ส่วนหนึ่งของ `customerAddress` | Optional | plain text | Client composes |
| อำเภอ/เขต | ส่วนหนึ่งของ `customerAddress` | Optional | plain text | Client composes |
| จังหวัด | ส่วนหนึ่งของ `customerAddress` | Optional | plain text/select | ไม่มี province API dependency |
| รหัสไปรษณีย์ | ส่วนหนึ่งของ `customerAddress` | Optional | 5 digits guidance | Backend รับ address string |
| หมายเหตุที่อยู่ | ส่วนหนึ่งของ `customerAddress` | Optional | plain text | ไม่ใช่ rich text |
| หมายเหตุรายการ | `note` | Optional | trim, fallback `—` | แยกจาก address |

### Product and item data

| UI datum | API/source field | Requirement | Format/fallback | Ownership or notes |
| --- | --- | --- | --- | --- |
| Product ID | Product `id` → item `productId` | Required | decimal string | IDs remain strings |
| รูปสินค้า | `product.images[]` | Required array | primary → first → placeholder | Current master visual only |
| ยี่ห้อ | `product.brand` | Required | plain text | Current master before create; backend snapshots |
| น้ำหนัก | `product.weightKg` | Required | `{value} กก.` | Decimal string |
| Active status | `product.isActive` | Required | list only active | Backend rechecks at create |
| ราคาแลก | `product.exchangeSalePrice` | Conditional display | THB 2 decimals | Delivery/Walk-in preview |
| ราคาถังเต็ม | `product.fullTankPrice` | Conditional display | THB 2 decimals | Buy full tank preview |
| ราคายืม | Derived display | Borrow only | `0.00 บาท` | Deposit is separate |
| Quantity | `items[].quantity` | Required | positive integer | Backend validates and stock authority |
| Item note | `items[].note` | Optional | trim | Per-item |
| Expected return | `items[].expectedReturnDate` | Optional, borrow only | `YYYY-MM-DD`; Thai display | Backend/loan authority |
| Deposit | `items[].depositAmount` | Optional, borrow only | decimal string, default `0.00` | Not part of transaction total |
| Preview line total | product price × quantity | Derived display | THB 2 decimals | Informational only |
| Preview total | sum preview lines | Derived display | THB 2 decimals | Backend returns authoritative `totalAmount` |
| Preview total deposit | sum deposits | Derived display, borrow only | THB 2 decimals | Label `เงินมัดจำรวม`; not sales |

### Create response

| UI datum | API/source field | Requirement | Format/fallback | Ownership or notes |
| --- | --- | --- | --- | --- |
| Transaction ID | `data.id` | Required | decimal string | Navigate detail |
| เลขรายการ | `data.transactionNo` | Required | `TX-YYYYMMDD-NNNN` | Backend generated |
| สถานะ | `data.status` | Required | Thai status label | Backend generated |
| วันที่คิว | `data.queueDate` | Nullable | Thai date / `—` | Delivery only |
| เลขคิว | `data.queueNo` | Nullable | integer / `—` | Delivery only |
| ยอดรวมจริง | `data.totalAmount` | Required | THB 2 decimals | Backend authoritative |
| Item snapshots | `data.items[]` | Required | brand/weight/price/quantity | History source of truth |
| Request ID | `meta.requestId` | Required envelope | show on failure/support details | API tracing |

### Read operations

- Product initial/list/search:
  - `GET /api/products?page={page}&limit={limit}&search={brand?}&includeInactive=false`
  - เรียกผ่าน `src/features/products/product.api.ts` หรือ transaction-owned adapter ที่ reuse Product DTO
  - Browser ห้ามแนบ Bearer token เอง
  - Search/pagination หลัง initial render ต้องผ่าน Server Action หรือ frontend Route Handler ที่ตรวจ session/role ซ้ำ แล้วจึงเรียก Product feature wrapper
- Product data เป็น current master data ใช้เพื่อเลือกและ preview เท่านั้น
- ไม่เรียก inventory endpoint และไม่แสดง stock quantity
- `RETURN_CYLINDER` handoff ต้องอ่าน active loans ผ่าน Loan feature เมื่อ API พร้อม ไม่ใช้ transaction list แทน loan list

### Mutations

- Create:
  - `POST /api/transactions`
  - Payload มีเฉพาะ `transactionType`, customer snapshot, optional `note`, และ `items`
  - ห้ามส่ง server-owned fields แม้มีอยู่ใน preview
- Return:
  - ไม่มี mutation จากหน้าจอนี้
  - Loan Return feature เป็นผู้สร้าง `RETURN_CYLINDER` ผ่าน backend-supported operation
- Server-side action/route handler ต้อง:
  1. ตรวจ session และ role ซ้ำ
  2. validate payload
  3. เรียก feature API wrapper
  4. map field/error safely
  5. revalidate routes ที่เกี่ยวข้องเมื่อ success

### Create payload examples

```json
{
  "transactionType": "DELIVERY_EXCHANGE",
  "customerName": "สมชาย ใจดี",
  "customerPhone": "0812345678",
  "customerAddress": "99/1 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพมหานคร 10110",
  "note": "ส่งก่อนเที่ยง",
  "items": [
    {
      "productId": "42",
      "quantity": 2
    }
  ]
}
```

```json
{
  "transactionType": "BORROW_CYLINDER",
  "customerName": "ร้านอาหารอิ่มดี",
  "customerPhone": "0899999999",
  "items": [
    {
      "productId": "42",
      "quantity": 1,
      "expectedReturnDate": "2026-07-30",
      "depositAmount": "500.00",
      "note": "ยืมใช้ในงานจัดเลี้ยง"
    }
  ]
}
```

### API gaps

- Customer search/master และ document fields
- Loan list/return operation ที่จำเป็นต่อ `RETURN_CYLINDER`
- Product search by weight และ explicit sort options
- Structured address contract; MVP ส่ง formatted snapshot string
- ไม่มี preflight stock availability endpointในสเปกนี้; create/status workflow เป็นผู้ตัดสิน `INSUFFICIENT_STOCK`

## 8. Rendering and component boundaries

- Server-rendered regions:
  - Route auth/permission boundary
  - `PageHeader`
  - Initial active product read
  - Static type metadata/copy
- Client-interactive regions:
  - `TransactionWizard`
  - Stepper state and draft
  - Customer/address inputs
  - Product search/pagination/select/quantity
  - Borrow item fields
  - Confirmation summary and dirty-state dialog
- Mutation boundary:
  - `createTransactionAction` เป็น Server Action หรือ frontend Route Handler ที่ตรวจ auth/role และเรียก `transaction.api.ts`
  - Client Component รับเฉพาะ serializable product DTO/draft/result
- Cache/refresh:
  - Initial product dataใช้ fresh read หรือ short revalidation ตาม Product feature; product searchต้องไม่พึ่ง stale browser cache
  - ก่อน final submitไม่ต้อง fetch priceซ้ำใน browser; backendอ่าน masterล่าสุดและคืน authoritative totals
  - Success revalidate `/dashboard`, `/transactions`, `/queues`, `/loans`; `/inventory` ยัง Hold
- Shared dependencies:
  - Existing: `PageHeader`, `Button`, `Input`, `Select`, `Card`, `CardContent`, `Table`, `Dialog`, `Toast`, `TextLabel`
  - Existing icons: `TruckIcon`, `ProductIcon`, `LoanIcon`, `RefreshIcon`, `SearchIcon`, `PlusIcon`, `TrashIcon`, `ArrowLeftIcon`, `CheckCircleIcon`
- Proposed shared primitives:
  - `Stepper`
  - `Textarea`
  - `Pagination`
  - `EmptyState`
  - `QuantityInput`
- Proposed feature components under `src/features/transactions`:
  - `TransactionWizard`
  - `TransactionTypeStep`
  - `TransactionCustomerStep`
  - `TransactionItemsStep`
  - `TransactionConfirmationStep`
  - `TransactionOrderSummary`
  - `BorrowItemFields`
- Page fileทำเฉพาะ route composition/data boundary; ห้ามฝัง wizard UI ทั้งหมดใน `page.tsx`
- Next.js version note:
  - Page/layout เป็น Server Components โดย default
  - Server Action ต้องตรวจ auth/authorization แม้ route ถูก guard แล้ว
  - หลีกเลี่ยง Pages Router APIs
  - ลด `"use client"` boundary ให้ครอบเฉพาะ wizard/interaction tree

## 9. UI states

| State | Visible behavior/copy | Available actions | Recovery or transition |
| --- | --- | --- | --- |
| Initial route loading | App shell + skeleton header/step content; `กำลังเตรียมหน้าสร้างรายการ` | Sidebarตาม loading policy | Product read success/error |
| Step 1 initial | ไม่มี card selected; `กรุณาเลือกประเภทรายการที่ต้องการทำ` | เลือกประเภท, ยกเลิก | เลือกแล้วเปิดปุ่มหลัก |
| Return selected | Card `คืนถัง` selected; info `การคืนถังต้องเลือกรายการยืมเดิม` | `เลือกรายการยืม`, ยกเลิก | `/loans?intent=return` |
| Customer step ready | `ลูกค้าใหม่` selected; old customer/document controls disabled | กรอกข้อมูล, กลับ, ถัดไป | Valid → step 3 |
| Product loading/searching | Table skeleton; current selected summaryคงอยู่ | Back; search disabledช่วง requestสั้น | Success/error |
| Product populated | Active products + current page/meta | Search, page, +/- quantity, next | Selection updates summary |
| Product empty master | `ยังไม่มีสินค้าที่ใช้งานได้` | `ไปเพิ่มสินค้า`, กลับ | `/products/new` |
| Product search empty | `ไม่พบสินค้าที่ตรงกับคำค้น` | ล้างคำค้น | Fetch default |
| No selected items | Summary `ยังไม่ได้เลือกสินค้า`; Next disabled | เพิ่มสินค้า | At least one item |
| Borrow item incomplete | Selected rowแสดง expected date/deposit; invalid deposit/date inline | แก้ไข/remove | Valid → step 4 |
| Confirmation ready | Full summary + `ราคาสุดท้ายและผลต่อสต็อกยืนยันโดยระบบ` | Back, cancel, confirm | Submit |
| Mutation pending | `กำลังสร้างรายการ...`; buttons/inputs disabled; `aria-busy=true` | ไม่มี submitซ้ำ | Success/failure |
| Mutation success | Toast `สร้างรายการสำเร็จ` | Auto navigate detail | `/transactions/{id}` |
| Validation error | Error summary `กรุณาตรวจสอบข้อมูลที่ระบุ` + inline errors | แก้ field/back | Focus first invalid field |
| Insufficient stock | Alert `จำนวนถังเต็มไม่เพียงพอ กรุณาตรวจสอบรายการสินค้า`; request IDถ้ามี | กลับ step 3, retryหลังข้อมูลเปลี่ยน | Refresh products ไม่อ้างว่า stock refreshed |
| Product conflict | `สินค้าบางรายการถูกปิดใช้งาน กรุณาเลือกใหม่` | กลับ step 3/รีเฟรช | Remove invalid item |
| API/network error | `ไม่สามารถสร้างรายการได้ กรุณาลองอีกครั้ง` + request ID | Retry, back, cancel | Draft remains in memory |
| Unauthorized | Clear session/redirect login | Login | ตาม auth policy |
| Forbidden | `คุณไม่มีสิทธิ์สร้างรายการ` | กลับแดชบอร์ด | Backend 403 authoritative |
| Leave with dirty draft | Dialog `ออกจากหน้านี้หรือไม่? ข้อมูลที่ยังไม่บันทึกจะหาย` | `อยู่ต่อ`, `ออกจากหน้า` | Cancel or navigate |
| Offline | `ไม่สามารถเชื่อมต่อบริการได้` | Retry | No success assumption |

## 10. Interaction contract

| Action | Visibility/enabled rule | Confirmation | Pending behavior | Success | Failure |
| --- | --- | --- | --- | --- | --- |
| Select type | Step 1; all 5 cards enabled | ไม่มี | None | Card selected; primary enabled | Not applicable |
| Next from normal type | Type selected and not return | ไม่มี | None | Step 2; focus heading | Stay + validation |
| Select loan flow | Return selected | ไม่มีเพิ่ม | Navigation feedback | `/loans?intent=return` | Route error state |
| Select existing customer | Visible but disabled | Tooltip/copy `ยังไม่เปิดใช้งาน` | None | No action | No action |
| Search customer | Visible but disabled | `ยังไม่มี Customer Master ใน MVP` | None | No action | No action |
| Next customer | Required fields valid for type | ไม่มี | None | Compose address; step 3 | Focus first invalid |
| Search product | Step 3 | ไม่มี | Search control busy; selected items preserved | Replace result page | Inline retry |
| Increase quantity | Active product; max not inferred from stock | ไม่มี | Local update | Merge same product; quantity +1 | Not applicable |
| Decrease quantity | Selected quantity >0 | ไม่มี | Local update | At 0 remove item after direct action or require trash; choose consistent implementation | Not applicable |
| Remove selected item | Selected item | ไม่มี destructive confirm | Local update | Remove and recompute preview | Not applicable |
| Edit borrow fields | Borrow selected item | ไม่มี | Local update | Summary updates | Inline guidance |
| Change product page | Pagination available | ไม่มี | Product list busy; selection preserved | New page results | Retry same page |
| Next items | At least one unique item and fields valid | ไม่มี | None | Step 4 | Focus error |
| Back | Steps 2–4 | ไม่มี | None | Previous step; preserve draft | Not applicable |
| Cancel | Any step | If dirty, confirm leave | None | `/transactions` | Stay |
| Confirm create | Step 4; valid; ADMIN; not pending | Button labelชัด `ยืนยันสร้างรายการ` | Disable all submit paths; spinner | Toast, revalidate, navigate detail | Draft retained; mapped error |

## 11. Field and validation rules

### Step 1

| Field | Input/control | Frontend guidance | Backend-authoritative rule | Error copy |
| --- | --- | --- | --- | --- |
| ประเภทรายการ | Radio-card group | Required; arrow keys/radio semantics | Supported create types; return via Loan flow | `กรุณาเลือกประเภทรายการ` |

### Step 2

| Field | Input/control | Frontend guidance | Backend-authoritative rule | Error copy |
| --- | --- | --- | --- | --- |
| ลูกค้าใหม่ | Radio selected | Only enabled mode | No `customerId` create input | — |
| ลูกค้าเดิม | Disabled radio | Copy `ยังไม่เปิดใช้งาน` | Customer API unavailable | — |
| ค้นหาลูกค้า | Disabled search | Placeholderตามภาพ | No API | — |
| ประเภทเอกสาร | Disabled select | `ยังไม่รองรับใน MVP` | No API field | — |
| เลขที่เอกสาร | Disabled text | `ยังไม่รองรับใน MVP` | No API field | — |
| ชื่อ-นามสกุล | Text | Required; trim; max 150 | Required every create type | `กรุณาระบุชื่อลูกค้าไม่เกิน 150 ตัวอักษร` |
| เบอร์โทรศัพท์ | `tel` | Optional; max 50; numeric-friendly keyboard | Optional string max 50 | `เบอร์โทรศัพท์ต้องไม่เกิน 50 ตัวอักษร` |
| ชื่อที่อยู่ | Text | Optional UI label | Not persisted | — |
| ที่อยู่ | Textarea | Required for delivery; optional otherwise | `customerAddress` required only delivery | `กรุณาระบุที่อยู่สำหรับจัดส่ง` |
| ตำบล/แขวง | Text | Optional | Part of address string | — |
| อำเภอ/เขต | Text | Optional | Part of address string | — |
| จังหวัด | Select | Optional; ใช้ verified 77-province constant | Part of address string | — |
| รหัสไปรษณีย์ | `inputmode=numeric` | Optional; if present exactly 5 digits | Backend validates only resulting string | `รหัสไปรษณีย์ต้องมี 5 หลัก` |
| หมายเหตุที่อยู่ | Text | Optional | Part of address snapshot | — |

### Step 3

| Field | Input/control | Frontend guidance | Backend-authoritative rule | Error copy |
| --- | --- | --- | --- | --- |
| ค้นหาสินค้า | Search | 1–100 chars; searches brand only | Product list contract | `คำค้นหาต้องไม่เกิน 100 ตัวอักษร` |
| Product | Row/add action | Active products only | Backend rejects missing/inactive | `สินค้านี้ไม่สามารถใช้สร้างรายการได้` |
| Quantity | Quantity input | Integer ≥1; duplicate product merges into existing item | Positive integer; no duplicate productId; stock check backend | `จำนวนต้องเป็นจำนวนเต็มตั้งแต่ 1` |
| Item note | Text | Optional; trim | Optional non-empty when present | `กรุณาไม่ส่งหมายเหตุว่าง` |
| Expected return date | Date; borrow only | Optional; no automatic overdue claim when absent | Valid calendar date; optional | `วันที่คาดว่าจะคืนไม่ถูกต้อง` |
| Deposit | Decimal; borrow only | Default `0.00`; ≥0; max 2 decimals | Decimal string | `เงินมัดจำต้องไม่ติดลบและมีทศนิยมไม่เกิน 2 ตำแหน่ง` |

### Step 4

| Field | Input/control | Frontend guidance | Backend-authoritative rule | Error copy |
| --- | --- | --- | --- | --- |
| หมายเหตุรายการ | Textarea | Optional; trim; plain text | Optional non-empty when present | `กรุณาไม่ส่งหมายเหตุว่าง` |
| Preview total | Read-only | No discount; label `ยอดรวมโดยประมาณ` | Backend computes actual total | — |
| Deposit total | Read-only; borrow only | Separate from transaction total | Not sales/transaction total | — |

Frontend validation เป็น assistive เท่านั้น ต้องไม่คำนวณหรืออนุมัติ stock, queue, loan, status, snapshot หรือ final total แทน backend

## 12. Responsive behavior

- Desktop ≥1280px:
  - Stepperเต็ม 4 ขั้นด้านบน
  - Step 1 ใช้ grid 3 cards แถวแรก + 2 cards แถวสอง
  - Step 2 ใช้ customer/address panels 2 columns
  - Step 3 product tableประมาณ 70% + sticky summary railประมาณ 30%
  - Footer actionsชิดล่างของ content ไม่ fixed ทับ viewport
- Tablet 768–1279px:
  - Stepperยังแนวนอนแต่ลดข้อความ
  - Step 2 panels stack
  - Step 3 tableเต็มความกว้าง; summaryอยู่ด้านล่าง
- Mobile <768px:
  - Stepperเปลี่ยนเป็น `ขั้น X จาก 4` และ progress bar
  - Type cards 1 column; touch targetทั้ง card
  - Customer/address fields 1 column
  - Product tableเปลี่ยนเป็น stacked product rows: รูป + brand/weight + applicable price + quantity
  - Selected summaryเป็น accordion/sectionด้านล่าง ไม่เป็น off-canvas ที่ซ่อน primary information
  - Footer action อยู่ท้าย document flow และมี safe spacing; ไม่ fixed/sticky ทับ field สุดท้าย
- Dense table strategy:
  - ไม่แสดง SKU/category/status/stock columns
  - ไม่ย่อ font ต่ำกว่าขนาดอ่านง่าย
  - Product pagination mobileใช้ previous/next + `หน้า X จาก Y`

## 13. Accessibility

- Heading and landmarks:
  - App shellมี `nav`
  - Route contentมี `main`
  - `PageHeader` เป็น `h1` เดียว
  - Current step titleเป็น `h2`
- Stepper:
  - ใช้ ordered list
  - Current stepมี `aria-current="step"`
  - Completed/current/upcoming มี text ไม่พึ่งสี
- Type cards:
  - ใช้ radio group พร้อม legend `ประเภทรายการ`
  - Card ทั้งใบ clickได้แต่มี accessible nameจากชื่อและคำอธิบาย
- Labels:
  - ทุก inputมี programmatic label
  - Disabled customer/document controlsเชื่อมคำอธิบายด้วย `aria-describedby`
- Product list:
  - Desktop tableมี caption
  - รูปมี alt `รูปสินค้า {brand} {weight} กก.`
  - Quantity buttonsมี label เช่น `เพิ่มจำนวน ปตท. 15 กก.`
- Keyboard/focus:
  - Tab orderตาม visual order
  - Enterใน searchไม่ submit create form
  - เปลี่ยน stepแล้ว focusไป heading
  - Validation focus first invalid field
  - Dialog trap focus/คืน focusตาม shared `Dialog`
- Errors:
  - Error summaryใช้ `role="alert"` เมื่อ submit
  - Inline errorผูก fieldด้วย `aria-describedby`
  - Pending/successใช้ `aria-live`
- Status semantics:
  - Selected, disabled, pending และ completedไม่สื่อด้วยสีอย่างเดียว
  - Buttons disabledทั้ง native attributeและ visual state
- Touch targets:
  - Controlsอย่างน้อย 44×44px บน mobile
- Motion:
  - Step transitionสั้นและเคารพ `prefers-reduced-motion`

## 14. Acceptance criteria

1. Given Admin มี sessionถูกต้อง เมื่อเปิด `/transactions/new` แล้วเห็น app shell, header `สร้างรายการใหม่`, step 1 และ type cardsครบ 5 แบบ.
2. Given ยังไม่เลือก type เมื่อกด/ตรวจปุ่มหลักแล้วปุ่ม `ถัดไป` disabled และไม่มีการเปลี่ยน step.
3. Given เลือก `RETURN_CYLINDER` เมื่อกดปุ่มหลักแล้ว navigate ไป `/loans?intent=return` โดยไม่เรียก `POST /transactions`.
4. Given อยู่ step 2 เมื่อดู customer mode แล้ว `ลูกค้าใหม่` selected ส่วน `ลูกค้าเดิม`, customer search, document type และ document number disabled พร้อมคำอธิบาย.
5. Given create typeใด ๆ เมื่อ customer nameว่างแล้วกดถัดไป จะคงอยู่ step 2, แสดง `กรุณาระบุชื่อลูกค้า...` และ focus field.
6. Given `DELIVERY_EXCHANGE` เมื่อ addressว่างแล้วกดถัดไป จะไม่เข้า step 3 และแสดง `กรุณาระบุที่อยู่สำหรับจัดส่ง`.
7. Given non-delivery type เมื่อ addressว่างแต่ customer nameถูกต้อง แล้วสามารถเข้า step 3 ได้.
8. Givenผู้ใช้กรอก structured address เมื่อเข้า confirmation แล้วเห็น formatted address และ payloadส่งเป็น `customerAddress` stringเดียวโดยไม่มี fieldที่ backendไม่รู้จัก.
9. Given product listโหลดสำเร็จ เมื่อ renderแล้วแสดงเฉพาะรูป ยี่ห้อ น้ำหนัก applicable price และ quantity controls โดยไม่มี stock/SKU/category.
10. Given productไม่มีรูป เมื่อ renderแล้วใช้ placeholder และหน้าไม่ fail.
11. Given search term เมื่อกด Enterหรือ debounceแล้ว requestค้นเฉพาะ brand, selected itemsเดิมยังอยู่แม้ผล searchเปลี่ยน.
12. Given productเดียวกันถูกเพิ่มซ้ำ เมื่อเลือกอีกครั้งแล้ว quantityของ itemเดิมเพิ่มขึ้นและ payloadไม่มี duplicate `productId`.
13. Givenยังไม่เลือก product เมื่ออยู่ step 3 แล้วปุ่ม `ถัดไป` disabled พร้อม summary `ยังไม่ได้เลือกสินค้า`.
14. Given typeเป็น Delivery/Walk-in เมื่อเลือกสินค้าแล้ว preview priceใช้ `exchangeSalePrice`; Buy uses `fullTankPrice`; Borrowแสดงราคาสินค้า `0.00`.
15. Given typeเป็น Borrow เมื่อเลือกสินค้าหลายรายการแล้วแต่ละ itemมี expected return date, deposit และ noteของตนเอง.
16. Given borrow depositถูกกรอก เมื่อ summaryแสดงแล้ว depositรวมแยกจาก `ยอดรวมโดยประมาณ` และไม่ถูกบวกเป็นยอดขาย.
17. Givenอยู่ step 4 เมื่อดู summaryแล้วไม่มีช่อง/แถวส่วนลดและ payloadไม่มี discount field.
18. Givenกด Backจาก step 4 เมื่อกลับ step 3 แล้ว customer/items/borrow termsยังอยู่ใน memory.
19. Givenกด Cancelหลังเริ่มกรอก เมื่อ dialogเปิดแล้วเลือก `อยู่ต่อ` จะรักษา draftและ focusกลับปุ่ม Cancel; เลือก `ออกจากหน้า` จึง navigate.
20. Givenกด `ยืนยันสร้างรายการ` เมื่อ pendingแล้วทุก submit path disabledและมี requestเพียงหนึ่งครั้ง.
21. Given create success เมื่อ backendคืน detailแล้ว frontendใช้ `id`, `transactionNo`, status, queue และ totalจาก response, แสดง success feedbackและ navigate `/transactions/{id}`.
22. Given Delivery create success เมื่อ backendคืน `PENDING` และ queue no แล้ว detailเป็นผู้แสดงค่าจริง; wizardไม่ generateเลขเอง.
23. Given backendคืน `INSUFFICIENT_STOCK` เมื่อ createแล้ว draftยังอยู่, ไม่มี success navigationและผู้ใช้กลับไปปรับ step 3 ได้.
24. Given backendคืน inactive product conflict เมื่อ createแล้ว UIแจ้งให้เลือกสินค้าใหม่และไม่อ้างว่ารายการถูกบันทึก.
25. Given network failure เมื่อ retryแล้วใช้ draftเดิมและไม่ส่ง duplicate requestพร้อมกัน.
26. Given unauthorized/forbidden response เมื่อเกิดขึ้นแล้ว access tokenไม่ปรากฏใน browser storage/JavaScript และ auth boundaryจัดการตาม statusจริง.
27. Given viewport mobile เมื่อใช้งานครบ 4 steps แล้วไม่ต้องเลื่อนแนวนอนผ่าน desktop tableและ footerไม่บัง fieldสุดท้าย.
28. Given keyboard-only user เมื่อทำ wizardแล้วสามารถเลือก type, กรอก field, ปรับ quantity, เปลี่ยน step, เปิด/ปิด dialogและ submitได้พร้อม focusที่คาดเดาได้.
29. Given screen reader user เมื่ออยู่ stepใดแล้ว current/completed states, errors, disabled future fieldsและpending mutationถูกประกาศโดยไม่พึ่งสี.
30. Given pageถูก refreshระหว่างกรอก เมื่อกลับมาแล้ว draftไม่ถูกอ่านจาก local/session storageและไม่มี PIIตกค้างใน client-readable persistence.

## 15. Risks and follow-up

- Implementation mismatches:
  - `transaction-form.tsx`, `transaction.api.ts`, types, schema และ constants ปัจจุบันเป็น placeholder
  - Pageยัง render raw `<h1>` และไม่ได้ใช้ `PageHeader`
  - Shared UIยังไม่มี `Stepper`, `Textarea`, `Pagination`, `QuantityInput`, `EmptyState`
  - Transaction-specific iconsยังไม่ครบ; ต้องเพิ่มใต้ `src/components/icon`
- Breaking-change concerns:
  - ห้าม implement payloadตาม `Frontend-Implement-Plan.md` รุ่นเก่าที่ส่ง `itemAction`, `unitPrice` หรือ `costPrice`
  - API base pathจริงคือ `/api`; การบังคับ `/api/v1` จะทำให้ integrationแตก
  - หาก Customer Masterเพิ่มภายหลัง ต้องทบทวน source of truthระหว่าง `customerId` กับ snapshot fieldsก่อนเปิด `ลูกค้าเดิม`
- Dependencies:
  - Product list API และ product images
  - Server-side session/API client
  - Transaction create API
  - Loan list/return API สำหรับ return handoff
- Follow-up specifications:
  - Loan Return selection and confirmation screen
  - Transaction detail/status action screen
  - Transaction history screen
- Backend documentation:
  - อัปเดต transaction spec statusให้ตรง implementationจริง
  - ระบุ loan return endpointและ response contractก่อน implement `RETURN_CYLINDER`
- Product/design follow-up:
  - หากต้องการ stock availabilityก่อน submit ต้องออกแบบ approved inventory read contract; ห้าม frontendเดาจาก cached product data
  - หากต้องการ document fields ต้องเพิ่ม data model/API/privacy rulesก่อนเปิดใช้งาน
- Implementation verification:
  - รัน lintเสมอ
  - รัน buildเมื่อเพิ่ม Server Action/Route Handler, route boundaryหรือ shared imports
  - Browser QA desktop/tablet/mobile รวม dirty-leave, auth expiry, product conflict, insufficient stock และ duplicate submit
