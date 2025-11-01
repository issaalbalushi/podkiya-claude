# Podkiya - Micro-Learning Audio Platform

A production-ready platform for sharing and discovering 1-3 minute educational audio clips ("mini-podcasts").

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Background Jobs](#background-jobs)
- [Feature Implementation Status](#feature-implementation-status)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)

## Architecture

Podkiya is built as a **monorepo** using npm workspaces with the following structure:

- **apps/web**: Next.js 15 application (App Router, React Server Components)
- **packages/core**: Shared types, validators, constants, and utilities
- **packages/db**: Prisma schema, database client, and seed scripts
- **packages/ui**: Reusable UI components (shadcn/ui based)
- **packages/jobs**: Background job workflows (Inngest)

## Tech Stack

### Frontend
- **Next.js 15** (App Router, Server Components)
- **TypeScript** (strict mode)
- **Tailwind CSS** + **shadcn/ui**
- **next-intl** (i18n with English + Arabic + RTL support)
- **tRPC** (type-safe API)
- **TanStack Query** (data fetching)

### Backend
- **Next.js Server Actions** + **tRPC**
- **PostgreSQL** (via Prisma ORM)
- **NextAuth** (Email, Google, Apple)
- **Redis** (Upstash - caching & rate limiting)

### Infrastructure
- **S3-compatible storage** (audio, waveforms, thumbnails, transcripts)
- **Inngest** (background jobs for media pipeline)
- **Algolia** (search indexing)
- **OpenAI Whisper API** (transcription)
- **Resend** (email notifications)
- **PostHog** (product analytics)
- **Sentry** (error monitoring)

## Project Structure

```
podkiya-claude/
├── apps/
│   └── web/                 # Next.js application
│       ├── app/             # App Router pages
│       │   ├── (auth)/      # Auth pages group
│       │   ├── (main)/      # Main app pages group
│       │   ├── api/         # API routes (tRPC, Inngest, webhooks)
│       │   ├── globals.css
│       │   └── layout.tsx
│       ├── components/      # Shared UI components
│       ├── features/        # Feature-specific components & logic
│       │   ├── feed/
│       │   ├── upload/
│       │   ├── review/
│       │   ├── search/
│       │   ├── profile/
│       │   ├── admin/
│       │   └── notifications/
│       ├── lib/             # Core utilities
│       │   ├── auth.ts      # NextAuth configuration
│       │   ├── cache.ts     # Redis cache helpers
│       │   ├── rate-limit.ts
│       │   ├── trpc/        # tRPC setup
│       │   └── analytics.ts # PostHog integration
│       ├── i18n/            # Internationalization
│       │   ├── messages/
│       │   │   ├── en.json
│       │   │   └── ar.json
│       │   └── request.ts
│       ├── middleware.ts    # Next.js middleware (i18n, security headers)
│       ├── next.config.js
│       └── tailwind.config.ts
├── packages/
│   ├── core/               # Shared core package
│   │   └── src/
│       │   ├── types.ts        # TypeScript types
│       │   ├── validators.ts   # Zod schemas
│       │   ├── constants.ts    # App constants
│       │   └── utils.ts        # Utility functions
│   ├── db/                 # Database package
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       └── index.ts    # Prisma client export
│   ├── ui/                 # UI components package
│   │   └── src/
│       │   ├── button.tsx
│       │   └── lib/utils.ts
│   └── jobs/               # Background jobs package
│       ├── src/
│       │   ├── client.ts        # Inngest client
│       │   ├── functions/       # Job functions
│       │   │   └── process-clip.ts
│       │   ├── services/        # Service integrations
│       │   │   ├── storage.ts   # S3 abstraction
│       │   │   ├── transcription.ts  # Whisper API
│       │   │   ├── search.ts    # Algolia
│       │   │   └── audio.ts     # FFmpeg processing
│       │   └── serve.ts         # Dev server
│       └── package.json
├── .env.example
├── package.json
└── README.md
```

## Local Development Setup

### Prerequisites

1. **Node.js 18+** and **npm 9+**
2. **PostgreSQL** (local or cloud instance)
3. **Redis** (local or Upstash account)
4. **FFmpeg** (for audio processing)

Install FFmpeg:
- macOS: `brew install ffmpeg`
- Ubuntu: `apt-get install ffmpeg`
- Windows: Download from ffmpeg.org

### Steps

1. **Clone and install dependencies**
```
cd podkiya-claude
npm install
```

2. **Set up environment variables**
Copy `.env.example` to `.env` and fill in all required values (see Environment Variables section below)

3. **Initialize database**
```
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:seed        # Seed with sample data
```

4. **Run development servers**

In separate terminal windows:

Terminal 1 - Web app:
```
npm run dev
```

Terminal 2 - Background jobs:
```
npm run jobs:dev
```

5. **Access the application**
- Web app: http://localhost:3000
- Jobs endpoint: http://localhost:3001/api/inngest

## Environment Variables

See `.env.example` for a complete reference. Key variables:

### Database
- `DATABASE_URL`: PostgreSQL connection string

### Authentication
- `NEXTAUTH_URL`: Your app URL
- `NEXTAUTH_SECRET`: Random 32+ character secret
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET`: Apple OAuth credentials

### Storage
- `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`: S3 configuration
- `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`: S3 credentials
- `S3_PUBLIC_URL`: Public CDN URL for uploaded files

### External Services
- `REDIS_URL`: Redis connection string (Upstash format supported)
- `ALGOLIA_APP_ID`, `ALGOLIA_API_KEY`: Algolia search credentials
- `OPENAI_API_KEY`: OpenAI API key for Whisper
- `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`: Inngest credentials
- `RESEND_API_KEY`: Resend email API key
- `NEXT_PUBLIC_POSTHOG_KEY`: PostHog analytics key
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry error tracking DSN

## Database Setup

### Development

The Prisma schema is located in `packages/db/prisma/schema.prisma`.

**Generate Prisma Client:**
```
npm run db:generate
```

**Push schema changes (dev):**
```
npm run db:push
```

**Create migration (production):**
```
npm run db:migrate
```

**Seed database:**
```
npm run db:seed
```

This creates:
- 1 admin user
- 2 reviewers
- 2 creators
- 8 sample tags
- 6 sample clips (3 approved, 2 in review, 1 draft)

**Test Credentials:**
- Admin: admin@podkiya.com
- Reviewer 1: reviewer1@podkiya.com
- Reviewer 2: reviewer2@podkiya.com
- Creator 1: creator1@podkiya.com
- Creator 2: creator2@podkiya.com

### Production

Deploy migrations:
```
npm run db:migrate:deploy
```

Use a connection pooler (e.g., Prisma Accelerate, PgBouncer) for serverless environments.

## Running the Application

### Development Mode

```
npm run dev          # Start web app (localhost:3000)
npm run jobs:dev     # Start background jobs server (localhost:3001)
```

### Production Build

```
npm run build        # Build all packages
npm run start        # Start production server
```

### Prisma Studio (Database GUI)

```
npm run db:studio    # Opens at localhost:5555
```

## Background Jobs

The media pipeline runs as Inngest functions in `packages/jobs`:

### Workflow: Process Uploaded Clip

1. **Transcode** (`transcode-audio`)
   - Validate audio duration (≤180s)
   - Transcode to normalized MP3 (96kbps)
   - Generate waveform JSON
   - Upload to S3
   - Update Clip record
   - Create ReviewTask

2. **Transcribe** (`transcribe-audio`)
   - Call OpenAI Whisper API
   - Extract text + word-level timestamps
   - Save Transcript record
   - Upload words JSON to S3

3. **Index** (`index-clip`)
   - Build searchable document
   - Push to Algolia index

### Triggering Jobs

Jobs are triggered by Inngest events:

```typescript
await inngest.send({
  name: 'clip/uploaded',
  data: { clipId, audioBuffer },
});
```

### Retry & Monitoring

- Automatic retries: 3 attempts with exponential backoff
- Idempotent steps (safe to retry)
- Manual retry endpoint: `POST /api/clips/[id]/retry` (admin only)
- Monitor via Inngest dashboard

### Local Development

The jobs dev server (`npm run jobs:dev`) runs an Express server with Inngest SDK. In production, deploy as a long-running service or serverless function.

## Feature Implementation Status

### ✅ Completed (Infrastructure)

- [x] Monorepo structure (npm workspaces)
- [x] Prisma schema with all models (User, Role, Clip, Tag, etc.)
- [x] Database seed script
- [x] Type-safe validators (Zod)
- [x] Shared constants & utilities
- [x] S3 storage abstraction
- [x] Whisper transcription service
- [x] Algolia search indexing
- [x] Audio processing (FFmpeg)
- [x] Inngest job workflows
- [x] NextAuth configuration
- [x] Redis cache & rate limiting
- [x] i18n setup (English + Arabic with RTL)
- [x] Tailwind + dark mode config
- [x] Security headers middleware

### 🚧 To Implement (Apps/Web Features)

The following files need to be created in `apps/web`:

#### 1. Root Layout & Providers

- `app/layout.tsx` - Root layout with providers (NextIntl, Theme, Auth, tRPC, PostHog)
- `app/providers.tsx` - Client providers wrapper
- `lib/theme-provider.tsx` - Dark/light theme context

#### 2. Auth Routes

- `app/(auth)/signin/page.tsx` - Sign-in page (Email, Google, Apple)
- `app/(auth)/verify/page.tsx` - Email verification page
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route

#### 3. Main App Routes

- `app/(main)/page.tsx` - Home/landing page
- `app/(main)/feed/page.tsx` - Feed page (approved clips)
- `app/(main)/following/page.tsx` - Following feed
- `app/(main)/upload/page.tsx` - Upload clip form
- `app/(main)/review/page.tsx` - Review dashboard (reviewer role)
- `app/(main)/search/page.tsx` - Search page
- `app/(main)/u/[username]/page.tsx` - User profile
- `app/(main)/notifications/page.tsx` - Notifications page
- `app/(main)/admin/page.tsx` - Admin dashboard
- `app/(main)/admin/users/page.tsx` - User management
- `app/(main)/admin/reports/page.tsx` - Reports triage
- `app/(main)/admin/analytics/page.tsx` - Analytics dashboard

#### 4. API Routes

- `app/api/trpc/[trpc]/route.ts` - tRPC endpoint
- `app/api/inngest/route.ts` - Inngest webhook
- `app/api/upload/route.ts` - File upload endpoint (generates presigned URL)

#### 5. Server Actions

- `app/actions/clips.ts` - Upload, update, delete clips
- `app/actions/review.ts` - Approve, reject clips
- `app/actions/social.ts` - Like, save, follow/unfollow
- `app/actions/admin.ts` - Admin operations (ban, remove, restore)
- `app/actions/notifications.ts` - Mark as read

#### 6. tRPC Routers

- `lib/trpc/routers/clips.ts` - Get feed, clip details, user clips
- `lib/trpc/routers/users.ts` - Get profile, followers, following
- `lib/trpc/routers/search.ts` - Search clips
- `lib/trpc/routers/notifications.ts` - Get notifications
- `lib/trpc/routers/admin.ts` - Admin analytics, audit logs

#### 7. Feature Components

**Feed:**
- `features/feed/clip-card.tsx` - Clip card with player
- `features/feed/feed-list.tsx` - Infinite scroll feed
- `features/feed/audio-player.tsx` - Custom audio player with waveform
- `features/feed/play-tracker.tsx` - Track play events (30s, 60s, 90s, complete)

**Upload:**
- `features/upload/upload-form.tsx` - Multi-step upload form
- `features/upload/file-dropzone.tsx` - Drag-and-drop audio file
- `features/upload/tag-selector.tsx` - Multi-select tags

**Review:**
- `features/review/review-queue.tsx` - List of clips to review
- `features/review/review-detail.tsx` - Detailed review view with player
- `features/review/keyboard-shortcuts.tsx` - Keyboard navigation (A/R/J/K)

**Profile:**
- `features/profile/profile-header.tsx` - Avatar, bio, stats
- `features/profile/follow-button.tsx` - Follow/unfollow with optimistic UI
- `features/profile/user-clips.tsx` - Grid of user's clips

**Search:**
- `features/search/search-bar.tsx` - Search input with filters
- `features/search/search-results.tsx` - Results list
- `features/search/search-filters.tsx` - Language, tag filters

**Admin:**
- `features/admin/stats-cards.tsx` - Dashboard stats
- `features/admin/user-table.tsx` - User management table
- `features/admin/report-table.tsx` - Reports queue
- `features/admin/analytics-charts.tsx` - Top clips, approval rates

**Notifications:**
- `features/notifications/notification-list.tsx` - List of notifications
- `features/notifications/notification-bell.tsx` - Bell icon with badge

#### 8. Shared Components

- `components/nav/header.tsx` - Main navigation
- `components/nav/mobile-nav.tsx` - Mobile hamburger menu
- `components/nav/user-menu.tsx` - User dropdown
- `components/nav/language-switcher.tsx` - EN/AR toggle
- `components/nav/theme-toggle.tsx` - Dark/light mode toggle
- `components/ui/empty-state.tsx` - Empty state with icon
- `components/ui/loading-skeleton.tsx` - Loading placeholders
- `components/ui/error-boundary.tsx` - Error boundary component

### Implementation Guide

For each feature, follow this pattern:

1. **Create tRPC router** (if querying data)
   - Define input/output schemas with Zod
   - Implement query logic with Prisma
   - Apply proper access control (check user roles)

2. **Create Server Action** (if mutating data)
   - Validate input with Zod
   - Check authentication & authorization
   - Apply rate limiting
   - Update database
   - Invalidate caches
   - Trigger background jobs if needed
   - Return result

3. **Create UI component**
   - Fetch data with tRPC (useQuery)
   - Mutate data with Server Actions (useTransition or useMutation)
   - Show loading/error states
   - Implement optimistic UI where appropriate
   - Add keyboard shortcuts for power users

4. **Add analytics tracking**
   - Call PostHog on key events (play, like, share, etc.)

5. **Add tests**
   - Unit tests for business logic
   - Component tests with React Testing Library
   - E2E tests with Playwright

## Creating Reviewer/Admin Users

After seeding, manually add roles:

```sql
-- Make user a reviewer
INSERT INTO "Role" ("id", "userId", "role", "createdAt")
VALUES (gen_random_uuid(), 'USER_ID_HERE', 'reviewer', NOW());

-- Make user an admin
INSERT INTO "Role" ("id", "userId", "role", "createdAt")
VALUES (gen_random_uuid(), 'USER_ID_HERE', 'admin', NOW());
```

Or use Prisma Studio GUI.

## Deployment

### Vercel (Recommended for Web App)

1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy `apps/web` as the root directory
4. Configure build command: `npm run build`

### Background Jobs

Deploy `packages/jobs` as a separate service:

**Option 1: Long-running server**
- Deploy to Fly.io, Railway, or Render
- Expose `/api/inngest` endpoint
- Set Inngest webhook URL in dashboard

**Option 2: Serverless (AWS Lambda, Vercel Edge Functions)**
- Export Inngest handler as serverless function
- Configure Inngest to call function URL

### Database

Use a managed PostgreSQL provider:
- **Vercel Postgres** (simple integration)
- **Supabase** (includes S3-compatible storage)
- **Neon** (serverless Postgres)
- **PlanetScale** (if migrating to MySQL)

Enable connection pooling for serverless deployments.

### Storage

Use S3-compatible object storage:
- **AWS S3** (classic)
- **Cloudflare R2** (zero egress fees)
- **Supabase Storage** (integrated with Supabase DB)

Configure CDN for fast global delivery.

### Redis

Use a managed Redis:
- **Upstash** (serverless, pay-per-request)
- **Redis Cloud**

Upstash works great with serverless Next.js.

## Testing

### Unit Tests

Run with Jest:
```
npm run test
```

Example test structure:
```
apps/web/__tests__/
├── lib/
│   ├── auth.test.ts
│   ├── cache.test.ts
│   └── rate-limit.test.ts
└── utils/
    └── validators.test.ts
```

### Component Tests

Test components with React Testing Library:
```
apps/web/__tests__/components/
├── feed/
│   ├── clip-card.test.tsx
│   └── audio-player.test.tsx
└── upload/
    └── upload-form.test.tsx
```

### E2E Tests

Run with Playwright:
```
npm run test:e2e
```

Key user flows to test:
- Sign in with email
- Upload clip → review → approve → appears in feed
- Play clip with checkpoints
- Like, save, follow
- Search for clip
- Report clip → admin removes
- Admin dashboard analytics

Example test:
```
apps/web/e2e/upload-flow.spec.ts
```

## Performance Targets

- **Feed API p75**: < 200ms
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

Monitored via PostHog and Sentry.

## Security Checklist

- [x] CSRF protection (Next.js built-in)
- [x] Secure cookies (httpOnly, sameSite, secure in production)
- [x] Input validation (Zod schemas)
- [x] Rate limiting (Redis-based)
- [x] Role-based access control (middleware guards)
- [x] SQL injection prevention (Prisma parameterized queries)
- [x] XSS prevention (React auto-escaping)
- [x] Security headers (CSP, X-Frame-Options, etc.)
- [ ] Audit logs for admin actions
- [ ] User data export/deletion endpoints (GDPR)

## Accessibility

- Use semantic HTML
- Add ARIA labels and roles
- Support keyboard navigation (Tab, Enter, Esc, arrow keys)
- Test with screen readers
- Ensure color contrast meets WCAG AA
- Provide transcripts for all audio content

## RTL (Right-to-Left) Support

The app automatically switches to RTL layout when Arabic is selected:

- Uses `dir="rtl"` attribute
- Tailwind RTL utility classes
- Flips icons with `.rtl\:mirror`
- All text aligns correctly

## Contributing

1. Create a feature branch
2. Implement feature with tests
3. Run type checking: `npm run typecheck`
4. Run linting: `npm run lint`
5. Run tests: `npm run test`
6. Create pull request

## License

MIT

## Support

For issues and questions, visit the [GitHub repository](https://github.com/issaalbalushi/PodkiyaLearning).

---

**Built with ❤️ by the Podkiya team**
