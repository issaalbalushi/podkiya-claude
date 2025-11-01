import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
            <Play className="w-4 h-4" />
            Micro-Learning Audio Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Learn in{' '}
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              3 Minutes
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover bite-sized educational audio clips. Swipe, listen, learn.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/feed">
              <Button size="lg" className="rounded-full px-8 py-6 text-lg group">
                Start Learning
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-purple-600">1-3min</div>
              <div className="text-sm text-muted-foreground mt-1">Per Clip</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">1000+</div>
              <div className="text-sm text-muted-foreground mt-1">Topics</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">Daily</div>
              <div className="text-sm text-muted-foreground mt-1">Updates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border bg-card">
            <div className="aspect-video bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <div className="text-white text-center">
                <Play className="w-20 h-20 mx-auto mb-4 opacity-80" />
                <p className="text-lg font-medium">Tap to preview the experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
