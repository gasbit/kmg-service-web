# Authentication Screen Specification

## 1. Document status

- Status: Draft — ready for product and engineering review
- Owner: `src/features/auth`
- Last updated: 2026-07-11
- Related routes: `/login`, authenticated application routes, `/api/auth/login`, `/api/auth/logout`
- Related backend contract: `KMG-SERVICE-API/src/modules/auth/authentication-spec.md`

## 2. Summary

- Purpose: ให้ผู้ดูแลร้านยืนยันตัวตน เข้าใช้งานพื้นที่ภายในระบบ รักษา session ระหว่างการนำทาง และออกจากระบบได้อย่างปลอดภัย
- User outcome: ผู้ใช้ที่มีบัญชีและ role ที่ active สามารถเข้าสู่ Dashboard ได้ ส่วนผู้ใช้ที่ไม่มี session หรือ session ใช้งานไม่ได้ต้องกลับไปเข้าสู่ระบบ
- Public route: `/login`
- Authenticated destination: `/dashboard`
- Owning feature: `src/features/auth`
- Allowed roles: บัญชีและ role ที่ active ทุก role ตาม backend contract; MVP ใช้งานจริงกับ `ADMIN` เป็นหลัก
- Authority: backend เป็นผู้ตัดสิน credential, สถานะ user/role และความถูกต้องของ JWT; frontend ทำเพียง validation เบื้องต้น จัดเก็บ token ผ่าน httpOnly cookie และนำทางตามผลลัพธ์

## 3. Scope

### In scope

- หน้าจอเข้าสู่ระบบด้วย username และ password
- การแสดง/ซ่อนรหัสผ่าน
- client-side validation สำหรับช่องว่าง และการแสดง error จาก frontend route handler/backend
- pending state และการป้องกันการ submit ซ้ำ
- การส่ง credential ผ่าน frontend route handler โดยไม่เปิดเผย access token แก่ browser JavaScript
- การตั้ง อ่าน และลบ auth cookie ฝั่ง server
- การ redirect ระหว่าง `/login`, `/dashboard` และ authenticated application routes
- การโหลด current user สำหรับ app shell
- การออกจากระบบและกลับไป `/login`
- responsive และ accessibility behavior ของหน้า Login

### Out of scope

- สมัครบัญชี
- ลืมรหัสผ่านและ reset password
- refresh token และ token rotation
- server-side token revocation หรือ logout endpoint ที่ backend
- multi-factor authentication
- user management และการกำหนด permission รายบุคคล
- permission matrix สำหรับ `Staff`, `Rider` และ `Accountant`
- การนำผู้ใช้กลับไปยัง URL เดิมหลัง login

## 4. Sources and decisions

### Confirmed sources

- `../Context.md`: ระบบมี Login สำหรับ Admin และต้องเตรียมรองรับ role อื่นในอนาคต
- `../Frontend-Architecture.md`: access token ต้องอยู่ใน httpOnly cookie, login สำเร็จไป Dashboard และ app routes ต้องมี auth gate
- `Frontend-Implement-Plan.md`: auth foundation ถูก implement แล้วแต่ยังไม่ได้ browser E2E ครบ
- `src/app/(auth)/login/page.tsx`: layout, branding และข้อความของหน้า Login ปัจจุบัน
- `src/features/auth/login-form.tsx`: form interaction, pending state, password visibility และ error rendering ปัจจุบัน
- `src/app/api/auth/login/route.ts`: frontend login boundary และ cookie creation
- `src/features/auth/actions.ts`: logout server action และ redirect
- `src/proxy.ts`: cookie-presence route gate ตาม Next.js 16 `proxy` convention
- `KMG-SERVICE-API/src/modules/auth/authentication-spec.md` และ auth source: backend login/current-user contract และ error behavior
- Next.js bundled docs: `proxy.ts` เป็น convention ปัจจุบันแทน `middleware.ts`; `cookies()` เป็น async และการ set/delete cookie ต้องเกิดใน Route Handler หรือ Server Function

### Confirmed decisions

- ใช้ cookie ชื่อ `kmg_session`
- cookie มี `httpOnly: true`, `sameSite: "lax"`, `path: "/"`, `secure: true` เฉพาะ production และ max age ปัจจุบัน 24 ชั่วโมง
- browser submit ไปที่ frontend `POST /api/auth/login`; frontend เป็นผู้เรียก backend และตั้ง cookie
- browser JavaScript ต้องไม่สามารถอ่าน access token ได้
- login สำเร็จใช้ replace navigation ไป `/dashboard`
- logout ปัจจุบันลบ cookie ผ่าน Server Action และ redirect ไป `/login`
- Proxy ใช้การมีอยู่ของ cookie เป็น optimistic route gate เท่านั้น; backend `/auth/me` และ business endpoints ยังคงเป็น authority ของ session/authorization
- backend base URL ปัจจุบันคือ `http://localhost:4000/api` และ auth endpoints คือ `/auth/login` กับ `/auth/me`
- frontend ใช้ backend DTO ตาม contract: `accessToken`, `tokenType`, `expiresIn`, nested `user.role` และ current-user wrapper `{ user }`
- เมื่อ `/auth/me` คืน `UNAUTHORIZED`, authenticated layout redirect ไป `/api/auth/session/clear`; Route Handler ลบ httpOnly cookie แล้ว redirect `/login`
- error อื่นจาก `/auth/me` ต้องถูก throw ไปยัง error boundary และต้องไม่ลบ valid session โดยอัตโนมัติ

### Assumptions

- หน้า Login ใช้ภาษาไทยและ branding “ร้านขวัญเมืองแก๊ส” ตาม implementation ปัจจุบัน
- ไม่แสดงรายละเอียดว่า username ไม่มีอยู่, password ผิด, user inactive หรือ role inactive โดยแสดงข้อความทั่วไปเหมือนกัน
- credential ต้องไม่ถูกบันทึกใน log, analytics, URL หรือ persistent client storage
- protected API consumers อื่นควรใช้ invalid-session cleanup เดียวกันเมื่อได้รับ `UNAUTHORIZED`

### Open decisions and conflicts

1. **Major — cookie lifetime:** frontend fix max age ที่ 24 ชั่วโมง ขณะที่ backend คืน `expiresIn` จาก config; ต้องกำหนดวิธีทำให้อายุ cookie ไม่ยาวกว่า JWT
2. **Major — protected API cleanup:** authenticated layout รองรับ invalid-session cleanup แล้ว แต่ protected calls จาก Route Handler/Server Action อื่นยังต้องใช้ flow กลางเดียวกัน
3. **Major — Remember me:** UI ถูก comment ไว้จนกว่า backend จะรองรับ session policy ที่เกี่ยวข้อง
4. **Major — Forgot password:** UI ถูก comment ไว้เพราะ backend ระบุว่า forgot/reset password อยู่นอก MVP
5. **Minor — username normalization:** form trim username แต่ backend contract ระบุว่าไม่ควร trim หรือเปลี่ยน case โดยไม่มี business rule ต้องตัดสินให้ตรงกัน
6. **Minor — field errors:** inputs ใช้ placeholder แต่ไม่มี visible/programmatic label และ error เป็น form-level โดยไม่ผูกกับ field
7. **Minor — copyright year:** หน้าแสดงปี 2024 แบบคงที่ ต้องยืนยันว่าเป็นข้อความ branding ที่ตั้งใจหรือควรแสดงปีปัจจุบัน

## 5. Navigation and workflow

### Entry points

- ผู้ใช้ที่ไม่มี `kmg_session` เปิด authenticated application route แล้ว Proxy redirect ไป `/login`
- ผู้ใช้เปิด `/login` โดยตรง
- ผู้ใช้ logout จาก TopBar แล้วถูก redirect ไป `/login`
- ผู้ใช้ถูกนำกลับ `/login` หลัง backend ปฏิเสธ session เมื่อ invalid-session cleanup ถูก implement

### Exit paths

- Login สำเร็จ: replace ไป `/dashboard` และ refresh Server Component data
- Logout สำเร็จ: redirect ไป `/login`
- Login ไม่สำเร็จ: คงอยู่ `/login`, เก็บ username ไว้, ไม่ล้าง password โดยอัตโนมัติใน implementation ปัจจุบัน และแสดงข้อความผิดพลาด

### Primary login workflow

1. ผู้ใช้เปิด `/login`
2. Proxy ตรวจ cookie; ถ้ามี cookie จะ redirect ไป `/dashboard` โดยยังไม่ validate JWT
3. ผู้ใช้กรอก username และ password
4. ผู้ใช้กด “เข้าสู่ระบบ” หรือ submit form ด้วย Enter
5. frontend ตรวจว่าทั้งสองช่องไม่ว่าง
6. form ส่ง JSON `{ username, password }` ไป `POST /api/auth/login`
7. frontend route handler validate payload แล้วส่ง credential ไป backend login endpoint
8. backend ตรวจ schema, credential, user active และ role active
9. เมื่อสำเร็จ frontend route handler ตั้ง JWT ใน httpOnly cookie และคืน public user summary โดยไม่คืน token ให้ client
10. client replace ไป `/dashboard` และ refresh
11. authenticated layout เรียก current-user endpoint ด้วย Bearer token ที่อ่านจาก cookie ฝั่ง server

### Alternate and failure paths

- ช่องใดช่องหนึ่งว่าง: ไม่เรียก API และแสดง “กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน”
- credential ไม่ถูกต้อง, user inactive หรือ role inactive: แสดง “ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง” โดยไม่เปิดเผยสาเหตุเฉพาะ
- backend validation ไม่ผ่าน: แสดง “ข้อมูลที่กรอกไม่ถูกต้อง” หรือ field-level message เมื่อมี adapter รองรับ
- เชื่อมต่อ frontend route handler ไม่ได้: แสดง “ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง”
- frontend ติดต่อ backend ไม่ได้: แสดงข้อความบริการไม่พร้อมใช้งานที่ไม่ควรเปิดเผย port/รายละเอียด infrastructure ใน production
- response malformed หรือ unknown error: แสดง “ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง” และแสดง request ID เมื่อมี
- token หมดอายุหรือ backend ปฏิเสธ session ใน authenticated layout: redirect ไป session-clear Route Handler เพื่อลบ cookie แล้วกลับ `/login`

## 6. Screen composition

| Region | Content | Existing shared component | Responsive behavior |
| --- | --- | --- | --- |
| Page shell | พื้นหลังและ container สองฝั่ง | page composition ใน `login/page.tsx` | Desktop เป็นสองคอลัมน์; mobile เรียง brand section เหนือ form |
| Brand panel | logo, “ปลอดภัย”, “เชื่อถือได้”, “รวดเร็ว” | `Image`, `ShieldLockIcon`, `ShieldCheckIcon`, `SpeedIcon`, `TextLabel` | ลดขนาด logo/icon/copy และลดความสูงบน mobile |
| Login card | eyebrow, ชื่อร้าน, subtitle, form และ copyright | `Card`, `CardContent`, `TextLabel` | เต็มความกว้างภายใน padding และลด radius/padding บน mobile |
| Username field | username input พร้อม user icon | `Input`, `UserIcon` | เต็มความกว้าง |
| Password field | password input และปุ่มแสดง/ซ่อน | `Input`, `Button`, `LockIcon`, `EyeIcon`, `EyeOffIcon` | เต็มความกว้าง; icon button ต้องไม่บีบ input |
| Secondary options | Remember me และ Forgot password | `Checkbox`, `TextLabel` | ปัจจุบันคงในแถวเดียวจนถึง 360px; ต้องลบหรือกำหนด behavior ก่อน release |
| Feedback | form-level error | `TextLabel` | เต็มความกว้างและ wrap ข้อความได้ |
| Primary action | “เข้าสู่ระบบ” / “กำลังเข้าสู่ระบบ...” | `Button`, `LockIcon` | เต็มความกว้าง |

## 7. Data contract

| UI datum | Confirmed source field | Requirement | Format/fallback | Ownership or notes |
| --- | --- | --- | --- | --- |
| Username input | request `username` | Required string, backend 1–100 chars | ไม่แสดงค่าเริ่มต้น | ผู้ใช้กรอก; backend authoritative |
| Password input | request `password` | Required string, backend min 8 chars | masked by default | ห้าม persist/log; backend authoritative |
| Current user ID | response `user.id` | Required decimal string | ไม่แสดงใน Login | backend `BigInt` serialized string |
| Current user name | response `user.name` | Required string | TopBar fallback ปัจจุบัน “Admin” | backend current profile |
| Current username | response `user.username` | Required string | ไม่จำเป็นต้องแสดง | backend current profile |
| Current role | response `user.role.code/name` | Required nested object | TopBar ควรแสดงชื่อหรือ code ที่ยืนยันแล้ว | frontend type ยัง mismatch |
| Error message | error `code/message` | Conditional | map เป็นข้อความไทยทั่วไป | ห้ามเปิดเผย account existence |
| Request ID | response `meta.requestId` | Conditional | แสดงในรายละเอียดช่วยเหลือเมื่อเหมาะสม | ใช้ correlate backend logs |
| Access token | response `accessToken` | Required on login success | ห้าม render หรือคืนให้ browser JS | เก็บเฉพาะ httpOnly cookie |
| Token expiry | response `expiresIn` | Required string | ไม่ต้องแสดง | ใช้กำหนด cookie lifetime หลังมี parser/policy ที่ชัดเจน |

### Read operations

- Backend `GET /api/auth/me`
  - Authentication: `Authorization: Bearer <access-token>` จาก server-side cookie
  - Cache: `no-store`
  - Success: current active public user
  - `401 UNAUTHORIZED`: session ไม่ถูกต้อง, หมดอายุ, user inactive หรือ role inactive
- Proxy อ่านเฉพาะการมีอยู่ของ `kmg_session`; ไม่ถือเป็น cryptographic validation

### Mutations

- Frontend `POST /api/auth/login`
  - Request: `{ username: string, password: string }`
  - Success response to browser: `{ ok: true, user }`; ต้องไม่มี token
  - Side effect: set `kmg_session` ด้วย secure cookie policy
- Backend login endpoint
  - Contract จาก backend source: `POST /api/auth/login`
  - Success data: `{ accessToken, tokenType: "Bearer", expiresIn, user }`
- Logout Server Action
  - Side effect: delete `kmg_session`
  - Navigation: redirect `/login`
  - ไม่มี backend token revocation ใน MVP
- Frontend `POST /api/auth/logout` มีอยู่และ clear cookie เช่นกัน แต่ TopBar ปัจจุบันใช้ Server Action; ต้องเลือก canonical logout path เพื่อลด behavior ซ้ำ

### API and adapter gaps

- ตกลง backend base path ระหว่าง `/api` กับ `/api/v1`
- map `expiresIn` ไป cookie max age อย่างปลอดภัย หรือกำหนด session policy กลาง
- นำ invalid-session cleanup กลางไปใช้กับ protected Route Handler/Server Action อื่นเมื่อเพิ่ม business features

## 8. Rendering and component boundaries

- Server-rendered regions:
  - `src/app/(auth)/login/page.tsx` เป็น Server Component สำหรับ page composition และ branding
  - `src/app/(app)/layout.tsx` โหลด current user ฝั่ง server
  - Route Handler/Server Action รับผิดชอบ cookie mutation
- Client-interactive region:
  - `src/features/auth/login-form.tsx` เท่านั้น สำหรับ input state, submit, pending, error และ password visibility
- Cache/refresh behavior:
  - login/backend request และ `/auth/me` ใช้ `no-store`
  - หลัง login ใช้ `router.replace("/dashboard")` และ `router.refresh()`
- Shared dependencies:
  - `Button`, `Input`, `Checkbox`, `Card`, `CardContent`, `TextLabel`
  - icons จาก `src/components/icon/icons`
  - `TopBar` สำหรับ current user และ logout
- Proposed reusable changes:
  - ขยาย `Input` ให้รองรับ `label`, `error`, `aria-describedby` และ invalid styling แบบ shared
  - เพิ่ม shared inline error/alert primitive หากหลาย form ใช้ pattern เดียวกัน
- Security boundary:
  - Client Component รู้เฉพาะ login result/user summary; token อยู่ใน Route Handler, Server Function, server API client และ httpOnly cookie เท่านั้น

## 9. UI states

| State | Visible behavior/copy | Available actions | Recovery or transition |
| --- | --- | --- | --- |
| Initial | form ว่าง, password ถูกซ่อน, ปุ่ม “เข้าสู่ระบบ” | กรอกข้อมูล, toggle password, submit | ผู้ใช้กรอก credential |
| Client validation error | “กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน” | แก้ข้อมูลและ submit ใหม่ | focus ช่องแรกที่ไม่ถูกต้อง (Proposed) |
| Login pending | ปุ่ม “กำลังเข้าสู่ระบบ...” และ disabled | toggle/inputs ควรถูก freeze หรือ submit เท่านั้นต้องถูก block; ต้องตัดสิน | success หรือ failure |
| Authenticated success | ไม่มี success toast ที่หน้า Login | ไม่มี | replace `/dashboard` |
| Invalid credential | “ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง” | แก้ข้อมูลและลองใหม่ | คง username; focus password (Proposed) |
| Backend validation error | “ข้อมูลที่กรอกไม่ถูกต้อง” | แก้ข้อมูลและลองใหม่ | map field error เมื่อรองรับ |
| Backend unavailable | “ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง” | ลองใหม่ | submit ซ้ำเมื่อระบบพร้อม |
| Unknown/malformed response | “ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง” พร้อม request ID เมื่อมี | ลองใหม่ | submit ซ้ำหรือติดต่อผู้ดูแล |
| Cookie exists at `/login` | ไม่มีหน้า Login; redirect `/dashboard` | ไม่มี | Dashboard ตรวจ current user ต่อ |
| Missing cookie on app route | ไม่มี app content; redirect `/login` | เข้าสู่ระบบ | submit Login |
| Invalid/expired cookie | ลบ cookie ผ่าน `/api/auth/session/clear` และ redirect `/login` | เข้าสู่ระบบ | ข้อความ session หมดอายุยังไม่ได้ implement |
| Logout pending | ปุ่ม logout ควร disabled/แสดง pending (Proposed) | ไม่มี submit ซ้ำ | redirect `/login` |
| Logout success | ไม่มี app content | Login ใหม่ | `/login` |
| Unauthorized/forbidden | Login ไม่มี forbidden state; business route ต้อง enforce แยก | กลับหน้าที่เข้าถึงได้หรือ logout | อย่าใช้การซ่อน UI แทน backend auth |
| Empty/partial/not found | Not applicable สำหรับหน้า Login | Not applicable | Not applicable |

## 10. Interaction contract

| Action | Visibility/enabled rule | Confirmation | Pending behavior | Success | Failure |
| --- | --- | --- | --- | --- | --- |
| Submit login | แสดงเสมอ; submit เมื่อไม่ pending | ไม่ต้องยืนยัน | disabled และเปลี่ยนข้อความ; block duplicate request | set cookie และ replace `/dashboard` | แสดง inline error โดยไม่ออกจากหน้า |
| Toggle password | แสดงใน password field | ไม่ต้องยืนยัน | ใช้งานได้ทันที | สลับ `password`/`text` และ aria-label | ไม่เกี่ยวข้องกับ API |
| Submit ด้วย Enter | เมื่อ focus อยู่ใน form และไม่ pending | ไม่ต้องยืนยัน | เหมือนปุ่ม Login | เหมือนปุ่ม Login | เหมือนปุ่ม Login |
| Remember me | ปัจจุบันแสดงและ checked แต่ไม่มี effect | Not applicable | Not applicable | ไม่มี confirmed success | ต้องลบหรือออกแบบก่อน release |
| Forgot password | ปัจจุบันแสดงแต่ไม่มี route | Not applicable | Not applicable | ไม่มี confirmed success | ต้องลบ/disabled พร้อม copy หรือทำ spec แยก |
| Logout | แสดงใน authenticated TopBar | ไม่ต้องยืนยันสำหรับ MVP | ควรป้องกัน submit ซ้ำ | clear cookie และ redirect `/login` | ถ้าลบ cookie ไม่สำเร็จ ให้คงหน้าและแจ้งลองใหม่; behavior ต้อง implement |

## 11. Field and validation rules

| Field | Input/control | Frontend guidance | Backend-authoritative rule | Error copy |
| --- | --- | --- | --- | --- |
| Username | text input, `autocomplete="username"` | required; แสดง visible label “ชื่อผู้ใช้งาน”; ไม่ trim จนกว่าจะอนุมัติ normalization rule | string 1–100 chars, strict payload | ว่าง: “กรุณากรอกชื่อผู้ใช้งาน” |
| Password | password input, `autocomplete="current-password"` | required; แสดง visible label “รหัสผ่าน”; ไม่ persist | string ขั้นต่ำ 8 chars; credential match; user/role active | ว่าง: “กรุณากรอกรหัสผ่าน”; credential failure ใช้ข้อความทั่วไป |

ข้อกำหนดเพิ่มเติม:

- backend เป็น final authority แม้ frontend จะตรวจ length เพื่อ feedback เร็วขึ้น
- payload ต้องมีเฉพาะ `username` และ `password` ตาม strict backend schema
- ห้าม trim password
- ห้ามแสดง password ใน error, telemetry หรือ request log
- invalid credential ทุกกรณีต้องไม่เปิดเผยว่าบัญชีมีอยู่หรือ inactive

## 12. Responsive behavior

- Desktop (`lg` ขึ้นไป): แสดง brand panel และ login panel สองคอลัมน์ภายใน centered container; card ไม่เกินความกว้างที่อ่านง่าย
- Tablet: คงสองคอลัมน์เมื่อมีพื้นที่ แต่ลด padding และ logo เพื่อไม่ให้ form ถูกบีบ
- Mobile (`md` ลงมา): เรียง brand panel เหนือ login panel, ลด logo/trust item copy และให้ form/control กว้างเต็มพื้นที่
- Narrow mobile (`360px` หรือต่ำกว่า): secondary options ต้องไม่ล้นหรือบังคับ truncate ข้อความสำคัญ; หากยังคงใช้ควรเรียงสองบรรทัด
- Landscape/low-height: หน้า scroll ได้และปุ่ม Login ต้องไม่ถูก keyboard บังถาวร
- Dense table strategy: Not applicable

## 13. Accessibility

- ใช้ `<main>` หนึ่งจุดและ `<h1>` เป็นชื่อหน้าจอ/ร้าน; trust items ใช้ heading ตามลำดับที่ไม่ข้ามระดับโดยไม่จำเป็น
- Username และ password ต้องมี `<label>` หรือ accessible name แบบ programmatic; placeholder ไม่ใช่ label ทดแทน
- password toggle ต้องมี aria-label ที่เปลี่ยนระหว่าง “แสดงรหัสผ่าน” และ “ซ่อนรหัสผ่าน” และต้องไม่ submit form
- error container ใช้ `role="alert"` หรือ `aria-live="polite"`; inputs ที่ผิดใช้ `aria-invalid` และ `aria-describedby`
- หลัง validation failure ให้ focus ช่องแรกที่ผิด; หลัง credential failure ให้ focus password หรือ error summary ตาม pattern ที่เลือก
- pending state ต้องประกาศให้ screen reader รับรู้ และป้องกัน duplicate submission
- tab order: username → password → password toggle ตาม browser semantics → secondary controls (ถ้ามี) → Login
- focus indicator ต้องมองเห็นได้ทุก control
- trust indicators ต้องไม่ใช้ icon/สีเป็นข้อมูลเพียงอย่างเดียว
- logo มี alt “ร้านขวัญเมืองแก๊ส”; decorative backgrounds ไม่ควรถูกประกาศ

## 14. Acceptance criteria

1. Given ผู้ใช้ไม่มี auth cookie, when เปิด `/dashboard` หรือ authenticated route, then ระบบ redirect ไป `/login` โดยไม่ render protected page content
2. Given ผู้ใช้ไม่มี auth cookie, when เปิด `/login`, then เห็น username, password และปุ่ม “เข้าสู่ระบบ” ที่ใช้งานด้วย keyboard ได้บน desktop และ mobile
3. Given username หรือ password ว่าง, when submit, then ไม่เรียก backend และแสดง error ภาษาไทยพร้อม focus/association กับ field ที่ผิด
4. Given credential ถูกต้องและ user/role active, when submit, then frontend route handler ตั้ง access token ใน httpOnly cookie, ไม่คืน token ให้ browser JavaScript และ replace ไป `/dashboard`
5. Given credential ไม่ถูกต้องหรือ user/role inactive, when submit, then คงอยู่ `/login` และแสดง “ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง” โดยไม่เปิดเผยสาเหตุเฉพาะ
6. Given login request กำลังทำงาน, when ผู้ใช้กด submit ซ้ำ, then มี request เดียวที่ active และปุ่มแสดง “กำลังเข้าสู่ระบบ...”
7. Given password ถูกซ่อน, when กดปุ่มแสดงรหัสผ่าน, then ค่าเดิมแสดงเป็น text, aria-label เปลี่ยนเป็น “ซ่อนรหัสผ่าน” และปุ่มไม่ submit form
8. Given cookie และ JWT ยัง valid, when refresh authenticated route, then session ยังคงอยู่และ TopBar แสดงชื่อ/role จาก `/auth/me`
9. Given JWT หมดอายุ, malformed หรืออ้าง user/role ที่ inactive, when เปิด authenticated route หรือเรียก protected API, then ระบบลบ cookie และ redirect `/login` พร้อมข้อความ session หมดอายุ โดยไม่เกิด redirect loop
10. Given ผู้ใช้มี cookie, when เปิด `/login`, then Proxy redirect ไป `/dashboard`; การมี cookie เพียงอย่างเดียวไม่ใช้แทน backend authorization
11. Given ผู้ใช้กด “ออกจากระบบ”, when Server Action สำเร็จ, then cookie ถูกลบและระบบ redirect `/login`; Back navigation ต้องไม่เผย protected server data โดยไม่มี session
12. Given backend ติดต่อไม่ได้หรือ response malformed, when submit Login, then form แสดงข้อความทั่วไปที่ retry ได้และไม่เปิดเผย port, stack trace, token หรือ credential ใน production
13. Given viewport กว้างไม่เกิน 360px, when เปิด `/login`, then ไม่มี horizontal overflow, ข้อความสำคัญไม่ถูกตัด และทุก control แตะ/กดได้
14. Given screen reader หรือ keyboard-only user, when ใช้ Login form, then ทุก field/action มี accessible name, error ถูกประกาศ, focus มองเห็นและลำดับใช้งานสมเหตุสมผล

## 15. Risks and follow-up

### Implementation mismatches

- Remember me และ Forgot password ถูก comment ไว้จนกว่า backend จะมี contract รองรับ
- invalid/expired cookie cleanup ครอบคลุม authenticated layout แล้ว แต่ยังไม่มีข้อความ session หมดอายุและยังต้อง reuse กับ protected call อื่น
- frontend route handler แสดง port 4000 ใน error ซึ่งไม่เหมาะกับ production copy
- inputs ยังไม่มี visible/programmatic labels และ error association
- logout มีสอง entry points (`logoutAction` และ `/api/auth/logout`) แต่ยังไม่ระบุ canonical path

### Breaking-change concerns

- การทำ cookie lifetime ตาม `expiresIn` อาจเปลี่ยนระยะเวลา session ที่ผู้ใช้พบจริง

### Dependencies

- browser E2E environment ที่ backend ทำงานและมี active Admin account

### Follow-up work

1. กำหนด cookie lifetime จาก backend `expiresIn` หรือ session policy กลาง
2. เปิด Remember me/Forgot password เมื่อ backend มี contract รองรับ
3. reuse invalid-session cleanup กับ protected Route Handler/Server Action อื่น
4. ปรับ shared `Input`/error semantics สำหรับ accessibility
5. เพิ่ม E2E สำหรับ login success, invalid credential, refresh session, expired session, route guard, logout และ mobile viewport
6. ทบทวน spec นี้หลัง API contract หรือ role model เปลี่ยน
