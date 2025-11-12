'use client';

import { useParams, useRouter } from 'next/navigation';
import { AudioPlayer } from '@/components/player/audio-player';
import { trpc } from '@/lib/trpc/client';
import { Heart, Bookmark, Share2, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDuration } from '@podkiya/core';
import { ClipCard } from '@/components/feed/clip-card';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function ClipPage() {
  const params = useParams();
  const router = useRouter();
  const clipId = params.id as string;
  const { data: session, status } = useSession();

  // Fetch clip data
  const { data: clip, isLoading } = trpc.clips.getById.useQuery({ id: clipId });

  // Fetch related clips
  const { data: relatedClips } = trpc.clips.getRelated.useQuery(
    { clipId, limit: 3 },
    { enabled: !!clip }
  );

  // Fetch user interaction state (only when authenticated)
  const { data: isLikedData } = trpc.users.isLiked.useQuery(
    { clipId },
    { enabled: !!clip && status === 'authenticated' }
  );

  const { data: isSavedData } = trpc.users.isSaved.useQuery(
    { clipId },
    { enabled: !!clip && status === 'authenticated' }
  );

  const [showCompletion, setShowCompletion] = useState(false);

  // Get utils for query invalidation
  const utils = trpc.useUtils();

  // Social action mutations
  const toggleLikeMutation = trpc.users.toggleLike.useMutation({
    onSuccess: () => {
      utils.clips.getById.invalidate({ id: clipId });
      utils.users.isLiked.invalidate({ clipId });
    },
  });

  const toggleSaveMutation = trpc.users.toggleSave.useMutation({
    onSuccess: () => {
      utils.users.isSaved.invalidate({ clipId });
    },
  });

  const handleLike = () => {
    if (status !== 'authenticated') {
      router.push('/signin');
      return;
    }
    toggleLikeMutation.mutate({ clipId });
  };

  const handleSave = () => {
    if (status !== 'authenticated') {
      router.push('/signin');
      return;
    }
    toggleSaveMutation.mutate({ clipId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!clip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Clip not found</h1>
          <p className="text-muted-foreground mb-4">
            The clip you're looking for doesn't exist.
          </p>
          <Link href="/explore">
            <Button>Back to Explore</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCompletion = () => {
    setShowCompletion(true);
    setTimeout(() => setShowCompletion(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Link href="/explore">
          <Button variant="ghost" className="mb-6">
            ← Back to Explore
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Meta */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {clip._count.likes > 100 && (
                  <span className="inline-flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    <TrendingUp className="w-3 h-3" />
                    TRENDING
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {formatDuration(clip.durationSec)}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{clip.title}</h1>

              {clip.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {clip.description}
                </p>
              )}
            </div>

            {/* Audio Player */}
            <AudioPlayer
              clipId={clip.id}
              audioUrl={clip.audioUrl}
              title={clip.title}
              onComplete={handleCompletion}
            />

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {clip.tags.map((ct) => (
                <span
                  key={ct.tag.slug}
                  className="text-sm px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium"
                >
                  #{ct.tag.label_en}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                variant={isLikedData ? 'default' : 'outline'}
                onClick={handleLike}
                disabled={toggleLikeMutation.isLoading}
                className="rounded-full"
              >
                <Heart
                  className="w-4 h-4 mr-2"
                  fill={isLikedData ? 'currentColor' : 'none'}
                />
                {clip._count.likes} Likes
              </Button>

              <Button
                variant={isSavedData ? 'default' : 'outline'}
                onClick={handleSave}
                disabled={toggleSaveMutation.isLoading}
                className="rounded-full"
              >
                <Bookmark
                  className="w-4 h-4 mr-2"
                  fill={isSavedData ? 'currentColor' : 'none'}
                />
                {isSavedData ? 'Saved' : 'Save'}
              </Button>

              <Button variant="outline" className="rounded-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <div className="bg-card rounded-2xl border p-6">
              <h3 className="font-semibold mb-4">Creator</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {clip.creator.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{clip.creator.name}</p>
                  <p className="text-sm text-muted-foreground">Content Creator</p>
                </div>
              </div>
              <Button className="w-full rounded-full">Follow</Button>
            </div>

            {/* Stats */}
            <div className="bg-card rounded-2xl border p-6">
              <h3 className="font-semibold mb-4">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Likes</span>
                  <span className="font-semibold">{clip._count.likes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saves</span>
                  <span className="font-semibold">{clip._count.saves}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold">{formatDuration(clip.durationSec)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Clips */}
        {relatedClips.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">More Like This</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedClips.map((relatedClip) => (
                <ClipCard key={relatedClip.id} clip={relatedClip} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Completion Celebration */}
      {showCompletion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="bg-green-500 text-white rounded-full p-12 shadow-2xl">
            <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>
      )}
    </div>
  );
}
