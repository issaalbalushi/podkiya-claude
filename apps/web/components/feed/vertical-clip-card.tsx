'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, CheckCircle2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@podkiya/core';
import { usePlayerStore } from '@/lib/store/player-store';
import { useSocialStore } from '@/lib/store/social-store';
import { LikeButton, SaveButton, CommentButton, ShareButton, FollowButton } from '@/components/social/social-actions';

interface VerticalClipCardProps {
  clip: {
    id: string;
    title: string;
    description?: string;
    durationSec: number;
    audioUrl: string;
    creator: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
    tags: Array<{ tag: { label_en: string; slug: string } }>;
    _count: {
      likes: number;
      saves: number;
    };
  };
  onComplete?: () => void;
  onSwipeNext?: () => void;
  autoPlay?: boolean;
}

export function VerticalClipCard({ clip, onComplete, onSwipeNext, autoPlay = false }: VerticalClipCardProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [canAdvance, setCanAdvance] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const { setCurrentClip, recordCheckpoint, hasReachedCheckpoint } = usePlayerStore();
  const { incrementSessionClips } = useSocialStore();

  const mainTag = clip.tags[0]?.tag.label_en || 'Learning';

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgba(255, 255, 255, 0.3)',
      progressColor: 'rgba(168, 85, 247, 1)',
      cursorColor: 'rgba(255, 255, 255, 0.8)',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 2,
      height: 80,
      barGap: 2,
      responsive: true,
    });

    wavesurfer.current.load(clip.audioUrl);

    wavesurfer.current.on('ready', () => {
      setDuration(wavesurfer.current!.getDuration());
      if (autoPlay) {
        wavesurfer.current!.play();
        setIsPlaying(true);
        setCurrentClip({ id: clip.id, title: clip.title, audioUrl: clip.audioUrl });
      }
    });

    wavesurfer.current.on('audioprocess', () => {
      const time = wavesurfer.current!.getCurrentTime();
      setCurrentTime(time);

      // Track checkpoints
      if (time >= 30 && time < 31) recordCheckpoint(clip.id, '30s');
      if (time >= 60 && time < 61) recordCheckpoint(clip.id, '60s');
      if (time >= 90 && time < 91) recordCheckpoint(clip.id, '90s');
    });

    wavesurfer.current.on('finish', () => {
      setIsPlaying(false);
      setIsCompleted(true);
      setCanAdvance(true);
      recordCheckpoint(clip.id, 'complete');
      incrementSessionClips();
      onComplete?.();
    });

    wavesurfer.current.on('error', (error) => {
      console.error('WaveSurfer error:', error);
      setAudioError(true);
      setCanAdvance(true); // Allow user to skip if audio fails
    });

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [clip.audioUrl, clip.id, autoPlay]);

  const togglePlay = () => {
    wavesurfer.current?.playPause();
    const playing = !isPlaying;
    setIsPlaying(playing);

    if (playing) {
      setCurrentClip({ id: clip.id, title: clip.title, audioUrl: clip.audioUrl });
    }
  };

  const handleSkip = () => {
    setCanAdvance(true);
  };

  const handleSwipe = () => {
    if (canAdvance || isCompleted) {
      onSwipeNext?.();
    }
  };

  const progress = (currentTime / duration) * 100 || 0;
  const alreadyCompleted = hasReachedCheckpoint(clip.id, 'complete');

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      {/* Topic Badge */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <GraduationCap className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-semibold">{mainTag}</span>
        </div>
      </div>

      {/* Creator Info */}
      <Link href={`/creator/${clip.creator.id}`}>
        <div className="absolute top-20 left-6 z-20 flex items-center gap-3 cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/30 group-hover:ring-white/60 transition">
            {clip.creator.name.charAt(0)}
          </div>
          <div>
            <p className="text-white font-semibold group-hover:underline">{clip.creator.name}</p>
            <p className="text-white/70 text-xs">Creator</p>
          </div>
          <div className="ml-2">
            <FollowButton creatorId={clip.creator.id} creatorName={clip.creator.name} variant="compact" />
          </div>
        </div>
      </Link>

      {/* Central Play Button (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Button
            size="lg"
            onClick={togglePlay}
            className="rounded-full w-20 h-20 shadow-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/40"
          >
            <Play className="w-10 h-10 text-white ml-1" />
          </Button>
        </div>
      )}

      {/* Tap to pause (when playing) */}
      {isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 z-10 cursor-pointer"
          aria-label="Pause"
        />
      )}

      {/* Waveform - Center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
        <div className="w-full max-w-2xl">
          <div ref={waveformRef} className="w-full" />
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        {/* Title & Description */}
        <div className="mb-4">
          <h2 className="text-white text-2xl font-bold mb-2">{clip.title}</h2>
          {clip.description && (
            <p className="text-white/80 text-sm line-clamp-2 mb-3">💡 {clip.description}</p>
          )}

          {/* Progress Bar */}
          <div className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden mb-2">
            <div
              className="absolute top-0 left-0 h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time */}
          <div className="flex justify-between text-white/60 text-xs">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <span>{formatDuration(Math.floor(duration))}</span>
          </div>
        </div>

        {/* Completion Status */}
        {isCompleted && (
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/40 backdrop-blur-md px-4 py-2 rounded-full mb-4 w-fit">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm font-semibold">Completed!</span>
          </div>
        )}

        {/* Audio Error Status */}
        {audioError && (
          <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 backdrop-blur-md px-4 py-2 rounded-full mb-4 w-fit">
            <span className="text-yellow-300 text-sm">⚠️ Audio unavailable - content still viewable</span>
          </div>
        )}

        {/* Skip/Advance Button */}
        {!canAdvance && !alreadyCompleted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-white/60 hover:text-white hover:bg-white/10 mb-4"
          >
            Skip this clip
          </Button>
        )}

        {/* Swipe Indicator */}
        {(canAdvance || isCompleted || alreadyCompleted) && (
          <button
            onClick={handleSwipe}
            className="w-full py-4 text-white/80 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/10 rounded-lg transition"
          >
            <span>⬆</span> Swipe up for next clip
          </button>
        )}
      </div>

      {/* Right Sidebar Actions */}
      <div className="absolute right-4 bottom-32 z-30 flex flex-col gap-6">
        <LikeButton clipId={clip.id} initialCount={clip._count.likes} variant="vertical" />
        <CommentButton clipId={clip.id} variant="vertical" />
        <SaveButton clipId={clip.id} variant="vertical" />
        <ShareButton clipId={clip.id} clipTitle={clip.title} variant="vertical" />
      </div>

      {/* Already Completed Badge */}
      {alreadyCompleted && !isCompleted && (
        <div className="absolute top-6 right-6 z-20">
          <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-green-500/40">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-xs font-semibold">Previously completed</span>
          </div>
        </div>
      )}
    </div>
  );
}
