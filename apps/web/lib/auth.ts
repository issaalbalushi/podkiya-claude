import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@podkiya/db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    // Credentials provider for local development
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        // Find or create user (for local dev, auto-create users)
        let user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          // Auto-create user for local dev
          user = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
            },
          });

          // Assign default viewer role
          await db.role.create({
            data: {
              userId: user.id,
              role: 'viewer',
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;

        // Fetch user roles
        const roles = await db.role.findMany({
          where: { userId: token.id as string },
          select: { role: true },
        });

        session.user.roles = roles.map((r) => r.role);
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt', // Using JWT for credentials provider
  },
};

// Auth helpers
export async function getUserRoles(userId: string): Promise<string[]> {
  const roles = await db.role.findMany({
    where: { userId },
    select: { role: true },
  });
  return roles.map((r) => r.role);
}

export function hasRole(roles: string[], requiredRole: string): boolean {
  return roles.includes(requiredRole);
}

export function hasAnyRole(roles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some((role) => roles.includes(role));
}
