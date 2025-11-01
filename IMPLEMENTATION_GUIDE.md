# Podkiya Implementation Guide

This guide provides code templates and patterns for implementing the remaining features in `apps/web`.

## Table of Contents

1. [App Layout & Providers](#app-layout--providers)
2. [Server Actions Pattern](#server-actions-pattern)
3. [tRPC Router Pattern](#trpc-router-pattern)
4. [Page Component Pattern](#page-component-pattern)
5. [Feature Component Examples](#feature-component-examples)
6. [Quick Reference Checklist](#quick-reference-checklist)

---

## App Layout & Providers

### `app/layout.tsx`

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Providers } from './providers';
import './globals.css';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const session = await getServerSession(authOptions);

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers session={session}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### `app/providers.tsx`

```typescript
'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/lib/theme-provider';
import { TRPCProvider } from '@/lib/trpc/provider';
import { PostHogProvider } from '@/lib/analytics/posthog-provider';
import { Toaster } from 'react-hot-toast';

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <PostHogProvider>
          <TRPCProvider>
            {children}
            <Toaster position="top-right" />
          </TRPCProvider>
        </PostHogProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
```

---

## Server Actions Pattern

### `app/actions/clips.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { db } from '@podkiya/db';
import { createClipSchema } from '@podkiya/core';
import { authOptions, hasRole } from '@/lib/auth';
import { RateLimiter } from '@/lib/rate-limit';
import { inngest } from '@podkiya/jobs';
import { StorageService } from '@podkiya/jobs';

export async function uploadClip(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Check creator role
  if (!hasRole(session.user.roles, 'creator')) {
    throw new Error('Creator role required');
  }

  // Rate limiting
  const canUpload = await RateLimiter.checkUpload(session.user.id);
  if (!canUpload) {
    throw new Error('Upload limit exceeded');
  }

  // Parse and validate input
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const language = formData.get('language') as string;
  const tagIds = JSON.parse(formData.get('tagIds') as string);
  const audioFile = formData.get('audioFile') as File;

  const validated = createClipSchema.parse({
    title,
    description,
    language,
    tagIds,
  });

  // Create clip record
  const clip = await db.clip.create({
    data: {
      creatorId: session.user.id,
      title: validated.title,
      description: validated.description,
      language: validated.language,
      status: 'draft',
      tags: {
        create: validated.tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  // Get presigned upload URL
  const { uploadUrl, key } = await StorageService.getUploadUrl(
    clip.id,
    audioFile.type
  );

  // Upload audio to S3
  await fetch(uploadUrl, {
    method: 'PUT',
    body: audioFile,
    headers: { 'Content-Type': audioFile.type },
  });

  // Convert to buffer and trigger processing
  const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

  // Trigger background job
  await inngest.send({
    name: 'clip/uploaded',
    data: {
      clipId: clip.id,
      audioBuffer: audioBuffer.toString('base64'),
    },
  });

  revalidatePath('/feed');
  revalidatePath('/profile');

  return { success: true, clipId: clip.id };
}

export async function deleteClip(clipId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  const clip = await db.clip.findUnique({ where: { id: clipId } });
  if (!clip) throw new Error('Clip not found');

  // Check ownership or admin
  const isOwner = clip.creatorId === session.user.id;
  const isAdmin = hasRole(session.user.roles, 'admin');

  if (!isOwner && !isAdmin) {
    throw new Error('Unauthorized');
  }

  await db.clip.delete({ where: { id: clipId } });

  revalidatePath('/feed');
  revalidatePath('/profile');

  return { success: true };
}
```

### `app/actions/review.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { db } from '@podkiya/db';
import { reviewActionSchema, NOTIFICATION_TYPES } from '@podkiya/core';
import { authOptions, hasRole } from '@/lib/auth';
import { Cache } from '@/lib/cache';
import { inngest } from '@podkiya/jobs';

export async function reviewClip(input: {
  clipId: string;
  action: 'approve' | 'reject';
  notes?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  if (!hasRole(session.user.roles, 'reviewer')) {
    throw new Error('Reviewer role required');
  }

  const validated = reviewActionSchema.parse(input);

  const clip = await db.clip.findUnique({
    where: { id: validated.clipId },
    include: { creator: true },
  });

  if (!clip) throw new Error('Clip not found');

  if (validated.action === 'approve') {
    // Approve clip
    await db.clip.update({
      where: { id: validated.clipId },
      data: {
        status: 'approved',
        publishedAt: new Date(),
      },
    });

    // Update review task
    await db.reviewTask.updateMany({
      where: { clipId: validated.clipId },
      data: {
        status: 'approved',
        notes: validated.notes,
        reviewerId: session.user.id,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: clip.creatorId,
        type: NOTIFICATION_TYPES.CLIP_APPROVED,
        dataJson: JSON.stringify({
          clipId: clip.id,
          clipTitle: clip.title,
          reviewerId: session.user.id,
        }),
      },
    });

    // Trigger search indexing
    await inngest.send({
      name: 'clip/updated',
      data: { clipId: validated.clipId },
    });
  } else {
    // Reject clip
    await db.clip.update({
      where: { id: validated.clipId },
      data: {
        status: 'rejected',
        rejectionReason: validated.notes || 'Did not meet quality standards',
      },
    });

    await db.reviewTask.updateMany({
      where: { clipId: validated.clipId },
      data: {
        status: 'rejected',
        notes: validated.notes,
        reviewerId: session.user.id,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: clip.creatorId,
        type: NOTIFICATION_TYPES.CLIP_REJECTED,
        dataJson: JSON.stringify({
          clipId: clip.id,
          clipTitle: clip.title,
          reason: validated.notes,
        }),
      },
    });
  }

  // Invalidate caches
  await Cache.invalidateFeed();
  revalidatePath('/review');
  revalidatePath('/feed');

  return { success: true };
}
```

### `app/actions/social.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { db } from '@podkiya/db';
import { authOptions } from '@/lib/auth';
import { RateLimiter } from '@/lib/rate-limit';

export async function toggleLike(clipId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  const canLike = await RateLimiter.checkLike(session.user.id);
  if (!canLike) throw new Error('Rate limit exceeded');

  const existing = await db.like.findUnique({
    where: {
      userId_clipId: {
        userId: session.user.id,
        clipId,
      },
    },
  });

  if (existing) {
    await db.like.delete({ where: { userId_clipId: { userId: session.user.id, clipId } } });
    return { liked: false };
  } else {
    await db.like.create({
      data: { userId: session.user.id, clipId },
    });
    return { liked: true };
  }
}

export async function toggleFollow(followingUserId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  const canFollow = await RateLimiter.checkFollow(session.user.id);
  if (!canFollow) throw new Error('Rate limit exceeded');

  const existing = await db.follow.findUnique({
    where: {
      followerId_followingUserId: {
        followerId: session.user.id,
        followingUserId,
      },
    },
  });

  if (existing) {
    await db.follow.delete({
      where: {
        followerId_followingUserId: {
          followerId: session.user.id,
          followingUserId,
        },
      },
    });
    return { following: false };
  } else {
    await db.follow.create({
      data: { followerId: session.user.id, followingUserId },
    });

    // Notify user
    await db.notification.create({
      data: {
        userId: followingUserId,
        type: 'NEW_FOLLOWER',
        dataJson: JSON.stringify({ followerId: session.user.id }),
      },
    });

    return { following: true };
  }
}
```

---

## tRPC Router Pattern

### `lib/trpc/routers/clips.ts`

```typescript
import { z } from 'zod';
import { db } from '@podkiya/db';
import { feedFiltersSchema } from '@podkiya/core';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { Cache } from '@/lib/cache';

export const clipsRouter = router({
  getFeed: publicProcedure
    .input(feedFiltersSchema)
    .query(async ({ input, ctx }) => {
      const { language, cursor, limit = 20 } = input;

      // Try cache for anonymous users
      if (!ctx.session) {
        const cached = await Cache.getFeed(language || 'en', 0);
        if (cached) return cached;
      }

      const clips = await db.clip.findMany({
        where: {
          status: 'approved',
          language: language || undefined,
        },
        orderBy: { publishedAt: 'desc' },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          creator: true,
          tags: { include: { tag: true } },
          _count: { select: { likes: true, saves: true } },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (clips.length > limit) {
        const nextItem = clips.pop();
        nextCursor = nextItem!.id;
      }

      // Add user-specific data if authenticated
      let clipsWithUserData = clips;
      if (ctx.session) {
        clipsWithUserData = await Promise.all(
          clips.map(async (clip) => {
            const [isLiked, isSaved] = await Promise.all([
              db.like.findUnique({
                where: {
                  userId_clipId: {
                    userId: ctx.session!.user.id,
                    clipId: clip.id,
                  },
                },
              }),
              db.save.findUnique({
                where: {
                  userId_clipId: {
                    userId: ctx.session!.user.id,
                    clipId: clip.id,
                  },
                },
              }),
            ]);

            return {
              ...clip,
              isLiked: !!isLiked,
              isSaved: !!isSaved,
            };
          })
        );
      }

      const result = { clips: clipsWithUserData, nextCursor };

      // Cache for anonymous
      if (!ctx.session) {
        await Cache.setFeed(language || 'en', 0, result);
      }

      return result;
    }),

  getClipById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const clip = await db.clip.findUnique({
        where: { id: input.id },
        include: {
          creator: true,
          tags: { include: { tag: true } },
          transcript: true,
          _count: { select: { likes: true, saves: true, playEvents: true } },
        },
      });

      if (!clip) throw new Error('Clip not found');
      return clip;
    }),
});
```

---

## Page Component Pattern

### `app/(main)/feed/page.tsx`

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FeedList } from '@/features/feed/feed-list';
import { useTranslations } from 'next-intl';

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  const t = useTranslations('feed');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <FeedList userId={session?.user?.id} />
    </div>
  );
}
```

---

## Feature Component Examples

### `features/feed/feed-list.tsx`

```typescript
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { ClipCard } from './clip-card';
import { useTranslations } from 'next-intl';

export function FeedList({ userId }: { userId?: string }) {
  const t = useTranslations('feed');
  const [language, setLanguage] = useState<string>('en');

  const { data, fetchNextPage, hasNextPage, isLoading } =
    trpc.clips.getFeed.useInfiniteQuery(
      { language, limit: 20 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  const clips = data?.pages.flatMap((page) => page.clips) ?? [];

  if (clips.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold">{t('empty')}</h3>
        <p className="text-muted-foreground">{t('emptyDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} />
      ))}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          className="w-full py-3 border rounded-lg hover:bg-accent"
        >
          Load More
        </button>
      )}
    </div>
  );
}
```

### `features/feed/clip-card.tsx`

```typescript
'use client';

import { useState, useTransition } from 'react';
import { AudioPlayer } from './audio-player';
import { Heart, Bookmark, Share2 } from 'lucide-react';
import { toggleLike, toggleSave } from '@/app/actions/social';
import { formatDuration, formatRelativeTime } from '@podkiya/core';

export function ClipCard({ clip }: { clip: any }) {
  const [isPending, startTransition] = useTransition();
  const [liked, setLiked] = useState(clip.isLiked);
  const [saved, setSaved] = useState(clip.isSaved);

  const handleLike = () => {
    startTransition(async () => {
      const result = await toggleLike(clip.id);
      setLiked(result.liked);
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await toggleSave(clip.id);
      setSaved(result.saved);
    });
  };

  return (
    <div className="border rounded-lg p-6" data-testid="clip-card">
      <div className="flex items-start gap-4">
        <img
          src={clip.creator.avatarUrl || '/default-avatar.png'}
          alt={clip.creator.name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{clip.title}</h3>
          <p className="text-sm text-muted-foreground">
            {clip.creator.name} · {formatRelativeTime(new Date(clip.publishedAt))}
          </p>
          {clip.description && (
            <p className="mt-2 text-sm">{clip.description}</p>
          )}

          <AudioPlayer
            audioUrl={clip.audioUrl}
            waveformUrl={clip.waveformJsonUrl}
            clipId={clip.id}
            duration={clip.durationSec}
          />

          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={handleLike}
              disabled={isPending}
              className={liked ? 'text-red-500' : ''}
              aria-label="Like"
              aria-pressed={liked}
            >
              <Heart className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
              <span className="ml-1 text-sm">{clip._count.likes}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isPending}
              className={saved ? 'text-blue-500' : ''}
              aria-label="Save"
              aria-pressed={saved}
            >
              <Bookmark className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} />
            </button>

            <button aria-label="Share">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Quick Reference Checklist

### Core Files to Create

#### Auth & Layout
- [ ] `app/layout.tsx` - Root layout
- [ ] `app/providers.tsx` - Client providers
- [ ] `lib/theme-provider.tsx` - Dark/light theme
- [ ] `app/api/auth/[...nextauth]/route.ts` - NextAuth route

#### API Routes
- [ ] `app/api/trpc/[trpc]/route.ts` - tRPC endpoint
- [ ] `app/api/inngest/route.ts` - Inngest webhook
- [ ] `app/api/upload/route.ts` - Presigned URL generation

#### Server Actions
- [ ] `app/actions/clips.ts` - Upload, delete clips
- [ ] `app/actions/review.ts` - Approve, reject
- [ ] `app/actions/social.ts` - Like, save, follow
- [ ] `app/actions/admin.ts` - Admin operations
- [ ] `app/actions/notifications.ts` - Mark as read

#### tRPC Routers
- [ ] `lib/trpc/trpc.ts` - tRPC setup
- [ ] `lib/trpc/routers/clips.ts` - Clip queries
- [ ] `lib/trpc/routers/users.ts` - User queries
- [ ] `lib/trpc/routers/search.ts` - Search
- [ ] `lib/trpc/routers/admin.ts` - Admin queries

#### Pages
- [ ] `app/(main)/page.tsx` - Home
- [ ] `app/(main)/feed/page.tsx` - Feed
- [ ] `app/(main)/upload/page.tsx` - Upload
- [ ] `app/(main)/review/page.tsx` - Review
- [ ] `app/(main)/search/page.tsx` - Search
- [ ] `app/(main)/u/[username]/page.tsx` - Profile
- [ ] `app/(main)/following/page.tsx` - Following feed
- [ ] `app/(main)/notifications/page.tsx` - Notifications
- [ ] `app/(main)/admin/page.tsx` - Admin dashboard

#### Components
- [ ] `features/feed/feed-list.tsx`
- [ ] `features/feed/clip-card.tsx`
- [ ] `features/feed/audio-player.tsx`
- [ ] `features/upload/upload-form.tsx`
- [ ] `features/review/review-queue.tsx`
- [ ] `features/profile/profile-header.tsx`
- [ ] `features/search/search-bar.tsx`
- [ ] `features/admin/stats-cards.tsx`
- [ ] `components/nav/header.tsx`
- [ ] `components/nav/user-menu.tsx`

---

Use this guide as a reference for implementing each feature. Copy patterns and adapt to your specific needs.
