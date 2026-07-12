# KMG-SERVICE-WEB

`KMG-SERVICE-WEB` คือ Next.js frontend สำหรับระบบจัดการร้านแก๊ส `KMG-SERVICE`

โปรเจกต์นี้ใช้สำหรับหน้าจอ Admin ใน MVP เช่น Dashboard, Products, Transactions, Queues, Loans และ Inventory

## เริ่มต้นใช้งาน

รัน development server:

```bash
npm run dev
```

หรือใช้ package manager อื่นถ้าจำเป็น:

```bash
yarn dev
pnpm dev
bun dev
```

เปิด [http://localhost:3000](http://localhost:3000) ใน browser เพื่อดูผลลัพธ์

## คำสั่งหลัก

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

สร้าง production build และตรวจ route/type compilation ของ Next.js

```bash
npm run start
```

เริ่ม production server หลัง build สำเร็จ

## เอกสารที่ควรอ่านก่อนแก้ Code

ก่อนแก้ frontend code ให้อ่าน:

1. `../Context.md`
2. `../Business-Flow.md`
3. `../Frontend-Architecture.md`
4. `./Frontend-Implement-Plan.md`
5. `./AGENTS.md`

ถ้างานแตะ business rules เช่น transactions, queues, loans, inventory, status changes หรือ snapshots ให้อ่าน `../Database-Design.md` เพิ่มด้วย

## เอกสาร Next.js

โปรเจกต์ใช้ Next.js App Router และเวอร์ชันใน repo อาจมี API/convention ต่างจากความรู้ทั่วไป ก่อนใช้ API ใหม่ให้อ่านเอกสารใน `node_modules/next/dist/docs/` หรือเอกสารทางการของ Next.js
