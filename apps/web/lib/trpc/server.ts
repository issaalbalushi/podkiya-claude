import { initTRPC, TRPCError } from '@trpc/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@podkiya/db';
import superjson from 'superjson';

// Create context for tRPC requests
export async function createTRPCContext() {
  const session = await getServerSession(authOptions);

  return {
    session,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Role-based procedure - requires specific role
export const roleBasedProcedure = (requiredRoles: string[]) =>
  protectedProcedure.use(async ({ ctx, next }) => {
    const userId = ctx.session.user.id;
    const roles = await db.role.findMany({
      where: { userId },
      select: { role: true },
    });

    const userRoles = roles.map((r) => r.role);
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return next({ ctx });
  });
