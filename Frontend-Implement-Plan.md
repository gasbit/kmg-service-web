# KMG-SERVICE แผน Implement ฝั่ง Frontend

เอกสารนี้เป็นแผนดำเนินการสำหรับ `KMG-SERVICE-WEB` โดยอ้างอิงจาก `Business-Flow.md`, `Frontend-Architecture.md`, `Backend-Architecture.md`, `Database-Design.md`, `Planning.md`, `Context.md` และ context ใน `KMG-SERVICE-WEB`

เป้าหมายคือพา frontend ไปสู่ MVP ที่ Admin ใช้งาน flow หลักของร้านแก๊สได้ครบ โดยไม่ย้าย business source of truth ออกจาก backend

## 1. สรุปสถานะปัจจุบัน

Frontend ปัจจุบันมีโครงสร้าง Next.js App Router และ feature folders หลักแล้ว:

1. Routes หลักมีแล้ว เช่น `/login`, `/dashboard`, `/products`, `/transactions`, `/queues`, `/loans`, `/inventory`
2. Feature folders มีแล้ว เช่น `auth`, `dashboard`, `products`, `transactions`, `queues`, `loans`, `inventory`
3. Shared folders มีแล้ว เช่น `components/ui`, `components/app-shell`, `lib/api`, `lib/auth`, `lib/format`, `lib/hooks`
4. Foundation ฝั่ง API/auth มี implementation แล้ว แต่หลาย feature ยังเป็น stub หรือยังต้องเติม contract จริง เช่น DTO types, forms, tables, dashboard widgets และ mutation actions

แผน implement นี้จึงเน้นการเติมระบบให้ครบตาม MVP แทนการ scaffold ใหม่จากศูนย์

### 1.1 Checklist ภาพรวมจาก Code จริง

ตรวจล่าสุดวันที่ `2026-07-04` จาก source code ใน `KMG-SERVICE-WEB/src` และ routes/schemas ใน `KMG-SERVICE-API/src` พบว่า frontend มี foundation และ auth login integration แล้ว แต่ feature business หลักส่วนใหญ่ยังอยู่ระดับ skeleton และยังไม่ใช่ MVP ที่ใช้งาน flow จริงได้ครบ

- [ ] Phase 0: จัด Alignment และ Contract
  สถานะ: `Partial` - ตรวจ endpoint/schema backend รอบล่าสุดแล้ว แต่ยังต้องสรุป response DTO และ mapping error code ให้ครบก่อน implement feature
- [x] Phase 1: วางรากฐาน
  สถานะ: `Done` - มี API client, response/error model, auth cookie/session helper และ route guard ผ่าน Next.js 16 `proxy`
- [ ] Phase 2: Shared UI และ App Shell
  สถานะ: `Partial` - `TopBar` แสดง current user/logout แล้ว แต่ `AppSidebar` และ `MobileNav` ยังต้องเติม navigation จริง
- [x] Phase 3: Auth
  สถานะ: `Implemented, pending browser E2E` - login/logout route handlers, form submit, httpOnly cookie, current user และ logout action ทำแล้ว; backend HTTP login smoke test ผ่านหลังแก้ API validate middleware แต่ยังต้องลองผ่าน browser หลัง restart backend port 4000
- [ ] Phase 4: Dashboard
  สถานะ: `Todo` - `getDashboardData()` ยังคืน `null`, widget ยังว่าง
- [ ] Phase 5: Products
  สถานะ: `Todo` - API/types/schema/form/table ยังเป็น placeholder
- [ ] Phase 6: Transactions
  สถานะ: `Todo` - create form, history table, detail และ status actions ยังเป็น placeholder
- [ ] Phase 7: Queue
  สถานะ: `Todo` - queue API และ board ยังเป็น placeholder
- [ ] Phase 8: Loans
  สถานะ: `Todo` - loan API/table/return dialog ยังเป็น placeholder
- [ ] Phase 9: Inventory
  สถานะ: `Todo` - inventory API/tables/adjustment form ยังเป็น placeholder
- [ ] Phase 10: ทำให้ระบบพร้อมใช้งาน
  สถานะ: `Partial` - เคยมีผล `npm run lint` และ `npm run build` ผ่านสำหรับ auth integration, backend HTTP login ผ่านแล้ว แต่รอบตรวจ `2026-07-04` ยังไม่ได้ rerun เพราะ `git status` ติด Command Line Tools (`xcrun`) ของเครื่อง และยังไม่ได้ทดสอบ browser E2E หลัง restart backend runtime

งานปัจจุบัน:

- [ ] ปิด Phase 0 ให้ครบ โดยสรุป response DTO จาก service/repository ฝั่ง backend และอัปเดต frontend types ตาม contract จริง
- [ ] ทดสอบ auth ผ่าน browser จริงหลัง restart backend port `4000`
- [ ] เริ่มเชื่อม Dashboard เป็น feature แรกหลัง foundation พร้อม

งานถัดไปที่ควรเริ่มก่อน:

- [x] ตรวจ backend endpoint และ request schema จริงระดับ route สำหรับทุก feature
- [x] Implement `src/lib/api/client.ts`, `response.ts`, `errors.ts`
- [x] Implement auth cookie/session helpers
- [x] Implement login/logout route handlers และ actions
- [x] Implement route guard ด้วย Next.js 16 `proxy`
- [ ] สรุป response DTO จริงจาก backend service/repository สำหรับ Dashboard, Products, Transactions, Queue, Loans และ Inventory
- [ ] Implement `src/features/dashboard/*` ให้เรียก `GET /dashboard/today` และแสดง widgets จริง
- [ ] Implement navigation จริงใน `AppSidebar` และ `MobileNav`

### 1.2 รายละเอียดสถานะจากการตรวจ Code จริง

Legend:

- `Done`: มี implementation จริงและพร้อมใช้งานในระดับที่ checklist ต้องการ
- `Partial`: มีไฟล์/route/component แล้ว แต่ยังเป็น placeholder หรือยังขาด behavior สำคัญ
- `Todo`: ยังไม่มี implementation ที่ใช้งานได้
- `Not verified`: ยังไม่ได้ยืนยันด้วยการรัน command หรือทดสอบ flow

| ส่วนงาน | สถานะ | หลักฐานจาก code จริง | งานที่ต้องทำต่อ |
| --- | --- | --- | --- |
| Route structure | `Partial` | มี routes หลักใต้ `src/app/(app)` และ `src/app/(auth)` | เติม data fetching, actions, loading/error states และ auth guard |
| Shared UI primitives | `Partial` | มี `src/components/ui/*` และ `src/components/icon/icons.tsx` | ตรวจ coverage ของ state, validation, table actions และ responsive behavior |
| App shell | `Partial` | `TopBar` แสดง current user และ logout แล้ว แต่ `AppSidebar` / `MobileNav` ยังเป็น shell เปล่า | เติม navigation จริงและ mobile behavior |
| API client foundation | `Done` | `src/lib/api/client.ts` เรียก backend ผ่าน `fetch`, อ่าน token จาก cookie และแนบ `Authorization` | เพิ่ม query params helper เมื่อ feature ถัดไปต้องใช้ |
| API response/error model | `Done` | `src/lib/api/response.ts` และ `src/lib/api/errors.ts` รองรับ standard response, `ApiError`, `requestId` และ error mapping | ขยาย mapping ตาม error code จริงจาก backend เพิ่มเติม |
| Auth | `Implemented, pending browser E2E` | login form submit ไป `/api/auth/login`, route handler set httpOnly cookie, logout clear cookie, current user เรียก `/auth/me`; backend HTTP login smoke test ผ่านด้วย `admin_kmg` | Restart backend port 4000 แล้วทดสอบ login ผ่าน browser จริง |
| Route guard | `Done` | ใช้ `src/proxy.ts` redirect unauthenticated user ไป `/login` และ redirect logged-in user จาก `/login` ไป `/dashboard` | เพิ่ม permission/role guard เมื่อ backend ส่งสิทธิ์ละเอียดขึ้น |
| Dashboard | `Todo` | `getDashboardData()` คืน `null`, `DashboardData = Record<string, never>`, `TodayDashboard` เป็น section เปล่า | เชื่อม `/dashboard/today`, สร้าง DTO และ widgets |
| Products | `Todo` | `getProducts()` คืน `[]`, `Product = Record<string, never>`, form/table เป็น placeholder; backend route จริงคือ `PATCH /products/:id` สำหรับ update | Implement list/create/edit/soft delete และ schema จริง |
| Transactions | `Todo` | `getTransactions()` คืน `[]`, `Transaction = Record<string, never>`, form/table/detail เป็น placeholder; backend มี create/list/detail/status/cancel routes แล้ว | Implement create/history/detail/status/cancel actions และ transaction type logic ฝั่ง UI |
| Queues | `Todo` | `getQueues()` คืน `[]`, `Queue = Record<string, never>`, board เป็น placeholder; backend มี `/queues/today`, `/queues?date=...`, `PATCH /queues/:transactionId/status` | Implement today queue, dated queue และ status update actions |
| Loans | `Todo` | `getLoans()` คืน `[]`, `Loan = Record<string, never>`, return dialog เป็น placeholder; backend mount จริงคือ `/loans` ไม่ใช่ `/cylinder-loans` | Implement list/active/detail และ return loan flow |
| Inventory | `Todo` | `getInventory()` คืน `[]`, types เป็น `Record<string, never>`, tables/form เป็น placeholder; backend มี balances/movements/adjustments routes แล้ว | Implement balances, movements และ adjustment form |
| Types and schemas | `Todo` | หลาย feature ยังใช้ `Record<string, never>` และ schema เป็น `{}` | สร้าง DTO/types/schema จริงให้ตรง backend contract |
| Revalidation after mutation | `Todo` | ยังไม่มี mutation จริง | เพิ่ม revalidate path ตาม revalidation matrix |
| Lint/build verification | `Needs rerun` | เอกสารเดิมระบุว่า `npm run lint` และ `npm run build` ผ่านแล้ว แต่รอบตรวจล่าสุดยังไม่ได้ rerun; `git status` ใช้ไม่ได้เพราะ `xcrun` missing | หลังแก้ feature ถัดไปให้ rerun lint/build และ browser E2E |

สรุปสถานะตอนนี้: foundation และ auth login integration ฝั่ง frontend พร้อมเป็นฐานแล้ว และ backend route contract ระดับ endpoint/request schema ถูกตรวจรอบล่าสุดแล้ว งานถัดไปคือสรุป response DTO จริงให้ครบ, restart backend port `4000` เพื่อทดสอบ login ผ่าน browser จากนั้นเริ่มเชื่อม Dashboard เป็น feature แรกก่อนขยายไป Products, Transactions, Queue, Loans และ Inventory

## 2. หลักการดำเนินงาน

1. Frontend เป็น presentation และ interaction layer
2. Backend เป็นเจ้าของ business workflow, validation authority, status transition, queue generation, inventory movement และ loan lifecycle
3. Browser ไม่ควรเรียก Express API โดยตรงเมื่อต้องแนบ token
4. Server-side API client ต้องแนบ `Authorization: Bearer <token>` จาก httpOnly cookie
5. IDs จาก backend ที่เป็น bigint ให้รับเป็น `string` ใน frontend
6. ทุก mutation ต้อง revalidate route ที่เกี่ยวข้อง
7. Dashboard ต้องเป็น read-only view
8. UI ต้องเหมาะกับงาน operational: อ่านง่าย, action ชัด, table/filter ใช้งานเร็ว, ไม่เน้น landing-page style

## 3. ขอบเขตฟีเจอร์ MVP

MVP frontend ต้องทำให้ Admin สามารถ:

1. Login และ logout ได้
2. เห็น Dashboard เป็นหน้าแรกหลัง login
3. จัดการสินค้า: list, create, edit, soft delete
4. สร้าง transaction ได้ครบ 5 ประเภท
5. ดู transaction history พร้อม filter/search
6. ดู transaction detail และ status log
7. จัดการคิวส่งแก๊สรายวัน
8. อัปเดตสถานะ `DELIVERY_EXCHANGE`
9. ดูรายการยืมถังค้าง
10. คืนถังแบบเต็มจำนวนหรือบางส่วน
11. ดู stock balance
12. ดู inventory movement
13. ปรับยอด stock พร้อม note
14. เห็น error/loading/empty state ที่เข้าใจง่าย

## 4. สมมติฐาน API Contract

Frontend ควรยึด versioned API path:

```text
API_BASE_URL=http://localhost:4000/api/v1
```

รูปแบบ API response ที่คาดหวัง:

```ts
type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta: {
    requestId: string;
    [key: string]: unknown;
  };
};

type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    requestId: string;
  };
};
```

กลุ่ม endpoint ฝั่ง Frontend:

| ส่วนงาน | API ที่คาดหวัง |
| --- | --- |
| Auth | `POST /auth/login`, `GET /auth/me`, logout via frontend route handler |
| Dashboard | `GET /dashboard/today` |
| Products | `GET /products`, `POST /products`, `GET /products/:id`, `PATCH /products/:id`, `DELETE /products/:id` |
| Transactions | `POST /transactions`, `GET /transactions`, `GET /transactions/:id`, `PATCH /transactions/:id/status`, `POST /transactions/:id/cancel` |
| Queues | `GET /queues/today`, `GET /queues?date=...`, `PATCH /queues/:transactionId/status` |
| Loans | `GET /loans`, `GET /loans/active`, `GET /loans/:id`, `POST /loans/:id/return` |
| Inventory | `GET /inventory/balances`, `GET /inventory/movements`, `POST /inventory/adjustments` |

ถ้า backend path จริงต่างจากนี้ ให้ปรับเฉพาะ feature API wrappers โดยไม่กระจาย path ไปทั่ว component

## 5. Phase 0: จัด Alignment และ Contract

เป้าหมาย: ล็อก contract ที่ frontend จะ implement ตาม ก่อนเริ่มเขียน feature behavior

งานที่ต้องทำ:

1. ตรวจ endpoint จริงใน `KMG-SERVICE-API`
   สถานะ: `Done` จาก `src/routes.ts` และ `src/modules/*/*.routes.ts`
2. สรุป DTO input/output ต่อ feature
   สถานะ: `Partial` - request schema ตรวจแล้วจาก `*.schema.ts`; ยังต้อง map response DTO จาก service/repository
3. ยืนยัน enum ที่ใช้ร่วมกัน:
   - `TransactionType`
   - `TransactionStatus`
   - `ItemAction`
   - `LoanStatus`
   - `MovementType`
   สถานะ: `Done` จาก `transaction.constants.ts` และ `inventory.constants.ts`
4. ยืนยัน error code ที่ต้อง map เป็นข้อความผู้ใช้
   สถานะ: `Partial` - frontend map แล้วบางส่วน (`UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`) แต่ยังต้องเพิ่ม `NOT_FOUND`, `CONFLICT`, `INSUFFICIENT_STOCK`, `INVALID_STATUS_TRANSITION`, `INTERNAL_ERROR`
5. ยืนยัน route revalidation หลัง mutation
   สถานะ: `Partial` - มี matrix ในเอกสารแล้ว แต่ต้องปรับเพิ่มหลัง mutation actions จริง

Backend request schema ที่ frontend ต้องยึด:

| Feature | Query/Body หลัก |
| --- | --- |
| Products list | `search?`, `includeInactive`, `page`, `limit` |
| Products create | `brand`, `weightKg`, `exchangeCostPrice`, `exchangeSalePrice`, `fullTankPrice`, `initialFullQty`, `initialEmptyQty` |
| Products update | partial ของ create ยกเว้น `initialFullQty`, `initialEmptyQty` |
| Transactions list | `type?`, `status?`, `customerPhone?`, `page`, `limit` |
| Transactions create | `transactionType`, customer snapshot, `expectedReturnDate?`, `depositAmount`, `items[]` ที่มี `productId`, `quantity`, `itemAction`, `unitPrice?`, `costPrice?`, `note?` |
| Transaction status | `status`, `note?` |
| Queue list | `date` default วันนี้ |
| Loans list | `status?`, `page`, `limit` |
| Loan return | `quantity`, `note?` |
| Inventory movements | `productId?`, `page`, `limit` |
| Inventory adjustment | `productId`, `fullQtyDelta`, `emptyQtyDelta`, `loanedQtyDelta`, `note` |

เกณฑ์ยอมรับ:

1. มีรายการ API endpoint และ DTO ที่ frontend ใช้ครบ
2. ไม่มี component เรียก raw path เอง
3. Feature API wrappers เป็นจุดเดียวที่รู้ backend path

## 6. Phase 1: วางรากฐาน

เป้าหมาย: ทำฐาน API/auth/layout ให้ feature อื่นต่อได้

งานที่ต้องทำ:

1. Implement `src/lib/api/response.ts`
   - parse success response
   - parse error response
   - handle malformed response
2. Implement `src/lib/api/errors.ts`
   - `ApiError`
   - error code mapping
   - requestId support
3. Implement `src/lib/api/client.ts`
   - read token server-side
   - attach `Authorization`
   - support query params
   - support cache/no-store options
   - throw `ApiError`
4. Implement auth cookie/session helpers
   - httpOnly cookie
   - session read helper
   - current user helper
5. Implement middleware guard
   - unauthenticated user to `/login`
   - authenticated user away from `/login` to `/dashboard`
6. Confirm route constants and permission map
7. สร้าง loading/error/empty state primitives ถ้ายังไม่มี

เกณฑ์ยอมรับ:

1. Server components เรียก backend ผ่าน API client กลางได้
2. Client mutations เรียก server actions หรือ route handlers ได้อย่างปลอดภัย
3. Auth state ถูกบังคับก่อนเข้า app routes
4. API errors แสดงข้อความที่ผู้ใช้เข้าใจได้

## 7. Phase 2: Shared UI และ App Shell

เป้าหมาย: ให้ทุกหน้ามี shell และ UI primitives ที่พร้อมใช้แบบ consistent

งานที่ต้องทำ:

1. ทำ app shell layout ให้สมบูรณ์
   - desktop sidebar
   - mobile nav
   - top bar
   - current user
   - logout action
2. ทำ shared UI components ให้สมบูรณ์
   - Button
   - Input
   - Select
   - Table
   - Dialog
   - Toast
   - Card only where appropriate for widgets/items
3. เพิ่ม common operational components
   - Page header
   - Filter bar
   - Status badge
   - Money display
   - Date display
   - Confirm dialog
4. ตรวจ responsive behavior สำหรับหน้าที่ใช้ table เยอะ
5. ตรวจให้ label ภาษาไทยแสดงพอดีทั้ง mobile และ desktop

เกณฑ์ยอมรับ:

1. หน้าที่ต้อง login ใช้ app shell เดียวกัน
2. Navigation ครอบคลุม Dashboard, Transactions, Queues, Loans, Products และ Inventory
3. UI states สอดคล้องกันทุก feature
4. Layout ใช้งานได้ทั้ง desktop และ mobile โดยข้อความไม่ทับกัน

## 8. Phase 3: Auth

เป้าหมาย: ทำ login/logout ให้ใช้งานจริงกับ backend

### 8.1 แผน Integrate API Login

Backend contract ที่ต้องใช้:

```text
POST /api/v1/auth/login
```

Payload:

```json
{
  "username": "admin",
  "password": "admin1234"
}
```

Expected success response:

```ts
type LoginResponse = {
  success: true;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      name: string;
      roleCode: string;
    };
  };
  meta: {
    requestId: string;
  };
};
```

ลำดับ implement ที่แนะนำ:

1. Implement frontend login route handler
   - ไฟล์: `src/app/api/auth/login/route.ts`
   - รับ `username` และ `password` จาก login form
   - เรียก backend `POST ${API_BASE_URL}/auth/login`
   - ถ้าสำเร็จ set token ลง httpOnly cookie
   - return user/session summary ให้ client
   - ถ้า fail ให้ map backend error กลับไปให้ form แสดง
2. Implement auth cookie/session helpers
   - ไฟล์: `src/lib/auth/cookies.ts`
   - ไฟล์: `src/lib/auth/session.ts`
   - กำหนด cookie name เช่น `kmg_session`
   - set cookie แบบ `httpOnly`, `sameSite: "lax"` และ `secure` เฉพาะ production
   - read token/session ฝั่ง server
   - clear cookie ตอน logout
3. Implement login action หรือ submit handler
   - ไฟล์: `src/features/auth/actions.ts`
   - ไฟล์: `src/features/auth/login-form.tsx`
   - validate field เบื้องต้น
   - submit ไป `/api/auth/login`
   - แสดง pending state
   - แสดง error เช่น username/password ผิด
   - login สำเร็จ redirect ไป `/dashboard`
4. Implement API client foundation ให้รองรับ token
   - ไฟล์: `src/lib/api/client.ts`
   - อ่าน token จาก httpOnly cookie ฝั่ง server
   - แนบ `Authorization: Bearer <token>`
   - parse response `{ success, data, meta }`
   - throw `ApiError` เมื่อ backend return error
5. Implement current user/session loader
   - ไฟล์: `src/features/auth/server.ts`
   - ไฟล์: `src/lib/auth/session.ts`
   - เรียก backend `GET /api/v1/auth/me`
   - คืน current user ให้ app shell/topbar
   - ถ้า token invalid ให้ถือว่าไม่มี session
6. Implement route guard
   - ไฟล์: `src/middleware.ts` หรือ Next.js 16 `proxy`
   - ไม่มี session แล้วเข้า `(app)` routes ให้ redirect `/login`
   - login แล้วเข้า `/login` ให้ redirect `/dashboard`
7. Implement logout ต่อทันที
   - ไฟล์: `src/app/api/auth/logout/route.ts`
   - ไฟล์: `src/features/auth/actions.ts`
   - clear cookie
   - redirect `/login`

Checklist ย่อยสำหรับ login integration:

- [ ] Browser E2E: กรอก username/password ถูกต้องแล้วเข้า `/dashboard` หลัง restart backend port 4000
- [x] Backend HTTP smoke test: `POST /api/v1/auth/login` ผ่านด้วย `admin_kmg` / `admin1234`
- [ ] E2E: password ผิดแล้วเห็น error ใน form จาก backend จริง
- [x] token ถูกเก็บใน httpOnly cookie ไม่อยู่ใน `localStorage`
- [ ] E2E: refresh หน้าแล้วยังมี session เมื่อ token ยัง valid
- [x] ไม่มี session แล้วเข้า `/dashboard` ไม่ได้
- [x] login แล้วเข้า `/login` ถูก redirect ไป `/dashboard`
- [x] logout แล้ว cookie ถูกลบ
- [x] `TopBar` อ่าน current user ผ่าน `GET /auth/me`
- [x] backend error ถูก map เป็นข้อความที่ Admin เข้าใจง่ายในระดับ frontend
- [x] API client แนบ `Authorization: Bearer <token>` ได้จาก server-side cookie

### 8.2 งาน Auth รวม

งานที่ต้องทำ:

1. Implement login route handler
   - receive username/password
   - call `POST /api/v1/auth/login`
   - set httpOnly cookie
2. Implement login form
   - field validation
   - pending state
   - invalid credential error
   - redirect to `/dashboard`
3. Implement logout route handler/action
   - clear cookie
   - redirect to `/login`
4. Implement current user fetch
   - `GET /api/v1/auth/me`
   - show user in top bar

เกณฑ์ยอมรับ:

1. Admin login สำเร็จแล้วเข้า Dashboard
2. Password ผิดแสดง error ที่เข้าใจง่าย
3. Logout แล้วกลับไป `/login`
4. App routes เข้าไม่ได้ถ้าไม่มี session

## 9. Phase 4: Dashboard

เป้าหมาย: Dashboard เป็นหน้าหลักที่ช่วย Admin เห็นงานวันนี้ทันที

งานที่ต้องทำ:

1. Implement `dashboard.api.ts`
   - `getTodayDashboard`
2. กำหนด dashboard DTO/types
   - today transactions
   - status summary
   - pending queue
   - today sales
   - product prices
   - active loans
   - inventory balances
3. Implement dashboard page/server fetch
4. Implement widgets
   - Status summary
   - Pending queue
   - Today sales
   - Product price list
   - Active loans
   - Inventory balance
5. เพิ่ม direct actions/links
   - create transaction
   - open queue
   - open active loans
   - open low stock item if available

เกณฑ์ยอมรับ:

1. `/dashboard` loads from backend
2. Empty day still renders useful empty states
3. Dashboard does not mutate data
4. Dashboard refreshes after related mutations through revalidation

## 10. Phase 5: Products

เป้าหมาย: Admin จัดการสินค้าแก๊สได้ครบ

งานที่ต้องทำ:

1. Implement product types and schema
2. Implement `product.api.ts`
   - list
   - detail
   - create
   - update
   - soft delete
3. Implement product list page
   - table
   - active/inactive filter
   - search by brand/weight if backend supports
   - actions
4. Implement create product form
5. Implement edit product form
6. Implement soft delete confirmation
7. Revalidate `/products` and `/inventory` after mutation

เกณฑ์ยอมรับ:

1. Admin เพิ่มสินค้าได้
2. Admin แก้ราคาสินค้าได้
3. Admin ปิดใช้งานสินค้าได้
4. Inactive product ไม่ควรถูกเลือกใน transaction ใหม่
5. ประวัติเก่ายังแสดง snapshot ได้ตาม backend data

## 11. Phase 6: Transactions

เป้าหมาย: Admin สร้างและตรวจสอบ transaction ได้ครบทุก business flow

งานที่ต้องทำ:

1. Implement transaction enums/types
   - transaction type
   - status
   - item action
   - detail DTO
   - list DTO
   - create payload
   - status update payload
2. Implement `transaction.api.ts`
   - list
   - detail
   - create
   - update status
3. Implement transaction create form
   - transaction type selector
   - customer snapshot fields
   - dynamic item rows
   - product selector from active products
   - quantity
   - note
   - expected return date/deposit for borrow flow
   - loan selector for return flow if required
4. Implement pricing behavior
   - exchange flows use exchange sale price
   - buy full tank uses full tank price
   - frontend calculates display total only
   - backend remains source of truth
5. Implement transaction history
   - date filter
   - type filter
   - status filter
   - customer phone/name search
   - transaction number search
6. Implement transaction detail
   - customer snapshot
   - item snapshots
   - total
   - status log
   - inventory/loan effects if backend returns
7. Implement status actions
   - show only valid next actions
   - confirmation before cancel/complete
   - map API error codes
8. Revalidate related routes after create/status change

เกณฑ์ยอมรับ:

1. Admin สร้าง `DELIVERY_EXCHANGE` ได้ และเห็น queue number
2. Admin สร้าง `WALK_IN_EXCHANGE` ได้
3. Admin สร้าง `BORROW_CYLINDER` ได้
4. Admin สร้าง `RETURN_CYLINDER` ได้
5. Admin สร้าง `BUY_FULL_TANK` ได้
6. Transaction หนึ่งรายการมีหลายสินค้าได้
7. History filter ใช้งานได้
8. Detail แสดง snapshot และ status log
9. Invalid status transition แสดง error ชัดเจน

## 12. Phase 7: Queue

เป้าหมาย: Admin เห็นคิวส่งแก๊สวันนี้และอัปเดตสถานะได้

งานที่ต้องทำ:

1. Implement queue types
2. Implement `queue.api.ts`
   - today queue
   - update status
3. Implement queue board/list
   - queue number
   - customer
   - phone/address
   - items
   - current status
   - action buttons
4. Implement status update actions
   - `PENDING -> IN_PROGRESS`
   - `PENDING -> CANCELLED`
   - `IN_PROGRESS -> COMPLETED`
   - `IN_PROGRESS -> CANCELLED`
5. เพิ่ม confirmation for complete/cancel
6. Revalidate `/queues`, `/dashboard`, `/transactions`, `/inventory`

เกณฑ์ยอมรับ:

1. Delivery queue แสดงตาม queue number
2. Update status ได้ตาม allowed transition
3. เมื่อ complete แล้ว backend ตัด stock และ frontend refresh stock/dashboard
4. Cancelled queue ไม่ตัด stock

## 13. Phase 8: Loans

เป้าหมาย: Admin ติดตามและคืนถังที่ถูกยืมได้

งานที่ต้องทำ:

1. Implement loan types/status
2. Implement `loan.api.ts`
   - list loans
   - active loans
   - loan detail
   - return loan
3. Implement loans list
   - status filter
   - overdue indication if backend returns
   - customer search
4. Implement loan detail page
   - customer snapshot
   - product
   - borrowed quantity
   - returned quantity if available
   - expected return date
   - deposit
   - status
5. Implement return loan dialog
   - return quantity
   - return note
   - validation against remaining quantity
6. Revalidate `/loans`, `/dashboard`, `/inventory`, `/transactions`

เกณฑ์ยอมรับ:

1. Active loan list แสดงรายการยืมค้าง
2. คืนบางส่วนได้ถ้า backend รองรับ
3. คืนครบแล้ว status เป็น returned
4. Return flow สร้าง transaction history และ inventory movement ผ่าน backend

## 14. Phase 9: Inventory

เป้าหมาย: Admin เห็น stock ปัจจุบัน ประวัติ movement และปรับยอดได้

งานที่ต้องทำ:

1. Implement inventory types
2. Implement `inventory.api.ts`
   - balances
   - movements
   - adjustments
3. Implement balance table
   - product
   - full quantity
   - empty quantity
   - loaned quantity
4. Implement movement table
   - product
   - movement type
   - quantity
   - transaction reference
   - date
   - note
5. Implement adjustment form
   - product
   - full/empty/loaned delta or backend-defined payload
   - required note
6. Revalidate `/inventory`, `/inventory/movements`, `/dashboard`

เกณฑ์ยอมรับ:

1. Admin เห็นยอด stock ปัจจุบัน
2. Admin เห็นประวัติ movement
3. Admin ปรับ stock ได้พร้อม note
4. Insufficient stock error แสดงชัดเจนใน flow ที่เกี่ยวข้อง

## 15. Phase 10: ทำให้ระบบพร้อมใช้งาน

เป้าหมาย: ทำให้ MVP พร้อมใช้งานและลด regression

งานที่ต้องทำ:

1. เพิ่ม route-level loading states
2. เพิ่ม route-level error boundaries where useful
3. ทำให้ all empty states
4. ทำให้ all destructive confirmations
5. ตรวจ Thai copy for operational clarity
6. ตรวจ responsive layout
7. ตรวจ permission guard display
8. ตรวจ all API error handling
9. รัน lint/build
10. เพิ่ม focused tests if test stack is available

เกณฑ์ยอมรับ:

1. `npm run lint` ผ่าน
2. `npm run build` ผ่าน
3. ไม่มีหน้าเปล่าที่ผู้ใช้ไม่รู้ว่าต้องทำอะไรต่อ
4. Mutation สำคัญมี pending/success/error feedback
5. Mobile layout ไม่แตกสำหรับงานหลัก

## 16. ตาราง Revalidation

| Mutation | Route ที่ต้อง Revalidate |
| --- | --- |
| Login | `/dashboard` |
| Logout | `/login` |
| สร้าง product | `/products`, `/inventory`, `/dashboard` |
| Update product | `/products`, `/products/[id]/edit`, `/dashboard` |
| Soft delete product | `/products`, `/transactions/new` |
| สร้าง transaction | `/dashboard`, `/transactions`, `/queues`, `/loans`, `/inventory` |
| Change transaction status | `/dashboard`, `/transactions`, `/queues`, `/inventory` |
| Return loan | `/dashboard`, `/loans`, `/inventory`, `/transactions` |
| Adjust inventory | `/inventory`, `/inventory/movements`, `/dashboard` |

## 17. ลำดับ Implement ที่แนะนำ

1. Phase 0: จัด Alignment และ Contract
2. Phase 1: วางรากฐาน
3. Phase 2: Shared UI และ App Shell
4. Phase 3: Auth
5. Phase 4: Dashboard
6. Phase 5: Products
7. Phase 6: Transactions
8. Phase 7: Queue
9. Phase 8: Loans
10. Phase 9: Inventory
11. Phase 10: ทำให้ระบบพร้อมใช้งาน

เหตุผลของลำดับนี้คือ auth/API client/app shell เป็น dependency ของทุกหน้า จากนั้น Dashboard และ Products ช่วยเปิดข้อมูลตั้งต้นให้ transaction form ใช้งานได้ แล้วจึงตามด้วย Transactions, Queue, Loans และ Inventory ซึ่งมีผลกระทบต่อกัน

## 18. Checklist เกณฑ์ยอมรับ MVP

ใช้ checklist นี้ก่อนถือว่า frontend MVP พร้อม:

| ข้อ | เกณฑ์ | สถานะปัจจุบัน | หลักฐานจาก code จริง | งานที่ต้องทำต่อ |
| --- | --- | --- | --- | --- |
| 1 | Admin login สำเร็จ | `Implemented, pending browser E2E` | `/api/auth/login` เรียก backend, set httpOnly cookie และ login form redirect `/dashboard` เมื่อ success; backend HTTP smoke test ผ่านด้วย `admin_kmg` | Restart backend port 4000 แล้วทดสอบผ่าน browser จริง |
| 2 | Admin logout สำเร็จ | `Implemented, pending browser E2E` | `logoutAction()` clear cookie ผ่าน `/api/auth/logout` และ redirect `/login` | ทดสอบกับ browser หลัง login สำเร็จจริง |
| 3 | ไม่มี session แล้วเข้าหน้า app ไม่ได้ | `Done` | `src/proxy.ts` redirect app routes ไป `/login` เมื่อไม่มี `kmg_session` | เพิ่ม role/permission guard ใน phase ถัดไปถ้าต้องใช้ |
| 4 | Dashboard แสดงข้อมูลวันนี้ได้ | `Todo` | `getDashboardData()` คืน `null`, widget ว่าง | เชื่อม dashboard API และสร้าง widgets |
| 5 | Product list/create/edit/soft delete ใช้งานได้ | `Todo` | `getProducts()` คืน `[]`, form/table placeholder | Implement product API wrappers, schema, form, table actions |
| 6 | Transaction create รองรับสินค้าหลายรายการ | `Todo` | `TransactionForm` เป็น form เปล่า | Implement dynamic item rows และ payload ตาม transaction type |
| 7 | `DELIVERY_EXCHANGE` สร้าง queue ได้ | `Todo` | ยังไม่มี create transaction จริง | เชื่อม create transaction และแสดง queue number จาก backend |
| 8 | Queue update status ได้ตาม flow | `Todo` | `QueueBoard` เป็น placeholder | Implement queue API และ status action buttons |
| 9 | `DELIVERY_EXCHANGE` ที่ complete แล้วทำให้ dashboard/inventory refresh | `Todo` | ยังไม่มี status mutation/revalidation | Implement status mutation และ revalidate `/dashboard`, `/queues`, `/inventory`, `/transactions` |
| 10 | `WALK_IN_EXCHANGE` สร้างรายการสำเร็จ | `Todo` | ยังไม่มี transaction create behavior | เพิ่ม flow ใน transaction form |
| 11 | `BORROW_CYLINDER` สร้าง loan สำเร็จ | `Todo` | ยังไม่มี transaction create behavior | เพิ่ม borrow fields และ payload |
| 12 | `RETURN_CYLINDER` คืนถังและอัปเดต loan สำเร็จ | `Todo` | `ReturnLoanDialog` เป็น dialog placeholder | Implement loan selector/return dialog และ backend mutation |
| 13 | `BUY_FULL_TANK` สร้างรายการสำเร็จ | `Todo` | ยังไม่มี transaction create behavior | เพิ่ม full tank pricing/display behavior |
| 14 | Transaction history filter ได้ | `Todo` | `TransactionTable` เป็น placeholder | Implement query params, filters และ table |
| 15 | Transaction detail แสดง snapshot และ status log | `Todo` | `TransactionDetail` เป็น placeholder | Implement detail fetch และ UI |
| 16 | Active loans แสดงรายการค้างคืน | `Todo` | `getLoans()` คืน `[]`, `LoanTable` placeholder | Implement active loans API และ table |
| 17 | Return loan รองรับคืนบางส่วนหรือคืนครบตาม backend | `Todo` | `ReturnLoanDialog` ยังไม่มี fields/action | Implement return quantity validation และ submit |
| 18 | Inventory balance แสดงถูกต้อง | `Todo` | `getInventory()` คืน `[]`, `BalanceTable` placeholder | Implement balances API และ table |
| 19 | Inventory movement แสดงถูกต้อง | `Todo` | `MovementTable` placeholder | Implement movements API, filters และ table |
| 20 | Inventory adjustment ต้องมี note | `Todo` | `AdjustmentForm` เป็น form เปล่า, schema `{}` | Implement adjustment schema/form และ required note |
| 21 | API error สำคัญแสดงข้อความเข้าใจง่าย | `Partial` | `ApiError` และ `toUserMessage()` map error หลักสำหรับ auth แล้ว | ขยาย mapping ตาม error code จริงของทุก feature |
| 22 | Loading, empty และ error states ครบในหน้าหลัก | `Todo` | ยังไม่พบ route-level states หรือ feature states จริง | เพิ่ม loading/error/empty states ต่อ route/feature |
| 23 | Desktop layout ใช้งานสะดวก | `Partial` | มี app shell components แต่ยังว่าง | เติม sidebar/topbar/content layout จริงและตรวจ responsive |
| 24 | Mobile layout ไม่ทับซ้อนและ action หลักกดได้ | `Partial` | มี `MobileNav` แต่ยังว่าง | เติม mobile nav และทดสอบ viewport |
| 25 | `npm run lint` ผ่าน | `Done` | รันล่าสุดผ่านหลัง implement login integration | รันซ้ำก่อน merge/ส่งมอบครั้งถัดไป |
| 26 | `npm run build` ผ่าน | `Done` | รันล่าสุดผ่านหลังใช้ Next.js 16 `proxy` และ font fallback | รันซ้ำเมื่อเพิ่ม feature ใหม่ |

## 19. ความเสี่ยงและวิธีลดความเสี่ยง

| ความเสี่ยง | ผลกระทบ | วิธีลดความเสี่ยง |
| --- | --- | --- |
| Backend endpoint ยังไม่ตรงกับ plan | Frontend API wrapper ต้องแก้หลายจุด | รวม path ไว้ใน feature API wrappers เท่านั้น |
| DTO เปลี่ยนระหว่าง implement | Type และ component แตก | สร้าง DTO types ชัดเจนและแยก mapper ถ้าจำเป็น |
| Transaction form ซับซ้อน | UX สับสนและ validate ยาก | แยก field ตาม transaction type และใช้ schema ต่อ type |
| Delivery stock timing เข้าใจผิด | Dashboard/stock แสดงผิด | ยึด backend ว่าตัด stock ตอน `COMPLETED` เท่านั้น |
| Loan partial return data ไม่พอ | Return dialog คำนวณ remaining ไม่ได้ | ให้ backend ส่ง remaining quantity หรือ returned summary |
| Table บน mobile ใช้งานยาก | Admin ใช้งานหน้างานลำบาก | ใช้ responsive table/card-row สำหรับจอเล็กเฉพาะ list สำคัญ |
| Error จาก backend ไม่ชัด | ผู้ใช้ไม่รู้ต้องแก้อะไร | map error code เป็น Thai copy และโชว์ requestId เมื่อจำเป็น |

## 20. รายการที่ไม่อยู่ใน MVP

รายการต่อไปนี้ยังไม่ควร block MVP:

1. Customer master แบบเต็ม
2. Payment tracking/payment gateway
3. Rider mobile workflow
4. Accountant report
5. Multi-branch
6. Receipt/print view
7. Advanced analytics
8. OpenAPI type generation
