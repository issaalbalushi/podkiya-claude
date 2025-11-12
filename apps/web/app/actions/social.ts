'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@podkiya/db';
import { revalidatePath } from 'next/cache';

// Like a clip
export async function likeClip(clipId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  // Check if already liked
  const existing = await db.like.findUnique({
    where: {
      userId_clipId: {
        userId,
        clipId,
      },
    },
  });

  if (existing) {
    // Unlike
    await db.like.delete({
      where: {
        userId_clipId: {
          userId,
          clipId,
        },
      },
    });

    revalidatePath('/feed');
    revalidatePath(`/clip/${clipId}`);

    return { liked: false };
  } else {
    // Like
    await db.like.create({
      data: {
        userId,
        clipId,
      },
    });

    // Create notification for clip creator
    const clip = await db.clip.findUnique({
      where: { id: clipId },
      select: { creatorId: true },
    });

    if (clip && clip.creatorId !== userId) {
      await db.notification.create({
        data: {
          userId: clip.creatorId,
          type: 'NEW_LIKE',
          dataJson: JSON.stringify({
            clipId,
            likerId: userId,
          }),
        },
      });
    }

    revalidatePath('/feed');
    revalidatePath(`/clip/${clipId}`);

    return { liked: true };
  }
}

// Save a clip
export async function saveClip(clipId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  // Check if already saved
  const existing = await db.save.findUnique({
    where: {
      userId_clipId: {
        userId,
        clipId,
      },
    },
  });

  if (existing) {
    // Unsave
    await db.save.delete({
      where: {
        userId_clipId: {
          userId,
          clipId,
        },
      },
    });

    revalidatePath('/feed');
    revalidatePath(`/clip/${clipId}`);
    revalidatePath('/profile');

    return { saved: false };
  } else {
    // Save
    await db.save.create({
      data: {
        userId,
        clipId,
      },
    });

    // Create notification for clip creator
    const clip = await db.clip.findUnique({
      where: { id: clipId },
      select: { creatorId: true },
    });

    if (clip && clip.creatorId !== userId) {
      await db.notification.create({
        data: {
          userId: clip.creatorId,
          type: 'NEW_SAVE',
          dataJson: JSON.stringify({
            clipId,
            saverId: userId,
          }),
        },
      });
    }

    revalidatePath('/feed');
    revalidatePath(`/clip/${clipId}`);
    revalidatePath('/profile');

    return { saved: true };
  }
}

// Follow a user
export async function followUser(followingId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  if (userId === followingId) {
    throw new Error('Cannot follow yourself');
  }

  // Check if already following
  const existing = await db.follow.findUnique({
    where: {
      followerId_followingUserId: {
        followerId: userId,
        followingUserId: followingId,
      },
    },
  });

  if (existing) {
    // Unfollow
    await db.follow.delete({
      where: {
        followerId_followingUserId: {
          followerId: userId,
          followingUserId: followingId,
        },
      },
    });

    revalidatePath(`/creator/${followingId}`);
    revalidatePath('/profile');

    return { following: false };
  } else {
    // Follow
    await db.follow.create({
      data: {
        followerId: userId,
        followingUserId: followingId,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: followingId,
        type: 'NEW_FOLLOWER',
        dataJson: JSON.stringify({
          followerId: userId,
        }),
      },
    });

    revalidatePath(`/creator/${followingId}`);
    revalidatePath('/profile');

    return { following: true };
  }
}

// Track play event
export async function trackPlayEvent(clipId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // Allow anonymous play tracking
    return;
  }

  const userId = session.user.id;

  await db.playEvent.create({
    data: {
      userId,
      clipId,
    },
  });
}
