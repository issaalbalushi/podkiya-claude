import { router } from './server';
import { clipsRouter } from './routers/clips';
import { usersRouter } from './routers/users';
import { tagsRouter } from './routers/tags';

export const appRouter = router({
  clips: clipsRouter,
  users: usersRouter,
  tags: tagsRouter,
});

export type AppRouter = typeof appRouter;
