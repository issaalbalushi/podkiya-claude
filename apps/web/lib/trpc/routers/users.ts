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

  // Toggle like on a clip
  toggleLike: protectedProcedure
    .input(z.object({ clipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.like.findUnique({
        where: {
          userId_clipId: {
            userId: ctx.session.user.id,
            clipId: input.clipId,
          },
        },
      });

      if (existing) {
        await ctx.db.like.delete({
          where: {
            userId_clipId: {
              userId: ctx.session.user.id,
              clipId: input.clipId,
            },
          },
        });
        return { liked: false };
      } else {
        await ctx.db.like.create({
          data: {
            userId: ctx.session.user.id,
            clipId: input.clipId,
          },
        });
        return { liked: true };
      }
    }),

  // Toggle save on a clip
  toggleSave: protectedProcedure
    .input(z.object({ clipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.save.findUnique({
        where: {
          userId_clipId: {
            userId: ctx.session.user.id,
            clipId: input.clipId,
          },
        },
      });

      if (existing) {
        await ctx.db.save.delete({
          where: {
            userId_clipId: {
              userId: ctx.session.user.id,
              clipId: input.clipId,
            },
          },
        });
        return { saved: false };
      } else {
        await ctx.db.save.create({
          data: {
            userId: ctx.session.user.id,
            clipId: input.clipId,
          },
        });
        return { saved: true };
      }
    }),

  // Toggle follow on a user
  toggleFollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot follow yourself' });
      }

      const existing = await ctx.db.follow.findUnique({
        where: {
          followerId_followingUserId: {
            followerId: ctx.session.user.id,
            followingUserId: input.userId,
          },
        },
      });

      if (existing) {
        await ctx.db.follow.delete({
          where: {
            followerId_followingUserId: {
              followerId: ctx.session.user.id,
              followingUserId: input.userId,
            },
          },
        });
        return { following: false };
      } else {
        await ctx.db.follow.create({
          data: {
            followerId: ctx.session.user.id,
            followingUserId: input.userId,
          },
        });
        return { following: true };
      }
    }),

  // Update play progress
  updatePlayProgress: protectedProcedure
    .input(
      z.object({
        clipId: z.string(),
        checkpoint: z.enum(['c30', 'c60', 'c90', 'completed']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find or create play event
      const existing = await ctx.db.playEvent.findFirst({
        where: {
          userId: ctx.session.user.id,
          clipId: input.clipId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const checkpointData = {
        c30: input.checkpoint === 'c30' || input.checkpoint === 'c60' || input.checkpoint === 'c90' || input.checkpoint === 'completed',
        c60: input.checkpoint === 'c60' || input.checkpoint === 'c90' || input.checkpoint === 'completed',
        c90: input.checkpoint === 'c90' || input.checkpoint === 'completed',
        completed: input.checkpoint === 'completed',
      };

      if (existing) {
        await ctx.db.playEvent.update({
          where: { id: existing.id },
          data: checkpointData,
        });
      } else {
        await ctx.db.playEvent.create({
          data: {
            userId: ctx.session.user.id,
            clipId: input.clipId,
            ...checkpointData,
          },
        });
      }

      return { success: true };
    }),

  // Get completed clips
  getCompletedClips: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ ctx, input }) => {
      const completedEvents = await ctx.db.playEvent.findMany({
        where: {
          userId: ctx.session.user.id,
          completed: true,
        },
        take: input.limit,
        orderBy: {
          updatedAt: 'desc',
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

      return completedEvents.map((event) => event.clip);
    }),
});
