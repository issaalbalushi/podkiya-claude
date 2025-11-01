'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { ClipCard } from './clip-card';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data (replace with tRPC query later)
import { mockClips } from '@/lib/mock-data';

export function InfiniteFeed() {
  const { ref, inView } = useInView();
  const [clips, setClips] = useState(mockClips.slice(0, 6));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (inView && hasMore) {
      // Simulate loading more
      setTimeout(() => {
        const newClips = mockClips.slice(page * 6, (page + 1) * 6);
        if (newClips.length === 0) {
          setHasMore(false);
        } else {
          setClips((prev) => [...prev, ...newClips]);
          setPage((p) => p + 1);
        }
      }, 500);
    }
  }, [inView, page, hasMore]);

  return (
    <div className="space-y-8">
      {/* Grid Layout */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {clips.map((clip, index) => (
            <motion.div
              key={clip.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ClipCard clip={clip} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Loading Indicator */}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* End Message */}
      {!hasMore && (
        <div className="text-center py-12 text-muted-foreground">
          <p>You've reached the end! Check back later for more clips.</p>
        </div>
      )}
    </div>
  );
}
