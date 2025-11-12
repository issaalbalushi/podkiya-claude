import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../server';
import { TRPCError } from '@trpc/server';

export const usersRouter = router({
  // Get user profile
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
          _count: {
            select: {
              clipsCreated: true,
              following: true,
              followedBy: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      return user;
    }),

  // Get current user profile
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        roles: {
          select: {
            role: true,
          },
        },
        _count: {
          select: {
            clipsCreated: true,
            following: true,
            followedBy: true,
            likes: true,
            saves: true,
          },
        },
      },
    });

    return user;
  }),

  // Update profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        bio: z.string().max(500).optional(),
        avatarUrl: z.string().url().optional(),
        languagePref: z.enum(['en', 'ar']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });

      return updated;
    }),

  // Get following feed
  getFollowingFeed: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const following = await ctx.db.follow.findMany({
        where: {
          followerId: ctx.session.user.id,
        },
        select: {
          followingUserId: true,
        },
      });

      const followingIds = following.map((f) => f.followingId);

      const clips = await ctx.db.clip.findMany({
        where: {
          creatorId: { in: followingIds },
          status: 'APPROVED',
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

  // Check if following a user
  isFollowing: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const follow = await ctx.db.follow.findUnique({
        where: {
          followerId_followingUserId: {
            followerId: ctx.session.user.id,
            followingUserId: input.userId,
          },
        },
      });

      return !!follow;
    }),

  // Check if clip is liked
  isLiked: protectedProcedure
    .input(z.object({ clipId: z.string() }))
    .query(async ({ ctx, input }) => {
      const like = await ctx.db.like.findUnique({
        where: {
          userId_clipId: {
            userId: ctx.session.user.id,
            clipId: input.clipId,
          },
        },
      });

      return !!like;
    }),

  // Check if clip is saved
  isSaved: protectedProcedure
    .input(z.object({ clipId: z.string() }))
    .query(async ({ ctx, input }) => {
      const save = await ctx.db.save.findUnique({
        where: {
          userId_clipId: {
            userId: ctx.session.user.id,
            clipId: input.clipId,
          },
        },
      });

      return !!save;
    }),
});
