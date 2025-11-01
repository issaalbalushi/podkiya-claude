'use client';

import { useState, useEffect } from 'react';
import { BookmarkCheck, Heart, Users, Clock, GraduationCap, TrendingUp } from 'lucide-react';
import { ClipCard } from '@/components/feed/clip-card';
import { mockClips } from '@/lib/mock-data';
import { useSocialStore } from '@/lib/store/social-store';
import { usePlayerStore } from '@/lib/store/player-store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'saved' | 'liked' | 'completed'>('saved');

  const { savedClips, likedClips, followedCreators } = useSocialStore();
  const { checkpoints } = usePlayerStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get clips based on active tab
  const savedClipsData = isMounted
    ? mockClips.filter((clip) => savedClips.has(clip.id))
    : [];

  const likedClipsData = isMounted
    ? mockClips.filter((clip) => likedClips.has(clip.id))
    : [];

  const completedClipsData = isMounted
    ? mockClips.filter((clip) =>
        checkpoints.some((c) => c.clipId === clip.id && c.checkpoint === 'complete')
      )
    : [];

  const displayClips =
    activeTab === 'saved'
      ? savedClipsData
      : activeTab === 'liked'
      ? likedClipsData
      : completedClipsData;

  // Calculate stats
  const totalMinutesLearned = Math.floor(
    completedClipsData.reduce((sum, clip) => sum + clip.durationSec, 0) / 60
  );

  // Get unique topics from completed clips
  const topicsExplored = isMounted
    ? Array.from(
        new Set(
          completedClipsData.flatMap((clip) => clip.tags.map((t) => t.tag.label_en))
        )
      )
    : [];

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
                  <div className="text-2xl font-bold">{completedClipsData.length}</div>
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
                  <div className="text-2xl font-bold">{isMounted ? followedCreators.size : 0}</div>
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
              Saved ({savedClipsData.length})
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
              Liked ({likedClipsData.length})
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
              Completed ({completedClipsData.length})
            </div>
          </button>
        </div>

        {/* Clips Grid */}
        {displayClips.length > 0 ? (
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
