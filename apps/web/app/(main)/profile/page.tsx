'use client';

import { useState, useEffect } from 'react';
import { BookmarkCheck, Heart, Users, Clock, GraduationCap, TrendingUp, Loader2 } from 'lucide-react';
import { ClipCard } from '@/components/feed/clip-card';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'saved' | 'liked' | 'completed'>('saved');

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  // Fetch user profile (only if authenticated)
  const { data: userProfile } = trpc.users.getMe.useQuery(undefined, {
    enabled: status === 'authenticated',
  });

  // Fetch clips based on active tab
  const { data: savedClips, isLoading: savedLoading } = trpc.clips.getSaved.useQuery(
    { limit: 100 },
    { enabled: activeTab === 'saved' && status === 'authenticated' }
  );

  const { data: likedClips, isLoading: likedLoading } = trpc.clips.getLiked.useQuery(
    { limit: 100 },
    { enabled: activeTab === 'liked' && status === 'authenticated' }
  );

  const { data: completedClips, isLoading: completedLoading } = trpc.users.getCompletedClips.useQuery(
    { limit: 100 },
    { enabled: activeTab === 'completed' && status === 'authenticated' }
  );

  // Determine which data to display
  const displayClips =
    activeTab === 'saved'
      ? savedClips || []
      : activeTab === 'liked'
      ? likedClips || []
      : completedClips || [];

  const isLoading =
    (activeTab === 'saved' && savedLoading) ||
    (activeTab === 'liked' && likedLoading) ||
    (activeTab === 'completed' && completedLoading);

  // Calculate stats
  const totalMinutesLearned = completedClips
    ? Math.floor(completedClips.reduce((sum, clip) => sum + clip.durationSec, 0) / 60)
    : 0;

  // Get unique topics from completed clips
  const topicsExplored = completedClips
    ? Array.from(
        new Set(
          completedClips.flatMap((clip) => clip.tags.map((t) => t.tag.label_en))
        )
      )
    : [];

  const completedCount = completedClips?.length || 0;
  const followingCount = userProfile?._count?.following || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link href="/explore">
          <Button variant="ghost" className="mb-6">
            ← Back to Explore
          </Button>
        </Link>

        {/* Profile Header */}
        <div className="bg-card rounded-3xl border p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-4xl ring-4 ring-purple-100 dark:ring-purple-900/30">
              Y
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">You</h1>
              <p className="text-muted-foreground mb-4">
                Curious learner • Exploring the world through audio
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <BookmarkCheck className="w-4 h-4" />
                    <span className="text-xs font-medium">Completed</span>
                  </div>
                  <div className="text-2xl font-bold">{completedCount}</div>
                </div>

                <div className="bg-background rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Time Learned</span>
                  </div>
                  <div className="text-2xl font-bold">{totalMinutesLearned}m</div>
                </div>

                <div className="bg-background rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <GraduationCap className="w-4 h-4" />
                    <span className="text-xs font-medium">Topics</span>
                  </div>
                  <div className="text-2xl font-bold">{topicsExplored.length}</div>
                </div>

                <div className="bg-background rounded-lg p-3">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium">Following</span>
                  </div>
                  <div className="text-2xl font-bold">{followingCount}</div>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <div className="w-full md:w-auto">
              <Button variant="outline" className="w-full md:w-auto">
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Topics You're Into */}
          {topicsExplored.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Topics You're Into
              </h3>
              <div className="flex flex-wrap gap-2">
                {topicsExplored.slice(0, 10).map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'saved'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4" />
              Saved ({savedClips?.length || 0})
            </div>
          </button>

          <button
            onClick={() => setActiveTab('liked')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'liked'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Liked ({likedClips?.length || 0})
            </div>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'completed'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4" />
              Completed ({completedClips?.length || 0})
            </div>
          </button>
        </div>

        {/* Clips Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : displayClips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayClips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-2xl border">
            <div className="text-muted-foreground mb-4">
              {activeTab === 'saved' && "You haven't saved any clips yet"}
              {activeTab === 'liked' && "You haven't liked any clips yet"}
              {activeTab === 'completed' && "You haven't completed any clips yet"}
            </div>
            <Link href="/feed">
              <Button>Start Exploring</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
