'use client';

import { usePlayerStore } from '@/lib/store/player-store';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function ContinueLearning() {
  const { currentClip } = usePlayerStore();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!currentClip || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="container mx-auto px-4 py-4"
      >
        <div className="relative bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium opacity-90">Continue Learning</p>
              <p className="font-bold">{currentClip.title}</p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
            >
              Resume
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
