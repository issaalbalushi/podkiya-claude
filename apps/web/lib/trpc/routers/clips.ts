import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, roleBasedProcedure } from '../server';
import { TRPCError } from '@trpc/server';

export const clipsRouter = router({
  // Get all approved clips (public feed)
  getFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        tagId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const clips = await ctx.db.clip.findMany({
        where: {
          status: 'approved',
          ...(input.tagId && {
            tags: {
              some: {
                tagId: input.tagId,
              },
            },
          }),
        },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: {
            id: input.cursor,
          },
          skip: 1,
        }),
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              likes: true,
              saves: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (clips.length > input.limit) {
        const nextItem = clips.pop();
        nextCursor = nextItem!.id;
      }

      return {
        clips,
        nextCursor,
      };
    }),

  // Get clip by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const clip = await ctx.db.clip.findUnique({
        where: { id: input.id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              bio: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          transcript: true,
          _count: {
            select: {
              likes: true,
              saves: true,
            },
          },
        },
      });

      if (!clip) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Clip not found' });
      }

      return clip;
    }),

  // Get clips by creator
  getByCreator: publicProcedure
    .input(z.object({ creatorId: z.string(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const clips = await ctx.db.clip.findMany({
        where: {
          creatorId: input.creatorId,
          status: 'approved',
        },
        take: input.limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              likes: true,
              saves: true,
            },
          },
        },
      });

      return clips;
    }),

  // Get user's saved clips
  getSaved: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const saved = await ctx.db.save.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        take: input.limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          clip: {
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
              tags: {
                include: {
                  tag: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                  saves: true,
                },
              },
            },
          },
        },
      });

      return saved.map((s) => s.clip);
    }),

  // Get clips pending review
  getPendingReview: roleBasedProcedure(['reviewer', 'admin'])
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const clips = await ctx.db.clip.findMany({
        where: {
          status: 'in_review',
        },
        take: input.limit,
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          reviewTasks: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return clips;
    }),

  // Search clips
  search: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      // Simple Prisma text search (can be replaced with Algolia later)
      const clips = await ctx.db.clip.findMany({
        where: {
          status: 'approved',
          OR: [
            { title: { contains: input.query, mode: 'insensitive' } },
            { description: { contains: input.query, mode: 'insensitive' } },
          ],
        },
        take: input.limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              likes: true,
              saves: true,
            },
          },
        },
      });

      return clips;
    }),

  // Get user's liked clips
  getLiked: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ ctx, input }) => {
      const liked = await ctx.db.like.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        take: input.limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          clip: {
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
              tags: {
                include: {
                  tag: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                  saves: true,
                },
              },
            },
          },
        },
      });

      return liked.map((l) => l.clip);
    }),

  // Get related clips by tags
  getRelated: publicProcedure
    .input(z.object({ clipId: z.string(), limit: z.number().default(6) }))
    .query(async ({ ctx, input }) => {
      // Get the current clip's tags
      const currentClip = await ctx.db.clip.findUnique({
        where: { id: input.clipId },
        include: {
          tags: {
            select: {
              tagId: true,
            },
          },
        },
      });

      if (!currentClip) {
        return [];
      }

      const tagIds = currentClip.tags.map((t) => t.tagId);

      // Find clips with overlapping tags
      const relatedClips = await ctx.db.clip.findMany({
        where: {
          status: 'approved',
          id: { not: input.clipId },
          tags: {
            some: {
              tagId: { in: tagIds },
            },
          },
        },
        take: input.limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              likes: true,
              saves: true,
            },
          },
        },
      });

      return relatedClips;
    }),
});
