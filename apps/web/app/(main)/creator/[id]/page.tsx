'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ClipCard } from '@/components/feed/clip-card';
import { FollowButton } from '@/components/social/social-actions';
import { mockClips } from '@/lib/mock-data';
import { useSocialStore } from '@/lib/store/social-store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CreatorPage() {
  const params = useParams();
  const creatorId = params.id as string;
  const [isMounted, setIsMounted] = useState(false);

  const { isFollowing, followedCreators } = useSocialStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Find clips by this creator
  const creatorClips = mockClips.filter((clip) => {
    const clipCreatorId = clip.creator.id || `creator-${clip.id}`;
    return clipCreatorId === creatorId;
  });

  // Get creator info from first clip (in real app, this would be a separate API call)
  const creatorInfo = creatorClips[0]?.creator || {
    name: 'Unknown Creator',
    avatarUrl: undefined,
  };

  const following = isMounted && isFollowing(creatorId);
  const followerCount = isMounted ? (following ? 1247 : 1246) : 1246; // Mock count

  if (creatorClips.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Creator not found</h1>
          <p className="text-muted-foreground mb-4">
            This creator doesn't exist or hasn't posted any clips yet.
          </p>
          <Link href="/explore">
            <Button>Back to Explore</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link href="/explore">
          <Button variant="ghost" className="mb-6">
            ← Back to Explore
          </Button>
        </Link>

        {/* Creator Header */}
        <div className="bg-card rounded-3xl border p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-4xl ring-4 ring-purple-100 dark:ring-purple-900/30">
              {creatorInfo.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{creatorInfo.name}</h1>
                <CheckCircle2 className="w-6 h-6 text-blue-500" title="Verified Creator" />
              </div>

              <p className="text-muted-foreground mb-4">
                Educational Content Creator • Sharing knowledge through engaging audio clips
              </p>

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div>
                  <div className="text-2xl font-bold">{followerCount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{creatorClips.length}</div>
                  <div className="text-sm text-muted-foreground">Clips</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{(creatorClips.length * 234).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Listens</div>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            <div className="w-full md:w-auto">
              <FollowButton
                creatorId={creatorId}
                creatorName={creatorInfo.name}
                className="w-full md:w-auto min-w-[200px]"
              />
            </div>
          </div>

          {/* About */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-muted-foreground">
              {creatorInfo.name} is a passionate educator dedicated to making complex topics
              accessible through engaging, bite-sized audio content. With expertise in multiple
              fields, they create content that enlightens and inspires learners worldwide.
            </p>
          </div>
        </div>

        {/* Clips Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Clips ({creatorClips.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatorClips.map((clip) => (
              <ClipCard
                key={clip.id}
                clip={{
                  ...clip,
                  creator: {
                    ...clip.creator,
                    id: creatorId,
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {creatorClips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No clips yet. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}
