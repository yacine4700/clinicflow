# 🏥 ClinicFlow — Medical Clinic Management System

A production-ready, full-stack medical clinic management platform built with Next.js 15, TypeScript, PostgreSQL, Prisma ORM, and Tailwind CSS. Designed for real-world clinical workflows.

---

## ✨ Features

| Module | Features |
|--------|----------|
| **Auth** | JWT sessions via NextAuth v5, role-based access (Doctor / Secretary), protected routes, middleware |
| **Waiting Room** | Live queue, auto-refresh every 30s, urgent priority, duration tracking, call-in / done / left actions |
| **Patients** | Register patients, optional medical file, search, patient profile with full history |
| **Prescriptions** | Drug autocomplete from DB, templates, save/reuse templates, printable PDF layout |
| **Documents** | Medical leave, letters, certificates, custom — all printable as PDF |
| **Finance** | Record payments, add expenses, bar chart (6 months), daily/monthly/net revenue |
| **Settings** | Clinic info, consultation price, prescription header/footer, template management |

---

## 🗂️ Folder Structure

```
clinicflow/
├── prisma/
│   ├── schema.prisma         # Full DB schema
│   ├── seed.ts               # Sample data (users, patients, drugs, payments)
│   └── migrations/           # Database migrations
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Sidebar + TopBar shell
│   │   │   ├── dashboard/page.tsx    # Summary stats
│   │   │   ├── waiting-room/page.tsx
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx     # Patient profile
│   │   │   ├── prescriptions/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── documents/page.tsx
│   │   │   ├── finance/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── documents/route.ts
│   │   │   ├── drugs/route.ts
│   │   │   └── print/
│   │   │       ├── prescription/[id]/route.ts  # Printable HTML → PDF
│   │   │       └── document/[id]/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── auth/login-form.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   └── topbar.tsx
│   │   ├── patients/
│   │   │   ├── patients-client.tsx
│   │   │   ├── patient-profile.tsx
│   │   │   └── add-patient-dialog.tsx
│   │   ├── waiting-room/
│   │   │   ├── waiting-room-client.tsx
│   │   │   └── add-to-waiting-dialog.tsx
│   │   ├── prescriptions/
│   │   │   ├── prescription-editor.tsx  # New prescription form with drug search
│   │   │   └── prescription-view.tsx    # Printable view
│   │   ├── documents/documents-client.tsx
│   │   ├── finance/
│   │   │   ├── finance-dashboard.tsx
│   │   │   └── record-payment-dialog.tsx
│   │   ├── settings/settings-client.tsx
│   │   └── providers/session-provider.tsx
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── config.ts    # NextAuth config, JWT callbacks
│   │   │   └── index.ts     # auth(), handlers, signIn, signOut
│   │   ├── actions/         # All Server Actions
│   │   │   ├── patients.ts
│   │   │   ├── waiting-room.ts
│   │   │   ├── prescriptions.ts
│   │   │   └── finance.ts
│   │   ├── db/prisma.ts     # Prisma singleton
│   │   └── utils/index.ts   # cn(), formatDate(), calculateAge(), etc.
│   │
│   ├── middleware.ts         # Route protection + role gating
│   └── types/
│       ├── index.ts
│       └── next-auth.d.ts   # Session type augmentation
```

---

## 🗄️ Database Schema (Prisma)

### Core Models

```
User              → id, name, email, password, role (DOCTOR|SECRETARY)
Patient           → id, firstName, lastName, dob, phone, bloodType, allergies, hasFile
MedicalFile       → patientId (1:1), history, complaints, meds
WaitingRoom       → patientId, registeredAt, status (WAITING|IN_CONSULTATION|DONE|LEFT), priority
Prescription      → patientId, doctorId, diagnosis, items[]
PrescriptionItem  → prescriptionId, drugName, dosage, frequency, duration
PrescriptionTemplate → name, items (JSON)
Drug              → name, genericName, category, commonDosages[]
Document          → patientId, doctorId, type, title, content (JSON)
Payment           → patientId, recordedById, amount, method, status
Expense           → category, description, amount, date
ClinicSettings    → clinicName, doctorName, consultationPrice, currency, etc.
```

---

## 🔐 Authentication & Roles

### How It Works
- **NextAuth v5** with `CredentialsProvider`
- Passwords hashed with `bcryptjs`
- Sessions stored as **JWT tokens** (stateless)
- Session user contains: `id`, `name`, `email`, `role`

### Role Permissions

| Feature | Doctor | Secretary |
|---------|--------|-----------|
| View Dashboard | ✅ | ✅ |
| Manage Waiting Room | ✅ | ✅ |
| Register Patients | ✅ | ✅ |
| View Patient Profiles | ✅ | ✅ |
| Record Payments | ✅ | ✅ |
| Create Prescriptions | ✅ | ❌ |
| Generate Documents | ✅ | ❌ |
| View Finance Dashboard | ✅ | ❌ |
| Configure Settings | ✅ | ❌ |

### Middleware Route Protection
```ts
// Protected: /dashboard, /patients, /waiting-room, /prescriptions, /finance, /settings, /documents
// Doctor-only: /prescriptions/new, /documents, /finance
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** database (local or hosted)
- **npm** or **pnpm**

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/clinicflow?schema=public"

# NextAuth
AUTH_SECRET="your-super-secret-key-minimum-32-chars"
AUTH_URL="http://localhost:3000"

# Optional: Vidal API (drug documentation)
VIDAL_API_KEY=""
```

> **Generate AUTH_SECRET:** `openssl rand -base64 32`

### 3. Initialize Database

```bash
# Push schema to DB (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

### 4. Seed Sample Data

```bash
npm run db:seed
```

This creates:
- 👨‍⚕️ **Doctor account:** `doctor@clinic.com` / `password123`
- 📋 **Secretary account:** `secretary@clinic.com` / `password123`
- 5 sample patients with medical histories
- 15 drugs in the database
- 3 prescription templates
- 30 sample payments (last 60 days)
- 5 sample expenses

### 5. Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 💊 Prescription Workflow

1. Doctor navigates to **Prescriptions → New Prescription**
2. Selects patient from dropdown
3. Types drug name → **auto-suggestions** from Drug database appear
4. Selects a drug → dosage auto-filled from common dosages
5. Fills frequency, duration, optional instructions
6. Optionally loads a **saved template** (applies all items at once)
7. Submits → prescription saved to DB
8. Prescription page opens with **printable layout**
9. Click **Print PDF** → opens `/api/print/prescription/{id}` → browser print dialog

---

## 📄 PDF Generation

PDFs are generated server-side as styled HTML pages served at:
- `GET /api/print/prescription/{id}` — Prescription with Rx symbol, drug table, signature
- `GET /api/print/document/{id}` — Medical certificate/letter with official stamp area

Both routes:
- Require authentication
- Pull clinic settings (name, logo text, footer)
- Return `text/html` that auto-triggers `window.print()`
- Are designed for A4 print layout

---

## 🏥 Waiting Room Logic

```
Patient arrives → Secretary adds to queue (AddToWaitingDialog)
   └── Status: WAITING, registeredAt = now()

Doctor clicks "Call In" → status: IN_CONSULTATION, calledAt = now()

Doctor clicks "Done" → status: DONE, doneAt = now()
   └── Patient is removed from active queue display

Page auto-refreshes every 30 seconds via useEffect + router.refresh()
Waiting duration calculated client-side: differenceInMinutes(now, registeredAt)
```

---

## 💰 Finance Module

### Payment Recording
- Any user (doctor or secretary) can record a payment
- Links to patient record
- Payment methods: Cash, Card, Insurance, Other

### Financial Dashboard (Doctor only)
- **Today's revenue** + consultation count
- **Monthly revenue, expenses, net income**
- **6-month bar chart** (revenue vs expenses) via Recharts
- **Recent payment log** with patient names

### Adding Expenses
- Categories: Supplies, Utilities, Equipment, Rent, Other
- Immediately reflected in monthly calculations

---

## ⚙️ Settings

Doctors can configure:
- **Clinic information**: Name, doctor name, specialty, address, phone, email
- **Consultation price**: Default fee shown in payment dialogs
- **Currency**: Used throughout financial displays
- **Prescription layout**: Header text, footer disclaimer
- **Medical file requirement**: Toggle whether new patients require a file
- **Template management**: View and delete saved prescription templates

---

## 🧱 Architecture Decisions

### Server Components First
- All pages are React Server Components fetching data directly
- Client components used only where interactivity needed

### Server Actions
- All mutations go through typed server actions in `/lib/actions/`
- `revalidatePath()` used instead of manual cache busting
- Zod validation on all inputs

### No External State Management
- React Context only for session (via SessionProvider)
- URL state for search/filters
- `router.refresh()` for data refetching

### Security
- Middleware runs on Edge runtime for all protected routes
- Role check in middleware AND in each server action
- Passwords never returned in session/JWT
- `bcryptjs` with cost factor 12

---

## 🔧 Scripts Reference

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run db:push      # Push schema changes (dev)
npm run db:migrate   # Run migrations
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio (DB GUI)
```

---

## 🌐 Deployment

### Environment (Production)

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."           # Use: openssl rand -base64 32
AUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

### Recommended Platforms
- **Vercel** — zero-config Next.js hosting
- **Railway / Render** — PostgreSQL + Node.js
- **Supabase** — Hosted PostgreSQL with connection pooling

### Database Migrations (Production)
```bash
npm run db:migrate
```

---

## 📊 Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| Auth | NextAuth v5 (JWT) |
| Styling | Tailwind CSS v3 |
| UI Components | Radix UI primitives |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |
| Icons | Lucide React |
| Date Utils | date-fns |

---

## 🔮 Extension Ideas

- **FHIR Integration** — standardized health record export
- **SMS Notifications** — remind patients of appointments (Twilio)
- **Appointment Scheduling** — calendar-based booking system
- **Lab Results** — attach and track lab orders
- **Multi-doctor Support** — expand to clinic with multiple practitioners
- **Dark Mode Toggle** — CSS variables already support dark mode
- **Audit Log** — track all clinical actions for compliance
- **Vidal API** — real drug information panel (API key required)

---

*Built with ❤️ for efficient, modern clinic management.*
