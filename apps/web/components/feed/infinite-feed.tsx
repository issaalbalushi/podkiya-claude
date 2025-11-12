'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { ClipCard } from './clip-card';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

export function InfiniteFeed() {
  const { ref, inView } = useInView();

  // Use tRPC infinite query for real data
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = trpc.clips.getFeed.useInfiniteQuery(
    { limit: 6 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Flatten pages into clips array
  const clips = data?.pages.flatMap((page) => page.clips) ?? [];

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  // Initial loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Empty state
  if (clips.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No clips available yet. Be the first to share knowledge!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clips.map((clip) => (
          <ClipCard key={clip.id} clip={clip} />
        ))}
      </div>

      {/* Loading Indicator */}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-8">
          {isFetchingNextPage && <Loader2 className="w-8 h-8 animate-spin text-purple-600" />}
        </div>
      )}

      {/* End Message */}
      {!hasNextPage && clips.length > 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>You've reached the end! Check back later for more clips.</p>
        </div>
      )}
    </div>
  );
}
