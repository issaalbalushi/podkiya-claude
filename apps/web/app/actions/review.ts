'use server';

import { getServerSession } from 'next-auth';
import { authOptions, getUserRoles } from '@/lib/auth';
import { db } from '@podkiya/db';
import { revalidatePath } from 'next/cache';

export async function approveClip(clipId: string, reviewNotes?: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  const roles = await getUserRoles(userId);

  if (!roles.includes('reviewer') && !roles.includes('admin')) {
    throw new Error('Only reviewers can approve clips');
  }

  // Update clip status
  await db.clip.update({
    where: { id: clipId },
    data: {
      status: 'approved',
    },
  });

  // Update review task
  await db.reviewTask.updateMany({
    where: {
      clipId,
      reviewerId: userId,
    },
    data: {
      status: 'approved',
      notes: reviewNotes,
    },
  });

  // Get clip creator
  const clip = await db.clip.findUnique({
    where: { id: clipId },
    select: { creatorId: true },
  });

  // Notify creator
  if (clip) {
    await db.notification.create({
      data: {
        userId: clip.creatorId,
        type: 'CLIP_APPROVED',
        dataJson: JSON.stringify({
          clipId,
          reviewerId: userId,
          reviewNotes,
        }),
      },
    });
  }

  revalidatePath('/review');
  revalidatePath('/feed');
  revalidatePath(`/clip/${clipId}`);

  return { success: true, status: 'approved' };
}

export async function rejectClip(clipId: string, reviewNotes: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  const roles = await getUserRoles(userId);

  if (!roles.includes('reviewer') && !roles.includes('admin')) {
    throw new Error('Only reviewers can reject clips');
  }

  if (!reviewNotes) {
    throw new Error('Review notes are required when rejecting a clip');
  }

  // Update clip status
  await db.clip.update({
    where: { id: clipId },
    data: {
      status: 'rejected',
    },
  });

  // Update review task
  await db.reviewTask.updateMany({
    where: {
      clipId,
      reviewerId: userId,
    },
    data: {
      status: 'rejected',
      notes: reviewNotes,
    },
  });

  // Get clip creator
  const clip = await db.clip.findUnique({
    where: { id: clipId },
    select: { creatorId: true },
  });

  // Notify creator
  if (clip) {
    await db.notification.create({
      data: {
        userId: clip.creatorId,
        type: 'CLIP_REJECTED',
        dataJson: JSON.stringify({
          clipId,
          reviewerId: userId,
          reviewNotes,
        }),
      },
    });
  }

  revalidatePath('/review');
  revalidatePath(`/clip/${clipId}`);

  return { success: true, status: 'rejected' };
}

export async function requestChanges(clipId: string, reviewNotes: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  const roles = await getUserRoles(userId);

  if (!roles.includes('reviewer') && !roles.includes('admin')) {
    throw new Error('Only reviewers can request changes');
  }

  if (!reviewNotes) {
    throw new Error('Review notes are required when requesting changes');
  }

  // Update review task
  await db.reviewTask.updateMany({
    where: {
      clipId,
      reviewerId: userId,
    },
    data: {
      notes: reviewNotes,
    },
  });

  // Get clip creator
  const clip = await db.clip.findUnique({
    where: { id: clipId },
    select: { creatorId: true },
  });

  // Notify creator
  if (clip) {
    await db.notification.create({
      data: {
        userId: clip.creatorId,
        type: 'CLIP_REJECTED',
        dataJson: JSON.stringify({
          clipId,
          reviewerId: userId,
          reviewNotes,
          changesRequested: true,
        }),
      },
    });
  }

  revalidatePath('/review');

  return { success: true };
}
