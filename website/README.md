# OpenForge Website

The official website and platform for **OpenForge** — *The AI That Can Use Computer*.

## Tech Stack

- **Frontend**: Next.js 14 (React + TypeScript)
- **Styling**: TailwindCSS + shadcn/ui components
- **Database**: Prisma + SQLite (dev)
- **Auth**: JWT-based authentication
- **Animations**: Framer Motion

## Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Hero, features, how it works, AI providers, install |
| Login | `/login` | User authentication |
| Register | `/register` | Account creation |
| Dashboard | `/dashboard` | AI command center, subspaces, workflows |
| Docs | `/docs` | Full documentation with search |
| Blog | `/blog` | Blog posts with categories and tags |
| Blog Post | `/blog/[slug]` | Individual blog post detail |
| FAQ | `/faq` | Frequently asked questions |
| Support | `/support` | Contact form and support channels |

## Quick Start

```bash
cd website

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize database
npx prisma generate
npx prisma db push

# (Optional) Seed data
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
website/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── public/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Register, login, logout, me
│   │   │   ├── commands/  # Execute, history
│   │   │   ├── blog/      # Blog posts
│   │   │   ├── support/   # Contact, tickets
│   │   │   ├── subspaces/ # CRUD operations
│   │   │   └── workflows/ # CRUD operations
│   │   ├── dashboard/     # Main dashboard
│   │   ├── docs/          # Documentation
│   │   ├── blog/          # Blog pages
│   │   ├── faq/           # FAQ page
│   │   ├── support/       # Support page
│   │   ├── login/         # Login page
│   │   ├── register/      # Register page
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Landing page
│   │   └── globals.css    # Global styles
│   ├── components/
│   │   ├── ui/            # UI components (Button, Card, etc.)
│   │   ├── layout/        # Navbar, Footer
│   │   ├── landing/       # Landing page components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── docs/          # Docs components
│   │   └── auth/          # Auth components
│   ├── hooks/
│   │   └── use-toast.ts   # Toast notification hook
│   ├── lib/
│   │   ├── utils.ts       # Utility functions (cn)
│   │   ├── db.ts          # Prisma client
│   │   └── auth.ts        # JWT utilities
│   └── types/
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Features

- **Dark Theme**: Neon accents (blue/purple), glassmorphism UI
- **Terminal Components**: Monospace code displays, CLI-style elements
- **Responsive**: Works on all screen sizes
- **Smooth Animations**: Framer Motion transitions throughout
- **Auth System**: JWT-based registration and login
- **AI Dashboard**: Execute commands with multiple AI providers
- **Subspaces**: Isolated environments for parallel tasks
- **Workflows**: Create and manage automation workflows
- **Blog**: MDX-ready blog system with categories and tags
- **Docs**: Searchable documentation with code examples
- **Support**: Contact form and ticket system

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/commands/execute` | Run AI command |
| GET | `/api/commands/history` | Get command history |
| GET | `/api/blog/posts` | List blog posts |
| POST | `/api/blog/posts` | Create blog post |
| POST | `/api/support/contact` | Submit support ticket |
| GET | `/api/support/tickets` | List user tickets |
| GET/POST | `/api/subspaces` | Manage subspaces |
| GET/POST | `/api/workflows` | Manage workflows |

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Design System

- **Primary Color**: Cyan (#00d4ff)
- **Accent**: Purple (#a855f7)
- **Background**: Near-black (#080808)
- **Font**: Inter (sans) + JetBrains Mono (code)
- **Components**: Glassmorphism cards, neon glow effects
