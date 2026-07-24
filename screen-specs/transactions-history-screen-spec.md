# Screen Specification: ประวัติรายการ (Transaction History)

## 1. Document status

- Status: Ready for review
- Owner: KMG-SERVICE-WEB / `transactions`
- Last updated: 2026-07-23
- Related design:
  - `/Users/gas.bit/Downloads/Generated image 1 (3).png`
- Related API:
  - `../KMG-SERVICE-API/src/modules/transactions/transaction-spec.md`
  - `../KMG-SERVICE-API/src/modules/transactions/transaction.routes.ts`
  - `../KMG-SERVICE-API/src/modules/transactions/transaction.schema.ts`
  - `../KMG-SERVICE-API/src/modules/transactions/transaction.service.ts`
  - `../KMG-SERVICE-API/src/modules/transactions/transaction.types.ts`
  - `../KMG-SERVICE-API/src/modules/transactions/transaction.mapper.ts`
- Related frontend specification:
  - `./transactions-new-screen-spec.md`
- Design authority rule:
  - ใช้ภาพเป็น visual direction แต่ใช้ API contract และ implementation จริงเป็น authority ของ field, filter และ aggregation ที่เปิดใช้งาน

## 2. Summary

- Purpose: ให้ Admin ค้นหา กรอง และตรวจสอบประวัติ transaction ทั้งหมดของร้านจากข้อมูล snapshot ที่ไม่เปลี่ยนตาม master data ในอนาคต
- User outcome: Admin ระบุช่วงวันที่หรือเงื่อนไขที่ต้องการ เห็นผลลัพธ์แบบแบ่งหน้า และเปิดรายละเอียดของแต่ละ transaction เพื่อดูสินค้า ยอดรวม และ status log ได้
- Route: `/transactions`
- Owning route: `src/app/(app)/transactions/page.tsx`
- Detail route: `/transactions/[id]`
- Create route: `/transactions/new`
- Owning feature: `src/features/transactions`
- Allowed roles: `ADMIN` เท่านั้นใน MVP ทั้งการแสดง UI และ backend enforcement
- Visual thesis: รักษา app shell สีกรมท่า พื้นที่ทำงานสีขาว–เทา filter panel และ dense operational table ตามภาพ โดยลดองค์ประกอบที่ API ยังไม่รองรับ
- Interaction thesis: ให้ URL query เป็น source of truth ของ search, filter และ pagination; Server Component โหลดข้อมูลด้วย session ฝั่ง server และ Client Component มีเฉพาะ control ที่ต้องเปลี่ยน URL
- Data thesis: แสดง customer, transaction number, amount และผู้สร้างจาก transaction summary snapshot; ห้าม lookup master ปัจจุบันมาเขียนทับประวัติ

## 3. Scope

### In scope

- Transaction history ของทั้ง 5 ประเภท:
  - `DELIVERY_EXCHANGE`
  - `WALK_IN_EXCHANGE`
  - `BORROW_CYLINDER`
  - `RETURN_CYLINDER`
  - `BUY_FULL_TANK`
- ค้นหาจาก:
  - เลขรายการ
  - ชื่อลูกค้า snapshot
  - เบอร์โทร snapshot
- กรองจาก:
  - ช่วงวันที่สร้างรายการ
  - ประเภทรายการ
  - สถานะ
- URL-driven pagination และ page size
- แสดงผลเรียง `createdAt DESC, id DESC`
- แสดงจำนวนผลลัพธ์ทั้งหมดจาก `meta.pagination.totalItems`
- เปิด transaction detail จากแต่ละแถว
- Loading, empty, no-result, invalid-query, API error, unauthorized และ forbidden states
- Desktop table และ mobile stacked list โดยไม่เกิด horizontal overflow ทั้งหน้า
- ใช้วันธุรกิจและ date filter ตามเขตเวลา `Asia/Bangkok`

### Out of scope

- การแสดงหรือกรอง Driver, Rider, ผู้จัดส่ง หรือ assignee
- การแยก “ประเภทการทำรายการ” และ “ประเภทการสั่ง” เป็นคนละ filter
- Summary จำนวนรายการแยกทุกสถานะสำหรับผลลัพธ์ทั้งหมด
- ยอดขายรวมของผลลัพธ์ทั้งหมด
- Export CSV/Excel/PDF
- Print, receipt และ invoice
- Sort control จากผู้ใช้; MVP ใช้ลำดับล่าสุดก่อนตาม API
- การเปลี่ยนสถานะ ยกเลิก หรือ complete จาก history row โดยตรง
- Bulk selection และ bulk action
- Search จากที่อยู่ หมายเหตุ สินค้า หรือผู้สร้าง
- Inventory movement, loan detail หรือ queue detail ภายในหน้า history
- Customer master lookup; snapshot ใน transaction เป็น source of truth

## 4. Sources and decisions

### Confirmed sources

- `Context.md`: Transaction History ต้องแสดงรายการทั้งหมดแบบ data table และค้นหา/กรองได้จากวันที่ ประเภท สถานะ ลูกค้า เบอร์โทร และเลขรายการ
- `Business-Flow.md`: ทุก workflow สร้าง transaction history และ backend เป็นผู้ดูแล status, queue, inventory และ loan effects
- `Database-Design.md`: transaction เก็บ customer snapshot, item เก็บ product/price/cost snapshot และทุก status change มี status log
- `Frontend-Architecture.md`: `/transactions` เป็น Server page with query params; history ใช้ Server Component เป็นหลัก
- `Frontend-Implement-Plan.md`: history ต้องมี date/type/status filter, customer phone/name search และ transaction number search
- Transaction API:
  - `GET /api/transactions`
  - filters combine ด้วย `AND`
  - `search` ใช้ `OR` แบบ case-insensitive partial match กับ `transactionNo`, `customerName` และ `customerPhone`
  - `dateFrom` และ `dateTo` เป็น inclusive business dates ใน `Asia/Bangkok`
  - response มี `transactions[]` และ `meta.pagination`
  - response summary มี `itemCount`, `totalQuantity` และ `createdBy` แต่ไม่มี assignee/driver
- Backend implementation ปัจจุบันมี routes, schema, controller, service, repository, mapper และ tests แล้ว แม้ header/implementation note ใน `transaction-spec.md` ยังระบุว่า proposed/unimplemented
- Next.js guide ของ version ใน repository:
  - `page.tsx` เป็น Server Component โดยค่าเริ่มต้น
  - `searchParams` เป็น `Promise` และต้อง `await`
  - การใช้ `searchParams` ทำให้ route render ตาม request
  - Client Component ควรจำกัดอยู่เฉพาะส่วนที่ต้องใช้ event handlers หรือ browser navigation state

### Design-to-contract resolutions

| Element ในภาพ | Contract จริง | Resolution สำหรับ MVP |
| --- | --- | --- |
| หัวข้อ `History` | Navigation ปัจจุบันใช้ภาษาไทย | ใช้ `ประวัติรายการ` และ description `ประวัติการทำรายการทั้งหมด` |
| ค้นหาเลขใบสั่งซื้อ/ลูกค้า/เบอร์ | API ค้น `transactionNo`, customer name/phone | ใช้ placeholder `ค้นหาเลขรายการ ชื่อลูกค้า หรือเบอร์โทร` |
| ช่วงวันที่ | API มี `dateFrom`, `dateTo` | ใช้ date range control ที่ส่ง ISO calendar date |
| ประเภทการทำรายการ + ประเภทการสั่ง | API มี `transactionType` เพียง dimension เดียว | รวมเป็น select เดียว `ประเภทรายการ` ครบ 5 ค่า |
| Summary แยกสำเร็จ/รอดำเนินการ/ยกเลิก | List API ไม่มี aggregate by status | ไม่แสดงจนกว่าจะมี aggregate contract |
| ยอดขายรวม | List API ไม่มี filtered sales aggregate | ไม่แสดงและห้ามรวมเฉพาะ page แล้วเรียกว่า “ยอดขายรวม” |
| จำนวนสินค้าหนึ่งค่า | API มี `itemCount` และ `totalQuantity` | แสดง `totalQuantity` เป็นจำนวนรวม และใช้ `itemCount` เป็นข้อความรองเมื่อมากกว่า 1 product line |
| จัดส่งโดย Driver | API มีเพียง `createdBy` | เปลี่ยน column เป็น `สร้างโดย` และแสดง `createdBy.name` |
| ปุ่มรูปตา | มี detail route `/transactions/[id]` | ใช้ Link พร้อม label ที่ screen reader อ่านได้ |
| 10 รายการต่อหน้า | API default 20 แต่รับ 1–100 | UI default 10 ตามภาพ และมีตัวเลือก 10, 20, 50 |

### Default and URL decisions

- เมื่อไม่มี query:
  - `dateFrom` = วันแรกของเดือนปัจจุบันใน `Asia/Bangkok`
  - `dateTo` = วันนี้ใน `Asia/Bangkok`
  - `page = 1`
  - `limit = 10`
  - `transactionType`, `status`, `search` ไม่ถูกกำหนด
- ค่า default date range มาจาก visual design และลักษณะ operational history; ต้องแสดงช่วงที่ใช้อยู่ชัดเจนเพื่อไม่ทำให้ผู้ใช้เข้าใจว่าเป็นข้อมูลทุกเวลา
- การเปลี่ยน search/filter/page size ต้อง reset `page` เป็น `1`
- URL ใช้ key เดียวกับ API:
  - `search`
  - `dateFrom`
  - `dateTo`
  - `transactionType`
  - `status`
  - `page`
  - `limit`
- ค่า default อาจไม่จำเป็นต้องเขียนลง URL แต่ server ต้อง normalize เป็นค่าเดียวกันเสมอ
- Link ที่มี query ต้องเปิดซ้ำแล้วได้ผลลัพธ์และหน้าปัจจุบันเดิม
- ปุ่ม `ล้างตัวกรอง` คืน search/type/status/page/limit เป็นค่าเริ่มต้น และคืนช่วงวันที่เป็นเดือนปัจจุบันถึงวันนี้

### Open decisions and API gaps

- Blocker สำหรับ status summary และยอดขายรวม: `GET /api/transactions` ไม่มี aggregate ของ filtered result
- Blocker สำหรับ Driver/assignee: transaction summary ไม่มี assignee หรือ delivery staff relation
- Major design mismatch: ภาพแยก business action เช่น Exchange/Borrow ออกจาก fulfillment เช่น Delivery/Walk-in แต่ domain/API ใช้ composite `transactionType`
- Minor documentation mismatch: `transaction-spec.md` ระบุว่ายังไม่มี implementation แต่ source ปัจจุบัน implement list/detail/create/status/cancel แล้ว
- Product decision: หากต้องรักษา KPI strip ตามภาพ ต้องออกแบบ aggregate endpoint ที่ใช้ filter ชุดเดียวกับ list และกำหนดชัดว่ายอดขายนับเฉพาะ transaction type/status ใด
- Product decision: หากต้องมี Driver ต้องเพิ่ม assignment ownership, API field และ permission model ก่อนแสดง column/filter

## 5. Navigation and workflow

### Entry points

- Sidebar `รายการ > ประวัติรายการ`
- เมนู `รายงาน` ปัจจุบันที่ยังชี้ `/transactions`
- Dashboard link จากรายการล่าสุดหรือ summary ที่เกี่ยวข้อง
- หลังยกเลิกการสร้างรายการ → `/transactions`
- URL `/transactions` พร้อม query ที่ผู้ใช้ bookmark หรือแชร์

### Exit paths

- `สร้างรายการใหม่` → `/transactions/new`
- เปิดรายการ → `/transactions/{id}`
- Unauthorized → `/login` ตาม auth policy
- Forbidden → `/dashboard` ผ่าน action ที่ชัดเจน

### Primary workflow

1. Server page ตรวจ session และ role
2. Server page `await searchParams` และ normalize เฉพาะ query ที่ contract รองรับ
3. ถ้าไม่มีช่วงวันที่ ให้ derive วันแรกของเดือนถึงวันนี้ใน `Asia/Bangkok`
4. Server page เรียก feature API wrapper ไป `GET /api/transactions`
5. API รวม filters ด้วย `AND`, ค้น search fields ด้วย `OR` และคืนรายการล่าสุดก่อน
6. หน้าแสดง header, filter panel, result count, table/list และ pagination
7. Admin เปลี่ยน filter แล้ว Client control อัปเดต URL พร้อม reset `page=1`
8. Server page render ผลลัพธ์ใหม่จาก URL
9. Admin เปิดรายการที่ต้องการตรวจสอบ
10. Detail route โหลด snapshot items และ status logs จาก `GET /api/transactions/{id}`

### Search workflow

1. Admin กรอกคำค้น 1–150 ตัวอักษร
2. Submit เมื่อกด Enter หรือปุ่มค้นหา
3. Trim ช่องว่างหัวท้ายก่อนเขียน URL
4. คำค้นว่างให้ลบ `search` ออกจาก URL
5. ระหว่าง navigation แสดง pending feedback โดยยังคงค่าควบคุมที่ผู้ใช้เลือก
6. Search ไม่พบให้แสดง no-result state โดยไม่ล้าง filter อัตโนมัติ

### Date-filter workflow

1. Admin เลือกวันเริ่มและวันสิ้นสุด
2. ทั้งสองค่าใช้รูปแบบ URL/API `YYYY-MM-DD`
3. หน้าแสดงวันที่เป็นรูปแบบไทย แต่ห้ามส่งปี พ.ศ. ไป API
4. `dateFrom` ต้องไม่เกิน `dateTo`
5. Filter ครอบคลุมทั้งวันตาม `Asia/Bangkok`
6. เมื่อเลือกไม่ครบคู่ ให้ยังไม่ apply จนกว่าจะครบ หรือให้ปุ่ม apply disabled พร้อมข้อความกำกับ

### Pagination workflow

1. ใช้ `meta.pagination.page`, `limit`, `totalItems`, `totalPages` จาก response
2. ปุ่มก่อนหน้า disabled ที่หน้าแรก
3. ปุ่มถัดไป disabled ที่หน้าสุดท้ายหรือเมื่อ `totalPages = 0`
4. แสดง first/last และหน้ารอบ current page พร้อม ellipsis เมื่อมีหลายหน้า
5. เปลี่ยน page size แล้ว reset ไปหน้า 1
6. หาก URL ระบุ page เกิน `totalPages` และมีผลลัพธ์ ให้ redirect/replace ไปหน้าสุดท้ายที่มีจริง

## 6. Screen composition

| Region | Content | Shared component | Responsive behavior |
| --- | --- | --- | --- |
| App shell | Sidebar/mobile nav/user/date/notification | `AppSidebar`, `MobileNav`, `NavigationMenu`, `PageHeader` | ใช้ shell เดิมและไม่ render ซ้ำใน page |
| Page header | `ประวัติรายการ` / `ประวัติการทำรายการทั้งหมด` | `PageHeader` | Description ซ่อนตาม behavior เดิมบนจอแคบ |
| Primary action | `สร้างรายการใหม่` | `Button` rendered with `Link` composition ที่เหมาะสม | อยู่ข้าง header content บน desktop และเต็มความกว้างเหนือ filters บน mobile |
| Filter panel | Search, date range, transaction type, status, reset | `Card`, `Input`, `Select`, `Button`, shared icons | Grid desktop; 2 columns tablet; stack mobile |
| Result summary | `รายการทั้งหมด {totalItems} รายการ` | `Card` หรือ compact result bar | ไม่แสดง status/sales KPI ที่ API ไม่รองรับ |
| Desktop history | Summary fields ต่อ transaction | `Card`, `Table` primitives | แสดงตั้งแต่ desktop breakpoint; container overflow เฉพาะตารางถ้าจำเป็น |
| Mobile history | Stacked transaction rows/cards | `Card`, `TextLabel`, `Button`/Link | แสดงแทน table; ไม่มี horizontal scroll |
| Pagination | Result range, page links, page size | Proposed shared `Pagination` | Desktop อยู่แถวเดียว; mobile แยก range, prev/next และ limit |
| Feedback | Loading skeleton, alert, empty/no-result | Shared loading primitives และ proposed `EmptyState` | รักษาความสูงโครงหน้าจอเพื่อลด layout shift |

### Filter controls

| Label | Control | Values/behavior |
| --- | --- | --- |
| ค้นหา | Search input | เลขรายการ ชื่อลูกค้า หรือเบอร์โทร; submit ไม่ยิง request ทุก key stroke |
| ช่วงวันที่ | Date range | `dateFrom`–`dateTo`; display Thai, submit Gregorian ISO |
| ประเภทรายการ | Select | ทั้งหมด + transaction types 5 ค่า |
| สถานะ | Select | ทั้งหมด, รอดำเนินการ, กำลังดำเนินการ, เสร็จสิ้น, ยกเลิก |
| ล้างตัวกรอง | Secondary button | กลับ default current-month query และ page 1 |

### Transaction type copy

| API value | Thai label |
| --- | --- |
| `DELIVERY_EXCHANGE` | ส่งแก๊สแลกถัง |
| `WALK_IN_EXCHANGE` | แลกหน้าร้าน |
| `BORROW_CYLINDER` | ยืมถัง |
| `RETURN_CYLINDER` | คืนถัง |
| `BUY_FULL_TANK` | ซื้อถังเต็ม |

### Transaction status copy

| API value | Thai label | Visual treatment |
| --- | --- | --- |
| `PENDING` | รอดำเนินการ | Amber badge + icon/text |
| `IN_PROGRESS` | กำลังดำเนินการ | Blue badge + icon/text |
| `COMPLETED` | เสร็จสิ้น | Green badge + icon/text |
| `CANCELLED` | ยกเลิก | Red or muted-red badge + icon/text |

สีเป็นข้อมูลเสริมเท่านั้น ทุกสถานะต้องมีข้อความ

### Desktop table columns

| Column | Source | Display rule |
| --- | --- | --- |
| เลขรายการ | `transactionNo` | Link text; ไม่ใช้ mock prefix `O-` จากภาพ |
| วันที่ / เวลา | `createdAt` | แปลงเป็น `dd/MM/yyyy HH:mm` ตาม `Asia/Bangkok`; display ใช้ปีไทยตาม locale ที่อนุมัติ |
| ลูกค้า | `customerName`, `customerPhone` | ชื่อบรรทัดแรก; phone หรือ `—` บรรทัดรอง |
| ประเภทรายการ | `transactionType` | Thai label + optional compact code badge |
| จำนวน | `totalQuantity`, `itemCount` | `{totalQuantity} ถัง`; ถ้ามีหลาย product line แสดง `{itemCount} สินค้า` เป็นข้อความรอง |
| ยอดรวม (บาท) | `totalAmount` | THB 2 decimals; borrow/return อาจเป็น `0.00`; deposit ไม่รวม |
| สถานะ | `status` | Status badge ที่มี text |
| สร้างโดย | `createdBy.name` | ชื่อผู้สร้าง; ไม่เรียกว่า Driver |
| จัดการ | `id` | Link ไป `/transactions/{id}` พร้อม tooltip/accessible name |

### Mobile transaction card

- Header: `transactionNo` และ status badge
- Created date/time
- Customer name และ phone
- Transaction type
- Quantity และ total amount
- Created by
- Action `ดูรายละเอียด`
- Customer address และ note ไม่แสดงใน list card; อยู่ใน detail screen

## 7. Data contract

### URL query and API request

| UI datum | URL/API key | Type | Rule |
| --- | --- | --- | --- |
| Search | `search` | string optional | trim, 1–150; empty = omit |
| Start date | `dateFrom` | date optional | `YYYY-MM-DD`, inclusive Bangkok date |
| End date | `dateTo` | date optional | `YYYY-MM-DD`, inclusive Bangkok date; not before start |
| Type | `transactionType` | enum optional | exact one of 5 values |
| Status | `status` | enum optional | exact one of 4 values |
| Page | `page` | integer | minimum 1; default 1 |
| Page size | `limit` | integer | UI values 10/20/50; API maximum 100 |

Example:

```text
/transactions?dateFrom=2026-07-01&dateTo=2026-07-23&transactionType=DELIVERY_EXCHANGE&status=COMPLETED&search=สมชาย&page=1&limit=10
```

API request:

```text
GET /api/transactions?dateFrom=2026-07-01&dateTo=2026-07-23&transactionType=DELIVERY_EXCHANGE&status=COMPLETED&search=สมชาย&page=1&limit=10
```

### Transaction summary response

| UI datum | API field | Requirement | Format/fallback |
| --- | --- | --- | --- |
| Row identity | `id` | Required | BigInt serialized as decimal string |
| เลขรายการ | `transactionNo` | Required | `TX-YYYYMMDD-NNNN` |
| ประเภท | `transactionType` | Required | Map ด้วย shared constants |
| สถานะ | `status` | Required | Map ด้วย shared constants |
| Queue date/no | `queueDate`, `queueNo` | Nullable | ไม่แสดงใน history MVP; detail/queue เป็นเจ้าของ |
| ชื่อลูกค้า | `customerName` | Required | Snapshot text |
| เบอร์โทร | `customerPhone` | Nullable | formatted phone หรือ `—` |
| ที่อยู่ | `customerAddress` | Nullable | ไม่แสดงใน table; ใช้ใน detail |
| ยอดรวม | `totalAmount` | Required | Decimal string → THB 2 decimals |
| หมายเหตุ | `note` | Nullable | ไม่แสดงใน table; ใช้ใน detail |
| จำนวนชนิดสินค้า | `itemCount` | Required | positive integer |
| จำนวนรวม | `totalQuantity` | Required | positive integer |
| ผู้สร้าง | `createdBy.id`, `createdBy.name` | Required | แสดง name |
| วันที่สร้าง | `createdAt` | Required | ISO date-time → Bangkok display |
| วันที่แก้ไข | `updatedAt` | Required | ไม่แสดงใน list MVP |
| วันที่เสร็จ | `completedAt` | Nullable | ไม่แสดงใน list MVP |

### Pagination response

| UI datum | API field | Rule |
| --- | --- | --- |
| Current page | `meta.pagination.page` | authoritative |
| Page size | `meta.pagination.limit` | authoritative |
| Result total | `meta.pagination.totalItems` | จำนวนทั้งหมดหลังใช้ filters |
| Total pages | `meta.pagination.totalPages` | อาจเป็น 0 เมื่อไม่มีผลลัพธ์ |
| Request reference | `meta.requestId` | แสดงเฉพาะ error/support context |

### Result range

- ถ้า `totalItems = 0`: `ไม่พบรายการ`
- ถ้ามีผลลัพธ์:
  - `start = (page - 1) * limit + 1`
  - `end = min(page * limit, totalItems)`
  - แสดง `รายการ {start}–{end} จาก {totalItems} รายการ`
- ใช้ pagination meta จาก response ไม่ใช้จำนวน array เพื่อเดาจำนวนทั้งหมด

### Money rules

- `totalAmount` เป็น string decimal จาก backend และเป็น authority
- แสดงอย่างน้อย 2 ตำแหน่ง เช่น `1,450.00 บาท`
- ห้ามใช้ floating-point calculation เพื่อสร้างยอดใหม่ใน history
- `BORROW_CYLINDER` และ `RETURN_CYLINDER` อาจมียอด `0.00`
- Deposit ของ loan ไม่รวมใน transaction total
- ห้ามเรียกผลรวมยอดของ current page ว่า “ยอดขายรวม”

### Snapshot rules

- ใช้ `customerName`, `customerPhone` และ `customerAddress` จาก transaction response
- Detail ใช้ item snapshot จาก transaction detail response
- ห้ามโหลด customer/product master ปัจจุบันมาแทนค่า snapshot
- สินค้าที่ถูกปิดใช้งานหรือ master ถูกแก้ไขต้องไม่ทำให้ history หายหรือเปลี่ยนข้อความย้อนหลัง

## 8. Rendering and component boundaries

### Route composition

`src/app/(app)/transactions/page.tsx`

- Server Component
- รับ `searchParams: Promise<...>`
- ตรวจและ normalize query
- ตรวจ auth/role ผ่าน server helper
- เรียก `getTransactions(query)`
- compose `PageHeader`, filters, summary, table/list และ pagination
- ไม่เก็บ filter state ซ้ำใน page-level client state

### Proposed feature components

| Component | Boundary | Responsibility |
| --- | --- | --- |
| `TransactionHistoryFilters` | Client | Draft controls, submit/reset และ URL navigation |
| `TransactionHistorySummary` | Server/presentational | แสดง `totalItems` เท่านั้นใน MVP |
| `TransactionTable` | Server/presentational | Desktop rows จาก transaction summaries |
| `TransactionHistoryCards` | Server/presentational | Mobile card list |
| `TransactionStatusBadge` | Shared within feature | Map status เป็น label/icon/style |
| `TransactionTypeLabel` | Shared within feature | Map transaction type เป็นข้อความ |
| `TransactionHistoryPagination` | Server links หรือ small Client | เปลี่ยน page/limit โดยรักษา filters |
| `TransactionHistoryEmptyState` | Server/presentational | แยก empty master กับ no filtered result |
| `TransactionLoadError` | Server/presentational | แสดง mapped error และ retry/navigation |

### Proposed types

เพิ่มใกล้ owning feature ใน `src/features/transactions/transaction.types.ts`:

- `TransactionSummary`
- `TransactionListQuery`
- `TransactionPagination`
- `TransactionListResult`

IDs ต้องเป็น `string` และ money ต้องคงเป็น decimal `string`

### API wrapper

เพิ่มใน `src/features/transactions/transaction.api.ts`:

```text
getTransactions(query) -> { transactions, pagination, requestId? }
```

- ใช้ `apiClientWithMeta`
- ส่งเฉพาะ query ที่ผ่าน normalization
- ใช้ server-side auth cookie ผ่าน shared API client
- history เป็น operational data ที่เปลี่ยนได้หลัง create/status update; ใช้ fresh request behavior และไม่ใช้ stale client cache เป็น authority

### Shared components

- ใช้ `PageHeader`, `Card`, `CardContent`, `Input`, `Select`, `Button`, `Table` primitives ที่มีอยู่
- เพิ่ม shared `Pagination` และ `EmptyState` ใต้ `src/components/ui` หาก pattern นี้จะใช้ใน Products, Loans หรือ Inventory ด้วย
- เพิ่ม icon ที่ขาดใต้ `src/components/icon`; ห้ามฝัง inline SVG ใน feature/page
- ขยาย shared primitives เมื่อจำเป็นก่อนสร้าง one-off raw controls

## 9. UI states

| State | UI | Available actions | Notes |
| --- | --- | --- | --- |
| Initial loading | Header shell + filter/table skeleton | Navigation shell | Skeleton สะท้อนความกว้างจริงและไม่แสดง mock data |
| Ready with results | Filters + total + rows + pagination | Search/filter/reset/open detail/create | Default state |
| Empty history | `ยังไม่มีประวัติรายการ` | `สร้างรายการใหม่` | เมื่อไม่มี filter พิเศษและ `totalItems=0` |
| No filtered result | `ไม่พบรายการที่ตรงกับเงื่อนไข` | ล้างตัวกรอง/แก้เงื่อนไข | คงค่าตัวกรองเดิม |
| Filter pending | Controls คงค่า; result region แสดง pending feedback | ห้าม submit ซ้ำ | ใช้ `aria-busy` บน result region |
| Invalid local date range | Inline error `วันเริ่มต้นต้องไม่เกินวันสิ้นสุด` | แก้วันที่/ล้าง | ไม่ส่ง request |
| Invalid URL query | Normalize safe fields; alert `ตัวกรองบางรายการไม่ถูกต้อง` | กลับค่าเริ่มต้น | ห้ามส่งค่าที่ schema ไม่รองรับไป API |
| API validation error | Alert `ตัวกรองไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง` | ล้าง/แก้ filter | แสดง request ID ถ้ามี |
| Network/internal error | `ไม่สามารถโหลดประวัติรายการได้` | ลองอีกครั้ง | ไม่ render stale totals เป็นข้อมูลล่าสุด |
| Unauthorized | Session policy redirect login | Login | Token ไม่อยู่ใน browser JS |
| Forbidden | `คุณไม่มีสิทธิ์ดูประวัติรายการ` | กลับแดชบอร์ด | Backend 403 authoritative |
| Page out of range | Normalize ไปหน้าสุดท้ายที่มีข้อมูล | — | ป้องกัน empty state หลอกเมื่อ filter มีผลลัพธ์ |

## 10. Interaction contract

| Action | Preconditions | URL/request effect | Success | Failure |
| --- | --- | --- | --- | --- |
| Submit search | 1–150 chars after trim หรือว่างเพื่อล้าง | set/remove `search`, set `page=1` | Render filtered results | คง input และแสดง error |
| Apply dates | ทั้งคู่ valid และ start ≤ end | set `dateFrom`, `dateTo`, `page=1` | Render inclusive Bangkok dates | ไม่ navigate |
| Change type | Valid enum/all | set/remove `transactionType`, set `page=1` | Render filtered results | Normalize invalid value |
| Change status | Valid enum/all | set/remove `status`, set `page=1` | Render filtered results | Normalize invalid value |
| Reset | Any state | default current-month query | Default results | แสดง load error ถ้า API fail |
| Change page | Target within range | set `page` only | Preserve filters/limit | Disable impossible target |
| Change limit | 10/20/50 | set `limit`, `page=1` | Preserve filters | Fallback 10 |
| Open detail | Valid row id | navigate `/transactions/{id}` | Detail page | Detail owns not-found/error |
| Create | ADMIN | navigate `/transactions/new` | Wizard | Create page owns errors |

### URL update policy

- Search submit, filters และ page size ใช้ navigation ที่สร้าง browser history อย่างเหมาะสม:
  - filter ที่ผู้ใช้ตั้งใจ apply ใช้ `router.push`
  - normalization และ page correction ใช้ `router.replace`
- Page links ต้องรักษา query ที่รองรับทั้งหมด
- ห้ามเก็บ filter หรือ PII search term ลง `localStorage`/`sessionStorage`
- Browser Back/Forward ต้องคืน filter และ page จาก URL ได้

## 11. Filter and validation rules

| Field | Client guidance | Server normalization | Error copy |
| --- | --- | --- | --- |
| Search | trim; max 150; submit on Enter/button | string เดียวเท่านั้น; empty omit | `คำค้นหาต้องไม่เกิน 150 ตัวอักษร` |
| Date from | valid calendar date | `YYYY-MM-DD` | `กรุณาเลือกวันเริ่มต้นให้ถูกต้อง` |
| Date to | valid calendar date | `YYYY-MM-DD`, not before from | `วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น` |
| Transaction type | listed enum/all | unknown omit + invalid-query notice | `ประเภทรายการไม่ถูกต้อง` |
| Status | listed enum/all | unknown omit + invalid-query notice | `สถานะไม่ถูกต้อง` |
| Page | positive integer | invalid → 1 | ไม่ต้องแสดง field error |
| Limit | 10/20/50 | invalid → 10 | ไม่ต้องแสดง field error |

- Frontend validation มีไว้ช่วยผู้ใช้และป้องกัน request ที่ผิดชัดเจน
- Backend schema เป็น final authority
- Query key ที่ไม่รู้จักไม่ต้อง forward ไป backend
- หาก query มี array จาก key ซ้ำ ให้ใช้ค่าแรกที่ valid หรือ normalize เป็น default อย่าง deterministic

## 12. Responsive behavior

### Desktop ≥ 1280px

- Filter panel เป็น grid:
  - search กว้างที่สุด
  - date range
  - transaction type
  - status
  - reset
- Result total อยู่ใต้ filters
- Table แสดงครบ 9 columns
- Pagination มี range ด้านซ้าย, page links กลาง และ page size ด้านขวา

### Tablet 768–1279px

- Filters เป็น 2 columns และ reset อยู่ท้าย grid
- Table อาจซ่อนข้อความรองของ quantity และใช้ compact spacing
- Table container scroll แนวนอนเฉพาะตัวเองเมื่อพื้นที่ไม่พอ
- ห้ามให้ทั้ง page เกิด horizontal overflow

### Mobile < 768px

- Header และ primary action stack
- Filters stack; date range แสดงสอง input พร้อม label ชัดเจน
- Desktop table ถูกแทนด้วย transaction cards
- Result count อยู่เหนือ cards
- Pagination แสดง prev/current/next และ page size แบบ compact
- Touch target อย่างน้อยประมาณ 44×44 px
- ข้อความ transaction number, customer และ amount ต้องไม่ถูกตัดจนระบุตัวตนไม่ได้

### Long-content strategy

- Customer name และ creator name wrap ได้ไม่เกินพื้นที่ row/card ที่เหมาะสม
- Transaction number ไม่ wrap กลาง token
- Money ใช้ tabular numerals และจัดแนวขวาบน desktop
- Unknown enum จาก backend แสดง raw safe text หรือ `ไม่ทราบประเภท` พร้อม telemetry/logging; ห้ามทำให้ทั้งหน้า crash

## 13. Accessibility

- ใช้ `<h1>` เพียงหนึ่งรายการผ่าน `PageHeader`
- Filter อยู่ใน `<form role="search">` หรือ landmark ที่มี accessible name
- ทุก input/select มี visible label
- Date range มี label แยก `ตั้งแต่วันที่` และ `ถึงวันที่` สำหรับ screen reader แม้ visual จะอยู่ control เดียว
- Table มี `<caption>` ที่อธิบายว่าเป็นประวัติ transaction ตามตัวกรองปัจจุบัน
- ใช้ shared `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- Header column ระบุ `scope="col"`
- Status/type ไม่พึ่งสีอย่างเดียว
- ปุ่ม icon รูปตาต้องมี `aria-label="ดูรายละเอียดรายการ {transactionNo}"`
- Current pagination page มี `aria-current="page"`
- Disabled pagination controls ใช้ semantic disabled หรือไม่ render เป็น active link
- Pending result region ใช้ `aria-busy="true"` และมีข้อความที่ screen reader รับรู้
- Error summary ใช้ `role="alert"` และ focus ไป error ที่ต้องแก้เมื่อ submit ไม่ผ่าน
- Empty state และ result count ใช้ live region แบบไม่รบกวนเกินไปเมื่อ navigation เสร็จ
- Keyboard user ต้องเข้าถึง search, filters, reset, rows/detail links และ pagination ตามลำดับที่คาดเดาได้
- Mobile cards ต้องไม่ทำ nested interactive controls ที่ขัดกัน

## 14. Acceptance criteria

1. Given Admin มี session ถูกต้อง เมื่อเปิด `/transactions` โดยไม่มี query แล้วเห็นข้อมูลตั้งแต่วันแรกของเดือนถึงวันนี้ตาม `Asia/Bangkok`, หน้า 1, 10 รายการต่อหน้า
2. Given history มีข้อมูล เมื่อ render แล้วรายการเรียง `createdAt DESC, id DESC`
3. Given transaction summary เมื่อแสดง row แล้วเลขรายการ ลูกค้า ประเภท จำนวน ยอดรวม สถานะ และผู้สร้างตรงกับ API snapshot
4. Given `customerPhone = null` เมื่อแสดง row แล้วใช้ `—` และ layout ไม่เสีย
5. Given transaction เป็น borrow/return และยอดเป็น `0.00` เมื่อแสดงแล้วไม่ตีความว่า API ผิดและไม่รวม deposit
6. Givenผู้ใช้ค้นเลขรายการบางส่วน เมื่อ submit แล้ว URL มี `search`, page reset เป็น 1 และผลลัพธ์มาจาก API
7. Givenผู้ใช้ค้นชื่อลูกค้าหรือเบอร์โทรบางส่วน เมื่อ submit แล้วใช้ search contract เดียวกัน
8. Givenเลือกช่วงวันที่ เมื่อ apply แล้วส่ง `dateFrom/dateTo` แบบ `YYYY-MM-DD` และตีความวันตาม Bangkok
9. Givenวันเริ่มหลังวันสิ้นสุด เมื่อ apply แล้วไม่ส่ง request และแสดงข้อความแก้ไขได้
10. Givenเลือก transaction type เมื่อ filter แล้ว URL ส่ง exact composite enum เพียงค่าเดียว
11. Givenเลือก status เมื่อ filter แล้ว URL ส่ง exact status enum
12. Given filters หลายค่า เมื่อโหลดผลลัพธ์แล้ว backend ใช้ AND ระหว่าง filters
13. Givenกดล้างตัวกรอง เมื่อเสร็จแล้วกลับ current-month default, all type/status, no search, page 1 และ limit 10
14. Givenเปลี่ยน filter หรือ limit จากหน้าที่มากกว่า 1 เมื่อ URL update แล้ว page กลับ 1
15. Given `totalItems` มากกว่า limit เมื่อ render แล้ว pagination ใช้ค่าจาก meta และรักษา filters ขณะเปลี่ยนหน้า
16. Given page ปัจจุบันเป็นหน้าแรก/สุดท้าย เมื่อ render แล้ว prev/next ที่ไปไม่ได้ไม่ active
17. Given URL page เกิน totalPages และยังมีผลลัพธ์ เมื่อ normalize แล้วไปหน้าสุดท้ายที่มีข้อมูล
18. Givenไม่มี transaction ในระบบ เมื่อ render แล้วเห็น empty state และปุ่มสร้างรายการใหม่
19. Givenมี filters แต่ไม่พบผลลัพธ์ เมื่อ render แล้วเห็น no-result state และล้าง filter ได้
20. Givenคลิกดูรายละเอียด เมื่อ navigate แล้วใช้ `/transactions/{id}` โดย id คงเป็น string
21. Given API list fail เมื่อ render แล้วไม่แสดงตัวเลข summary จาก mock/current page และมี retry ที่ชัดเจน
22. Given API คืน 401 เมื่อ request แล้ว auth policy จัดการ session และ token ไม่ปรากฏใน browser storage/JavaScript
23. Given API คืน 403 เมื่อ request แล้วหน้าแสดง forbidden state และทางกลับ dashboard
24. Given viewport mobile เมื่อดู history แล้วใช้ stacked cards โดยไม่มี horizontal overflow
25. Given keyboard-only user เมื่อใช้งาน filters/table/pagination แล้ว focus order และ focus indicator มองเห็นได้
26. Given screen reader user เมื่ออ่าน status, date range, result count และ view action แล้วเข้าใจได้โดยไม่อาศัยสีหรือ icon
27. Given master product/customer ถูกแก้หรือปิดใช้งาน เมื่อดูรายการเก่าแล้ว history ยังแสดง snapshot เดิมจาก transaction
28. Givenภาพมี KPI แยกสถานะ ยอดขาย และ Driver แต่ API ไม่มีข้อมูล เมื่อ implement MVP แล้ว UI ไม่สร้างค่าประมาณหรือข้อมูล mock เพื่อเลียนแบบภาพ

## 15. Risks and follow-up

- Implementation gaps:
  - `src/app/(app)/transactions/page.tsx` ยังเป็น placeholder และยังไม่อ่าน `searchParams`
  - `transaction-table.tsx` ยังเป็น `<section>` ว่าง
  - `transaction.api.ts` ยังไม่มี list wrapper
  - `transaction.types.ts` ยังไม่มี summary/list/pagination types
  - `src/lib/format/date.ts`, `currency.ts`, `phone.ts` ยังเป็น placeholder formatter
  - Shared UI ยังไม่มี `Pagination` และ `EmptyState`
- API/documentation mismatch:
  - Backend transaction module implement แล้ว แต่ `transaction-spec.md` ยังระบุ proposed/unimplemented
  - Frontend architecture รุ่นเก่าบางส่วนใช้ `/api/v1`; implementation และ transaction contract จริงใช้ `/api`
- Visual/API gaps:
  - ห้ามแสดง Driver/assignee จนมี field จริง
  - ห้ามแยก order type filter จน API model รองรับ dimension ดังกล่าว
  - ห้ามแสดง status totals หรือ filtered sales total จากการรวมเฉพาะ current page
- Follow-up specifications:
  - Transaction detail/status action screen
  - Filtered transaction aggregate endpoint หากต้องรักษา KPI strip
  - Delivery assignment contract หากต้องแสดง Driver/Rider
- Implementation verification:
  - Unit test query normalization, label mapping, result range และ money/date formatting
  - Component test filters, empty/error states และ pagination
  - Run lint
  - Run build เพราะ route จะเปลี่ยนเป็น async Server Component ที่ใช้ `searchParams` และเพิ่ม shared imports
  - Browser QA desktop/tablet/mobile รวม Back/Forward, invalid query, no result, auth expiry และ long Thai content
