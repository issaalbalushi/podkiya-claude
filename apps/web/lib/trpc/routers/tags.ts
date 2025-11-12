import { z } from 'zod';
import { router, publicProcedure } from '../server';

export const tagsRouter = router({
  // Get all tags
  getAll: publicProcedure.query(async ({ ctx }) => {
    const tags = await ctx.db.tag.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            clips: true,
          },
        },
      },
    });

    return tags;
  }),

  // Get popular tags
  getPopular: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const tags = await ctx.db.tag.findMany({
        take: input.limit,
        orderBy: {
          clips: {
            _count: 'desc',
          },
        },
        include: {
          _count: {
            select: {
              clips: true,
            },
          },
        },
      });

      return tags;
    }),

  // Get tag by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.findUnique({
        where: { slug: input.slug },
        include: {
          _count: {
            select: {
              clips: true,
            },
          },
        },
      });

      return tag;
    }),
});
