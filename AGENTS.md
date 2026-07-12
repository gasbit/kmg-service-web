<!-- BEGIN:nextjs-agent-rules -->
# Next.js เวอร์ชันนี้ไม่ใช่ Next.js แบบที่คุ้นเคย

เวอร์ชันนี้มี breaking changes หลายจุด ทั้ง API, convention และโครงสร้างไฟล์อาจต่างจากข้อมูลเดิมที่ Codex รู้มา ก่อนเขียน code ต้องอ่าน guide ที่เกี่ยวข้องใน `node_modules/next/dist/docs/` และต้องสนใจ deprecation notice เสมอ
<!-- END:nextjs-agent-rules -->

# KMG Service Web Agent Guide

## 1. ภาพรวมโปรเจกต์

`KMG-SERVICE-WEB` คือ frontend application ของระบบ `KMG-SERVICE` สำหรับจัดการร้านแก๊สให้เจ้าของร้านและ Admin

Frontend เริ่มจาก MVP ที่เน้น `Admin` เป็นหลัก และต้องเตรียมโครงสร้างให้รองรับ role ในอนาคต เช่น `Staff`, `Rider` และ `Accountant` ระบบนี้ช่วย Admin ทำงานประจำวัน เช่น ดู dashboard, จัดการสินค้า, ทำรายการ, จัดการคิวส่งแก๊ส, ติดตามการยืมถัง, ตรวจ stock และดูประวัติรายการ

โปรเจกต์นี้เป็น frontend-only ส่วน business rules, transaction boundaries, stock movements, authentication authority, authorization authority, audit logs และ data persistence เป็นความรับผิดชอบของ backend

## 2. ภาพรวมสถาปัตยกรรม

แอปใช้ Next.js App Router และจัดโครงสร้างแบบ feature-oriented architecture

หลักการสำคัญ:

- ใช้ Server Components สำหรับหน้าที่เน้นอ่านข้อมูล เช่น dashboard, product list, transaction history, inventory, queue และ loan views
- ใช้ Client Components เฉพาะ UI ที่ต้อง interactive เช่น forms, filters, dialogs, table actions และ status controls
- ห้ามให้ access token อยู่ใน browser JavaScript ถ้ามี auth ให้ใช้ httpOnly cookies ผ่าน route handlers หรือ server actions
- รวมการสื่อสารกับ backend ไว้ที่ `src/lib/api`
- เก็บ UI, types, schemas และ API wrappers เฉพาะ domain ไว้ใน `src/features/<domain>`
- เก็บ reusable shell และ UI primitives ไว้ใน `src/components`
- ออกแบบหน้าจอให้เป็น operational tools สำหรับใช้งานซ้ำทุกวัน ไม่ใช่ marketing pages

Domain modules ปัจจุบัน:

- `auth`
- `dashboard`
- `products`
- `transactions`
- `queues`
- `loans`
- `inventory`

## 3. โครงสร้างโปรเจกต์

```text
KMG-SERVICE-WEB/
  src/
    app/
      (auth)/
        login/
          page.tsx
      (app)/
        layout.tsx
        page.tsx
        dashboard/
        products/
        transactions/
        queues/
        loans/
        inventory/
      api/
        auth/
          login/
          logout/
      globals.css
    components/
      app-shell/
      icon/
      ui/
    features/
      auth/
      dashboard/
      products/
      transactions/
      queues/
      loans/
      inventory/
    lib/
      api/
      auth/
      constants/
      format/
      hooks/
      utils/
    middleware.ts
```

Route groups:

- `(auth)` เก็บ public authentication routes
- `(app)` เก็บ authenticated application routes และ shared app layout
- `api/auth/*` เก็บ frontend route-handler entry points สำหรับ auth flows

Convention ของ feature module:

- `*.api.ts` สำหรับ feature API wrappers
- `*.types.ts` สำหรับ feature types
- `*.schema.ts` สำหรับ validation schemas เมื่อจำเป็น
- UI files ที่เป็น domain-specific ให้อยู่ใกล้ feature ของตัวเอง

## 4. มาตรฐานการเขียน Code

- ใช้ TypeScript สำหรับ application code ทั้งหมด
- ใช้ named exports สำหรับ shared components, utilities และ feature modules
- ใช้ Server Components เป็นค่าเริ่มต้น เพิ่ม `"use client"` เฉพาะเมื่อจำเป็นต้องใช้ browser state, event handlers, effects หรือ client-only hooks
- ทำ UI components ให้เล็กและ composable
- เก็บ reusable primitives ที่ไม่ผูก domain ไว้ใต้ `src/components/ui`
- HTML primitives ที่ใช้ซ้ำ เช่น buttons, inputs, checkboxes, selects, cards, card content, text labels, tables และ dialogs ต้องเป็น shared components ใต้ `src/components/ui/`; pages และ feature components ควร import primitives เหล่านี้แทนการ style raw tags ซ้ำเอง
- เก็บ reusable icons ไว้ใต้ `src/components/icon/`; ถ้าต้องเพิ่ม icon ใหม่ ให้เพิ่ม component ที่นั่นและ import มาใช้ แทนการฝัง inline SVG ใน page หรือ feature component
- เก็บ feature-specific components ไว้ใน `src/features/<domain>`
- ก่อนสร้างหน้าจอใด ๆ ต้องตรวจ shared components ที่มีอยู่ก่อน:
  - `src/components/ui/` สำหรับ shared UI primitives เช่น `Button`, `Input`, `Checkbox`, `Card`, `CardContent`, `TextLabel`, `Select`, `Table`, `Dialog` และ `Toast`
  - `src/components/icon/` สำหรับ shared icon components
  - `src/components/app-shell/` สำหรับ navigation และ application layout pieces
- หน้าจอใหม่ต้อง compose จาก shared components ถ้ามี component ที่เหมาะสมอยู่แล้ว ห้ามสร้าง one-off buttons, inputs, cards, text labels, icons, dialogs, tables หรือ repeated screen chrome ใน page หรือ feature component โดยไม่จำเป็น
- ถ้าหน้าจอใหม่ต้องใช้ reusable UI pattern ที่ยังไม่มี ให้สร้างหรือขยาย domain-neutral shared component ใต้ `src/components/ui/` หรือ `src/components/icon/` ก่อน แล้วค่อยนำไปใช้จากหน้าจอ
- Keep page files focused on route composition and data boundaries; reusable presentation patterns ให้อยู่ใน shared components และ domain-specific workflow UI ให้อยู่ใน `src/features/<domain>`
- ใช้ import alias `@/*` สำหรับ imports จาก `src`
- ใช้ Tailwind CSS และ CSS variables สำหรับ styling
- ห้ามใส่ source-of-truth business logic ใน frontend
- ห้าม duplicate backend validation หรือ status-transition authority ใน frontend; frontend validation ควรมีไว้เพื่อช่วยผู้ใช้และป้องกัน error เบื้องต้นเท่านั้น
- เลือกชื่อที่ชัดเจนมากกว่า abstraction กว้าง ๆ
- ห้ามเพิ่ม dependency ใหม่ เว้นแต่จำเป็นกับงานและเข้ากับ frontend architecture ชัดเจน

## 5. Workflow การพัฒนา

### เอกสารที่ต้องอ่านก่อนแก้ Code

ก่อนแก้ frontend code ต้องอ่านเอกสารและ source files ที่เกี่ยวข้องก่อนเสมอ

ลำดับเอกสารที่ต้องอ่าน:

1. `../Context.md`
2. `../Business-Flow.md`
3. `../Frontend-Architecture.md`
4. `./Frontend-Implement-Plan.md`
5. `../Database-Design.md` เมื่อการแก้ไขแตะ products, transactions, queues, loans, inventory, users, roles, snapshots, status changes หรือ business rules อื่น ๆ
6. Existing source files ใน target route, feature folder, shared UI layer, API wrapper, auth helper หรือ app shell ที่จะถูกแก้ไข

Codex ห้ามแก้ frontend code จนกว่าจะ inspect ไฟล์ที่เกี่ยวข้องและสรุปสิ่งที่เรียนรู้แล้ว

ขั้นตอนทั่วไป:

1. อ่าน architecture/context document ที่เกี่ยวข้องก่อนทำ structural changes
2. ตรวจ shared components ใต้ `src/components/ui/`, `src/components/icon/` และ `src/components/app-shell/` ก่อนสร้างหรือ style UI สำหรับหน้าจอ
3. ระบุ owning route, feature module หรือ shared layer ก่อนแก้ไฟล์
4. จำกัด scope การเปลี่ยนแปลงให้อยู่ใน domain ที่ผู้ใช้ขอ
5. เพิ่มหรืออัปเดต types ใกล้ feature ที่เป็นเจ้าของ data shape
6. วาง cross-cutting helpers ไว้ใน `src/lib` เฉพาะเมื่อหลาย feature ต้องใช้จริง
7. Run lint ก่อนจบงาน
8. Run build เมื่อแก้ route structure, server/client boundaries, middleware, config หรือ shared imports
9. ไม่แตะไฟล์อื่นและ user changes ที่ไม่เกี่ยวข้อง

สำหรับหน้าใหม่:

- เพิ่ม route ใต้ `src/app`
- เพิ่ม domain-specific UI ใต้ `src/features/<domain>`
- ใช้ shared components จาก `src/components/ui/`, `src/components/icon/` และ `src/components/app-shell/` ก่อนเพิ่ม page-local markup
- ถ้ามี UI pattern ที่ใช้ซ้ำ ให้ promote เป็น shared component ก่อน เพื่อให้ทุกหน้าใช้ behavior, spacing, states และ visual style เดียวกัน
- ใช้ Server Components เป็นค่าเริ่มต้น
- ย้ายส่วนที่ interactive ไปเป็น Client Components ขนาดเล็ก

สำหรับ backend integration ใหม่:

- เพิ่ม shared response/error handling ใต้ `src/lib/api`
- เพิ่ม feature-specific wrapper functions ใต้ `src/features/<domain>/*.api.ts`
- เก็บ auth/session concerns ไว้ใต้ `src/lib/auth` หรือ `src/features/auth`

## 6. Commands

รันคำสั่งจาก `KMG-SERVICE-WEB`

```bash
npm run dev
```

เริ่ม local development server

```bash
npm run lint
```

รัน ESLint

```bash
npm run build
```

สร้าง production build และตรวจ Next.js route/type compilation

```bash
npm run start
```

เริ่ม production server หลัง build สำเร็จ

## 7. กฎความปลอดภัย (Safety Rules)

- ห้าม implement backend-owned business workflows ใน frontend
- ห้ามเก็บ JWT access tokens ใน `localStorage`, `sessionStorage` หรือ client-readable cookies
- ห้ามทำให้ frontend เป็น source of truth ของ stock, loans, queues, pricing snapshots หรือ transaction status transitions
- ห้าม bypass backend authorization ด้วย frontend-only checks
- ห้าม hard-delete data จาก frontend flows เว้นแต่ backend รองรับ operation นั้นอย่างชัดเจน
- ห้ามทำ broad refactors ระหว่างแก้ feature แคบ ๆ
- ห้ามแก้ generated folders เช่น `.next` หรือ `node_modules`
- ห้าม commit secrets, credentials, local environment files หรือ production data
- ห้ามรัน destructive git commands เว้นแต่ผู้ใช้สั่งชัดเจน

## 8. ความรู้ Domain (Domain Knowledge)

`KMG-SERVICE` จัดการงานประจำวันของร้านแก๊ส

ผู้ใช้หลัก:

- `Admin`: เจ้าของร้านหรือผู้ดูแลร้าน ใช้งานได้ทุกฟังก์ชันใน MVP

Role ในอนาคต:

- `Staff`: พนักงานร้านที่มีสิทธิ์จำกัด
- `Rider`: พนักงานส่งแก๊สที่ดู queue และอัปเดต delivery progress
- `Accountant`: role สำหรับการเงินและรายงาน

Domain หลัก:

- Product Management: catalog สินค้าแก๊ส, brand, weight, exchange cost, selling price, full tank price และ active status
- Transaction Management: สร้างและติดตาม operations ของลูกค้า
- Queue Management: delivery queue สำหรับ delivery exchange transactions
- Cylinder Loan Management: ติดตามถังที่ถูกยืม, expected return, actual return, deposit และ loan status
- Inventory Management: ติดตามถังเต็ม, ถังเปล่า, ถังที่ถูกยืม และ movement history
- Dashboard: สรุปงานประจำวัน เช่น pending work, queue, sales, loans และ stock

ประเภท Transaction:

- `DELIVERY_EXCHANGE`: ลูกค้าสั่งส่งแก๊สและแลกถัง
- `WALK_IN_EXCHANGE`: ลูกค้าแลกถังที่หน้าร้าน
- `BORROW_CYLINDER`: ลูกค้ายืมถัง
- `RETURN_CYLINDER`: ลูกค้าคืนถังที่ยืม
- `BUY_FULL_TANK`: ลูกค้าซื้อถังเต็มหรือถังใหม่

สถานะ Transaction:

- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

ขอบเขตสำคัญ:

Frontend ช่วย guide ผู้ใช้และป้องกัน action ที่ผิดชัดเจนใน UI ได้ แต่ backend ต้องเป็น final authority สำหรับ authentication, authorization, transaction validity, inventory movement, status changes และ audit history เสมอ
