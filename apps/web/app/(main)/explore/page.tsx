import { InfiniteFeed } from '@/components/feed/infinite-feed';
import { ContinueLearning } from '@/components/feed/continue-learning';

export const metadata = {
  title: 'Explore - Podkiya',
  description: 'Discover educational audio clips',
};

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Continue Learning Banner (if has progress) */}
      <ContinueLearning />

      {/* Main Feed */}
      <div className="container mx-auto px-4 py-6">
        <InfiniteFeed />
      </div>
    </div>
  );
}
