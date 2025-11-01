'use client';

import { useState, useEffect, useCallback } from 'react';
import { VerticalClipCard } from '@/components/feed/vertical-clip-card';
import { mockClips } from '@/lib/mock-data';
import { useSocialStore } from '@/lib/store/social-store';
import { Button } from '@/components/ui/button';
import { X, Home, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function FeedPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSessionNudge, setShowSessionNudge] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clips] = useState(mockClips);

  const { startSession, endSession, getSessionDuration, sessionClipsCompleted } = useSocialStore();

  useEffect(() => {
    startSession();

    return () => {
      endSession();
    };
  }, []);

  // Session timer check
  useEffect(() => {
    const interval = setInterval(() => {
      const duration = getSessionDuration();
      // Show nudge after 20 minutes (1200 seconds)
      if (duration >= 1200 && !showSessionNudge) {
        setShowSessionNudge(true);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [getSessionDuration, showSessionNudge]);

  const handleNext = useCallback(() => {
    if (currentIndex < clips.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, clips.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        handleNext();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious]);

  // Touch/swipe support
  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchStartY - touchEndY;

      // Swipe up (next clip)
      if (swipeDistance > 50) {
        handleNext();
      }
      // Swipe down (previous clip)
      else if (swipeDistance < -50) {
        handlePrevious();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleNext, handlePrevious]);

  const currentClip = clips[currentIndex];

  if (!currentClip) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">No more clips!</h2>
          <p className="text-white/70">Check back later for more content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
        {/* Home Button */}
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20"
          >
            <Home className="w-5 h-5" />
          </Button>
        </Link>

        {/* Clip Counter - Center */}
        <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold">
          {currentIndex + 1} / {clips.length}
        </div>

        {/* Menu Button */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 border-white/20">
            <nav className="flex flex-col gap-6 mt-12">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-medium text-white hover:text-purple-300 transition"
              >
                Home
              </Link>
              <Link
                href="/explore"
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-medium text-white hover:text-purple-300 transition"
              >
                Explore
              </Link>
              <Link
                href="/upload"
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-medium text-white hover:text-purple-300 transition"
              >
                Upload
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-medium text-white hover:text-purple-300 transition"
              >
                Profile
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content - Vertical Clip */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <VerticalClipCard
              clip={{
                ...currentClip,
                creator: {
                  id: currentClip.creator.id || `creator-${currentIndex}`,
                  name: currentClip.creator.name,
                  avatarUrl: currentClip.creator.avatarUrl,
                },
              }}
              onSwipeNext={handleNext}
              autoPlay={true}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Indicators - Left Side */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
        {clips.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, idx) => {
          const actualIndex = Math.max(0, currentIndex - 2) + idx;
          const isCurrent = actualIndex === currentIndex;

          return (
            <button
              key={actualIndex}
              onClick={() => setCurrentIndex(actualIndex)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                isCurrent
                  ? 'bg-white h-8'
                  : 'bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to clip ${actualIndex + 1}`}
            />
          );
        })}
      </div>

      {/* Session Nudge Modal */}
      <AnimatePresence>
        {showSessionNudge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-8 max-w-md w-full text-white shadow-2xl relative"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSessionNudge(false)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>

              <h2 className="text-2xl font-bold mb-4">Great learning session!</h2>
              <div className="space-y-3 mb-6">
                <p className="text-white/90">
                  You've been learning for over 20 minutes and completed <span className="font-bold">{sessionClipsCompleted} clips</span>.
                </p>
                <p className="text-white/80 text-sm">
                  Taking a break can help you retain what you've learned. Come back later to continue exploring!
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowSessionNudge(false)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white border-none"
                >
                  Keep Learning
                </Button>
                <Button
                  onClick={() => window.location.href = '/explore'}
                  className="flex-1 bg-white text-purple-600 hover:bg-white/90"
                >
                  Take a Break
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions Overlay (First Time) */}
      {currentIndex === 0 && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm font-medium"
          >
            ⬆ Swipe up or press ↑ to continue
          </motion.div>
        </div>
      )}
    </div>
  );
}
