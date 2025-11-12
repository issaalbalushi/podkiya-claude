'use server';

import { getServerSession } from 'next-auth';
import { authOptions, getUserRoles } from '@/lib/auth';
import { db } from '@podkiya/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createClip(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  const roles = await getUserRoles(userId);

  // Check if user is a creator or admin
  if (!roles.includes('creator') && !roles.includes('admin')) {
    throw new Error('Only creators can upload clips');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const audioUrl = formData.get('audioUrl') as string;
  const durationSeconds = parseInt(formData.get('durationSeconds') as string);
  const tagIds = JSON.parse(formData.get('tagIds') as string) as string[];

  if (!title || !audioUrl || !durationSeconds) {
    throw new Error('Missing required fields');
  }

  // Create clip
  const clip = await db.clip.create({
    data: {
      title,
      description: description || '',
      audioUrl,
      durationSec: durationSeconds,
      creatorId: userId,
      status: 'in_review', // Automatically go to review
    },
  });

  // Add tags
  if (tagIds && tagIds.length > 0) {
    await db.clipTag.createMany({
      data: tagIds.map((tagId) => ({
        clipId: clip.id,
        tagId,
      })),
    });
  }

  // Create review task (assign to random reviewer if any exist)
  const reviewers = await db.role.findMany({
    where: {
      role: { in: ['reviewer', 'admin'] },
    },
    select: {
      userId: true,
    },
  });

  if (reviewers.length > 0) {
    const randomReviewer = reviewers[Math.floor(Math.random() * reviewers.length)];

    if (randomReviewer) {
      await db.reviewTask.create({
        data: {
          clipId: clip.id,
          reviewerId: randomReviewer.userId,
        },
      });
    }
  }

  revalidatePath('/profile');

  return { clipId: clip.id };
}

export async function updateClip(clipId: string, formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  // Check if user owns the clip
  const clip = await db.clip.findUnique({
    where: { id: clipId },
  });

  if (!clip || clip.creatorId !== userId) {
    throw new Error('Not authorized to update this clip');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  await db.clip.update({
    where: { id: clipId },
    data: {
      title: title || clip.title,
      description: description || clip.description,
    },
  });

  revalidatePath(`/clip/${clipId}`);
  revalidatePath('/profile');

  return { success: true };
}

export async function deleteClip(clipId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  const roles = await getUserRoles(userId);

  // Check if user owns the clip or is admin
  const clip = await db.clip.findUnique({
    where: { id: clipId },
  });

  if (!clip) {
    throw new Error('Clip not found');
  }

  if (clip.creatorId !== userId && !roles.includes('admin')) {
    throw new Error('Not authorized to delete this clip');
  }

  await db.clip.delete({
    where: { id: clipId },
  });

  revalidatePath('/feed');
  revalidatePath('/profile');

  return { success: true };
}
