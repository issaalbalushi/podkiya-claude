'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Bookmark, Play, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatDuration } from '@podkiya/core';
import { usePlayerStore } from '@/lib/store/player-store';
import Link from 'next/link';

interface ClipCardProps {
  clip: {
    id: string;
    title: string;
    description?: string;
    durationSec: number;
    audioUrl: string;
    thumbUrl?: string;
    creator: {
      name: string;
      avatarUrl?: string;
    };
    tags: Array<{ tag: { label_en: string; slug: string } }>;
    _count: {
      likes: number;
      saves: number;
    };
  };
}

export function ClipCard({ clip }: ClipCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { hasReachedCheckpoint } = usePlayerStore();
  const progress = hasReachedCheckpoint(clip.id, 'complete')
    ? 100
    : hasReachedCheckpoint(clip.id, '90s')
    ? 90
    : hasReachedCheckpoint(clip.id, '60s')
    ? 60
    : hasReachedCheckpoint(clip.id, '30s')
    ? 30
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Progress Ring (if started) */}
      {progress > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <svg className="w-12 h-12 -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${(progress / 100) * 125.6} 125.6`}
              className="text-purple-600"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
            {progress}%
          </div>
        </div>
      )}

      {/* Thumbnail */}
      <Link href={`/clip/${clip.id}`}>
        <div className="relative aspect-video bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 cursor-pointer">
          {clip.thumbUrl ? (
            <img
              src={clip.thumbUrl}
              alt={clip.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white/20 text-6xl font-bold">
                {clip.title.charAt(0)}
              </div>
            </div>
          )}

          {/* Play Button Overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.9,
            }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm"
          >
            <Button
              size="lg"
              className="rounded-full w-16 h-16 shadow-2xl"
            >
              <Play className="w-8 h-8 ml-1" />
            </Button>
          </motion.div>

          {/* Duration Chip */}
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(clip.durationSec)}
          </div>

          {/* Trending Badge (if applicable) */}
          {clip._count.likes > 100 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              HOT
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Link href={`/clip/${clip.id}`}>
          <h3 className="font-semibold text-lg line-clamp-2 hover:text-purple-600 transition cursor-pointer">
            {clip.title}
          </h3>
        </Link>

        {/* Description */}
        {clip.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {clip.description}
          </p>
        )}

        {/* Progress Bar (visual feedback) */}
        {progress > 0 && progress < 100 && (
          <div className="space-y-1">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {progress}% complete
            </p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {clip.tags.slice(0, 3).map((ct) => (
            <span
              key={ct.tag.slug}
              className="text-xs px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium"
            >
              #{ct.tag.label_en}
            </span>
          ))}
        </div>

        {/* Creator */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
            {clip.creator.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{clip.creator.name}</p>
            <p className="text-xs text-muted-foreground">Creator</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
            className={isLiked ? 'text-red-500' : ''}
          >
            <Heart
              className="w-4 h-4 mr-1"
              fill={isLiked ? 'currentColor' : 'none'}
            />
            {clip._count.likes + (isLiked ? 1 : 0)}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSaved(!isSaved)}
            className={isSaved ? 'text-blue-500' : ''}
          >
            <Bookmark
              className="w-4 h-4"
              fill={isSaved ? 'currentColor' : 'none'}
            />
          </Button>

          <div className="flex-1" />

          <Link href={`/clip/${clip.id}`}>
            <Button variant="outline" size="sm">
              Listen
            </Button>
          </Link>
        </div>
      </div>

      {/* Completion Animation */}
      {progress === 100 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white rounded-full p-4 shadow-xl"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
