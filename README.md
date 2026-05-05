# STMS — Student Task Management System

**CSPC 321 – Software Engineering | 2nd Semester SY 2025-2026**  
Group 3: Joshua Bermas, Juliana Bilazon, John Earl Mirabete

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + TypeScript | Type-safe, component-driven, industry standard |
| **Styling** | Tailwind CSS | Utility-first, fast iteration, consistent design |
| **Routing** | React Router v6 | Declarative client-side routing |
| **Backend / DB** | Supabase (PostgreSQL) | Instant REST + realtime API, built-in auth, RLS |
| **Auth** | Supabase Auth | JWT-based, email/password, session management |
| **Build tool** | Vite | Lightning-fast HMR and bundling |
| **Icons** | Lucide React | Consistent, lightweight icon set |

---

## Project Structure

```
stms/
├── src/
│   ├── components/
│   │   ├── ui.tsx          # Reusable UI primitives (Button, Input, Modal, Badge…)
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── TaskCard.tsx    # Individual task row component
│   │   └── TaskModal.tsx   # Create / Edit task modal
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client singleton
│   │   ├── AuthContext.tsx # React context for auth state
│   │   ├── taskApi.ts      # Task CRUD functions
│   │   └── userApi.ts      # User/profile management functions
│   ├── pages/
│   │   ├── AuthPages.tsx   # Login + Register pages
│   │   ├── DashboardPage.tsx
│   │   ├── TasksPage.tsx
│   │   └── UsersPage.tsx   # Admin only
│   ├── types/
│   │   └── index.ts        # TypeScript types (Task, Profile, etc.)
│   ├── App.tsx             # Router + route guards
│   ├── main.tsx            # React entry point
│   └── index.css           # Tailwind base styles
├── supabase/
│   └── schema.sql          # Full database schema + RLS policies
├── .env.example            # Environment variable template
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## Setup Guide

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for the project to be provisioned (≈ 1 minute).

### 2. Run the database schema

1. In your Supabase dashboard, go to **SQL Editor → New Query**.
2. Paste the full contents of `supabase/schema.sql`.
3. Click **Run**. This creates:
   - `profiles` table (extends auth.users)
   - `tasks` table
   - Row Level Security (RLS) policies
   - Auto-trigger to create a profile on signup

### 3. Get your API credentials

In Supabase: **Project Settings → API**

- Copy your **Project URL** (`https://xxxx.supabase.co`)
- Copy your **anon public key**

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Making the first admin

After signing up via the app, promote yourself to admin in Supabase:

```sql
-- SQL Editor in Supabase Dashboard
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'paste-your-user-uuid-here';
```

Find your UUID: **Authentication → Users** in the Supabase dashboard.

---

## Features

### Student
- Register / Login securely via Supabase Auth
- Create academic tasks (Assignment, Quiz, Project)
- Set priority (Low / Medium / High) and due date
- Update task status (Pending → Ongoing → Done)
- Filter tasks by status and type, search by title
- Edit and delete own tasks

### Admin (all student features +)
- View all tasks across all students
- Manage user accounts (create, edit, change role)
- Dashboard stats across the entire system

---

## Database Design (ERD summary)

```
USERS (auth.users) ──< PROFILES (1:1) ──< TASKS (1:N)
```

| Table | Key columns |
|---|---|
| `profiles` | id (FK → auth.users), name, role |
| `tasks` | id, user_id (FK → profiles), title, type, priority, status, due_date |

RLS ensures:
- Students can only read/write their own tasks
- Admins can read/write all tasks and profiles

---

## Deployment

### Vercel (recommended)

```bash
npm run build
# Deploy the `dist/` folder to Vercel
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment settings
```

### Netlify

Same as above — add env vars in the Netlify site settings.

---

## Development Scripts

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```
