# Bajriwala Admin Panel

Enterprise ERP Admin Panel frontend built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** Shadcn/UI, Radix UI (Base UI), Tailwind CSS v4
- **State:** Zustand, TanStack Query
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table
- **Charts:** Recharts
- **HTTP:** Axios with JWT interceptors

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command          | Description                     |
| ---------------- | ------------------------------- |
| `pnpm dev`       | Start dev server with Turbopack |
| `pnpm build`     | Production build                |
| `pnpm start`     | Start production server         |
| `pnpm lint`      | Run ESLint                      |
| `pnpm format`    | Format with Prettier            |
| `pnpm typecheck` | TypeScript check                |

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── common/           # Shared components
│   ├── forms/            # Form components
│   ├── layout/           # Layout (sidebar, header)
│   ├── charts/           # Recharts wrappers
│   ├── tables/           # TanStack Table
│   ├── modals/           # Modal components
│   └── providers/        # React providers
├── features/             # Feature modules
├── services/             # API services
├── store/                # Zustand stores
├── hooks/                # Custom hooks
├── utils/                # Utility functions
├── constants/            # Routes, roles, permissions
├── config/               # App configuration
└── types/                # TypeScript types
```

## Environment Variables

See `.env.example` for required variables:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_AUTH_TOKEN_KEY`
- `NEXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY`

## Theme

- Primary color: `#FF6B00` (Orange)
- Light/Dark mode ready via `next-themes`
- Enterprise card-based UI with soft shadows

## RBAC Roles

- `SUPER_ADMIN`, `ADMIN`, `CUSTOMER_EXECUTIVE`
- `WAREHOUSE_MANAGER`, `SUB_HUB_MANAGER`, `LOGISTICS_MANAGER`
- `DRIVER`, `CUSTOMER`

Permission helpers are in `src/constants/permissions.ts`.

## License

Private — Bajriwala
