# KMG-SERVICE-WEB Context

เอกสารนี้สรุป context สำคัญของ `KMG-SERVICE-WEB` จากเอกสารหลักของระบบ ได้แก่ `Context.md`, `Frontend-Architecture.md`, `Backend-Architecture.md`, `Database-Design.md` และ `Planning.md`

## 1. ภาพรวมของระบบ

`KMG-SERVICE` คือระบบจัดการร้านแก๊สสำหรับเจ้าของร้าน โดยเริ่มจาก MVP สำหรับ `Admin` เป็นหลัก และออกแบบให้รองรับบทบาทอื่นในอนาคต เช่น `Staff`, `Rider` และ `Accountant`

เป้าหมายของระบบคือช่วย Admin จัดการงานประจำวันของร้านแก๊ส ได้แก่:

- จัดการสินค้าแก๊ส
- ทำรายการสั่งส่งแก๊ส
- ทำรายการแลกถังหน้าร้าน
- ทำรายการยืมถัง
- ทำรายการคืนถัง
- จัดการคิวส่งแก๊ส
- ดูประวัติรายการย้อนหลัง
- ดู dashboard สรุปสถานะประจำวัน
- ตรวจสอบ stock ถังเต็ม ถังเปล่า และถังที่ถูกยืม

ระบบแบ่งเป็น 2 ส่วนหลัก:

- `KMG-SERVICE-WEB`: Next.js frontend สำหรับ Admin และผู้ใช้งานระบบ
- `KMG-SERVICE-API`: Express backend ที่เป็นเจ้าของ business workflow, validation authority, transaction boundary และ database persistence

Frontend ต้องทำหน้าที่เป็น operational dashboard ที่ใช้งานซ้ำทุกวันได้เร็ว อ่านง่าย และเน้น action/table มากกว่าหน้า marketing

## 2. Business Logic

Business logic หลักเป็นความรับผิดชอบของ backend แต่ frontend ต้องเข้าใจ domain เพื่อแสดงผล สร้าง form และ guide ผู้ใช้ได้ถูกต้อง

### Roles

ปัจจุบัน:

- `Admin`: เจ้าของร้าน ใช้งานได้ทุกฟังก์ชันของ MVP

อนาคต:

- `Staff`: พนักงานร้าน ใช้งานเฉพาะฟังก์ชันที่ได้รับอนุญาต
- `Rider`: พนักงานส่งแก๊ส ดูคิวและอัปเดตสถานะจัดส่ง
- `Accountant`: ดูรายงานยอดขาย ต้นทุน และกำไร

### Product Management

สินค้าแก๊สแยกตามยี่ห้อและน้ำหนัก เช่น ปตท. 15kg หรือแก๊ส 48kg

ข้อมูลสำคัญของสินค้า:

- ยี่ห้อ
- น้ำหนัก
- ราคาแลกเปลี่ยนทุน
- ราคาแลกเปลี่ยนขาย
- ราคาถังเต็มหรือราคาซื้อถังใหม่
- สถานะใช้งาน

ข้อสำคัญ:

- การลบสินค้าต้องเป็น soft delete ด้วย `is_active`
- สินค้าที่ inactive ไม่ควรถูกเลือกในรายการใหม่
- ประวัติรายการเก่าต้องยังแสดงข้อมูลสินค้าเดิมได้ผ่าน snapshot

### Transaction Management

Transaction คือแกนหลักของระบบ ร้านแก๊สหนึ่งรายการสามารถมีสินค้าหลายรายการได้

ประเภท transaction:

| Type | ความหมาย |
| --- | --- |
| `DELIVERY_EXCHANGE` | ลูกค้าสั่งส่งแก๊สเพื่อแลกถัง |
| `WALK_IN_EXCHANGE` | ลูกค้ามาแลกถังหน้าร้าน |
| `BORROW_CYLINDER` | ลูกค้ายืมถัง |
| `RETURN_CYLINDER` | ลูกค้านำถังที่ยืมมาคืน |
| `BUY_FULL_TANK` | ลูกค้าซื้อถังเต็มหรือซื้อถังใหม่ |

กติกาสำคัญ:

- Transaction ต้องเก็บ snapshot ข้อมูลลูกค้า ณ เวลาทำรายการ
- Transaction item ต้องเก็บ snapshot สินค้า ราคา และต้นทุน ณ เวลาทำรายการ
- ทุกการเปลี่ยนสถานะต้องบันทึก `transaction_status_logs`
- การสร้างหรือเปลี่ยน transaction ที่กระทบ stock ต้องสร้าง `inventory_movements`
- Backend ต้องทำ workflow สำคัญใน DB transaction เดียวเพื่อให้ atomic

### Queue Management

รายการ `DELIVERY_EXCHANGE` ต้องมีคิวประจำวันเพื่อให้ Admin เห็นลำดับงานส่งแก๊ส

กติกาสำคัญ:

- Queue ใช้ข้อมูล `queue_date` และ `queue_no` บน transaction
- `queue_no` ต้องกันเลขชนกันผ่าน transaction/unique index ฝั่ง database
- รายการ delivery ควรตัด stock ตอนเปลี่ยนเป็น `COMPLETED` ไม่ใช่ตอนสร้างรายการ เพราะอาจถูกยกเลิกก่อนส่งจริง

### Status Flow

สถานะ transaction:

- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

Flow หลัก:

- `PENDING -> IN_PROGRESS`
- `PENDING -> CANCELLED`
- `IN_PROGRESS -> COMPLETED`
- `IN_PROGRESS -> CANCELLED`

ข้อสำคัญ:

- `COMPLETED` และ `CANCELLED` เป็น final state
- เมื่อเปลี่ยนเป็น `COMPLETED` ต้อง set `completed_at`
- ทุก status change ต้องมี status log

### Cylinder Loan Management

ใช้ติดตามลูกค้าที่ยืมถัง

ข้อมูลสำคัญ:

- ชื่อลูกค้า
- เบอร์โทร
- ที่อยู่
- สินค้าและจำนวนถังที่ยืม
- วันที่ยืม
- วันที่คาดว่าจะคืน
- วันที่คืนจริง
- เงินมัดจำ ถ้ามี
- สถานะการยืม

กติกาสำคัญ:

- การยืมถังมาจาก transaction type `BORROW_CYLINDER`
- การคืนถังควรผ่าน transaction type `RETURN_CYLINDER`
- รองรับการคืนบางส่วน
- การคืนต้องอัปเดต loan, inventory movement และ transaction history ให้ครบ

### Inventory Management

Inventory แยกยอดเป็น:

- `full_qty`: ถังเต็ม
- `empty_qty`: ถังเปล่า
- `loaned_qty`: ถังที่ถูกยืม

Movement หลัก:

| Movement | ผลต่อยอด |
| --- | --- |
| `FULL_OUT` | `full_qty -= quantity` |
| `EMPTY_IN` | `empty_qty += quantity` |
| `LOAN_OUT` | `full_qty -= quantity`, `loaned_qty += quantity` |
| `LOAN_RETURN` | `loaned_qty -= quantity`, `empty_qty += quantity` |
| `ADJUSTMENT` | ปรับตาม payload และต้องมี note |

กติกาสำคัญ:

- ห้ามแก้ inventory balance โดยไม่มี movement ยกเว้น migration/seed เริ่มต้น
- ต้อง validate ไม่ให้ stock ติดลบ เว้นแต่มี config อนุญาตในอนาคต

### Dashboard

Dashboard เป็นหน้าแรกหลัง login และควรช่วย Admin เห็นงานวันนี้ทันที

ข้อมูลที่ควรแสดง:

- รายการวันนี้
- จำนวนรายการตามสถานะ
- คิวส่งแก๊สที่ต้องดำเนินการ
- ยอดขายวันนี้
- ราคาแลกเปลี่ยนแก๊สแยกตามสินค้า
- รายการยืมถังค้าง
- Stock คงเหลือ

Dashboard service ฝั่ง backend ควรเป็น read-only aggregation และไม่ควรมี mutation

## 3. ข้อจำกัด

### Frontend Boundary

Frontend ไม่ใช่ source of truth ของ business workflow

Frontend ทำได้:

- แสดงข้อมูลให้ Admin ตัดสินใจเร็ว
- Validate input เบื้องต้นเพื่อช่วย UX
- Disable หรือซ่อน action ที่เห็นได้ชัดว่าทำไม่ได้
- แสดง loading, error และ optimistic UI อย่างระมัดระวัง
- แปลง backend error code เป็นข้อความที่ผู้ใช้เข้าใจ

Frontend ห้ามทำ:

- ตัด stock เองโดยไม่มี backend
- สร้าง queue number เองแบบเป็น source of truth
- สรุปสถานะ loan เองแบบ authoritative
- ตัดสิน transaction status transition เองแทน backend
- เก็บ JWT access token ใน `localStorage`, `sessionStorage` หรือ client-readable cookie
- bypass authorization ด้วย frontend-only guard

### Backend Authority

Backend เป็นเจ้าของ:

- Authentication และ role authorization จริง
- Business rules และ status transition
- DB transaction boundary
- Inventory movement และ balance
- Snapshot data
- Audit/status logs
- Error response contract

### MVP Scope

อยู่ใน scope:

- Admin login
- Product management
- Delivery exchange
- Walk-in exchange
- Borrow cylinder
- Return cylinder
- Queue management
- Transaction history
- Daily dashboard
- Active loan dashboard
- Basic stock movement

ไม่อยู่ใน scope MVP:

- Customer self-registration
- Payment gateway
- GPS หรือ route planning
- LINE/SMS notification
- Full accounting system
- Separate mobile app
- Multi-branch

### Data Integrity Constraints

- ข้อมูลสำคัญควรใช้ soft delete
- Transaction ต้องมี snapshot ของลูกค้าและสินค้า
- Queue number ต้องกันชนกัน
- Inventory update ต้องกัน stock ติดลบ
- ทุก status change ต้องมี log
- Repository ไม่ควรคุม transaction boundary เอง

### Frontend Runtime Notes

- Project ใช้ Next.js `16.2.9` ซึ่งมี breaking changes และ deprecation ใหม่
- `middleware.ts` ยังมีใน architecture เดิม แต่ Next.js 16 เตือนว่า file convention นี้ deprecated และแนะนำ `proxy.ts`
- ก่อนใช้ API หรือ convention ใหม่ของ Next.js ควรอ่านเอกสารใน `node_modules/next/dist/docs/`

## 4. Technology

### Current Frontend Stack

จาก `KMG-SERVICE-WEB/package.json`:

- Next.js `16.2.9`
- React `19.2.4`
- React DOM `19.2.4`
- TypeScript
- Tailwind CSS `4`
- ESLint `9`
- eslint-config-next `16.2.9`

Frontend architecture:

- Next.js App Router
- Route groups: `(auth)` และ `(app)`
- TypeScript strict mode
- `@/*` import alias ไปที่ `src/*`
- Server Components เป็น default
- Client Components เฉพาะส่วน interactive
- Feature-oriented folder structure

Recommended frontend tools from architecture:

- UI components: shadcn/ui หรือ local component system ที่ต่อยอดจาก Radix UI
- Icons: lucide-react
- Forms: React Hook Form
- Validation: Zod
- Interactive server state: TanStack Query เฉพาะจุดที่จำเป็น
- Tables: TanStack Table
- Dates: date-fns
- Charts: Recharts
- Testing: Vitest, React Testing Library, Playwright
- Formatting: Prettier

### Backend Recommended Stack

จาก backend architecture:

- Runtime: Node.js LTS
- Framework: Express
- Language: TypeScript
- Database: PostgreSQL แนะนำ ถ้าเริ่มใหม่
- ORM/query: Prisma แนะนำเพื่อความเร็วและ type safety
- Validation: Zod
- Auth: JWT access token + bcrypt password hash
- Logging: Pino
- Testing: Vitest/Jest + Supertest
- API docs: OpenAPI/Swagger

Backend architecture:

- Modular Monolith
- Layered structure: Route, Controller, Service, Repository
- Versioned API path: `/api/v1`
- Standard response format `{ success, data, meta }` และ `{ success, error, meta }`

### API Integration Expectations

Environment concept:

```text
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_BASE_URL=http://localhost:4000/api/v1
```

Frontend should:

- Call backend through server-side API client, server actions, or route handlers when auth token is required
- Read token from httpOnly cookie on the server
- Attach `Authorization: Bearer <token>` server-side only
- Normalize success/error responses through `src/lib/api`
- Revalidate relevant paths after mutations

Important routes:

- Frontend login page: `/login`
- Frontend dashboard: `/dashboard`
- Frontend auth route handlers: `/api/auth/login`, `/api/auth/logout`
- Backend auth API: `/api/v1/auth/login`, `/api/v1/auth/me`
- Backend dashboard API: `/api/v1/dashboard/today`

### Development Commands

Run from `KMG-SERVICE-WEB`.

```bash
npm run dev
```

```bash
npm run lint
```

```bash
npm run build
```

```bash
npm run start
```
