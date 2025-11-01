'use client';

import { usePathname } from 'next/navigation';
import { usePlayerStore } from '@/lib/store/player-store';
import { Play, Pause, SkipForward, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function MiniPlayer() {
  const pathname = usePathname();
  const { currentClip, isPlaying, setIsPlaying, setCurrentClip } = usePlayerStore();

  // Don't show mini player on /feed (full screen experience) or if no clip
  if (!currentClip || pathname === '/feed') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t shadow-2xl"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-full"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{currentClip.title}</p>
              <p className="text-xs text-muted-foreground">Now Playing</p>
            </div>

            {/* Actions */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <SkipForward className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentClip(null)}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-600"
              initial={{ width: '0%' }}
              animate={{ width: '50%' }}
              transition={{ duration: 2 }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
