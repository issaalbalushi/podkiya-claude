'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const pathname = usePathname();

  // Don't show header on /feed (full screen experience)
  if (pathname === '/feed') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white">
              P
            </div>
            <span className="hidden sm:inline">Podkiya</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6">
            <Link
              href="/feed"
              className="text-sm font-medium hover:text-purple-600 transition"
            >
              Feed
            </Link>
            <Link
              href="/explore"
              className="text-sm font-medium hover:text-purple-600 transition"
            >
              Explore
            </Link>
            <Link
              href="/upload"
              className="text-sm font-medium hover:text-purple-600 transition"
            >
              Upload
            </Link>
          </nav>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Search Sheet */}
          <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <SheetTrigger className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              <Search className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="top" className="h-auto z-[60]">
              <div className="mt-8">
                <SheetTitle className="text-2xl font-bold mb-4">Search Clips</SheetTitle>
                <input
                  type="text"
                  placeholder="Search by title, tag, or creator..."
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  autoFocus
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  Search functionality coming soon...
                </p>
              </div>
            </SheetContent>
          </Sheet>

          {/* Notifications Sheet */}
          <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <SheetTrigger className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent className="z-[60]">
              <div className="mt-8">
                <SheetTitle className="text-2xl font-bold mb-4">Notifications</SheetTitle>
                <p className="text-sm text-muted-foreground">
                  No new notifications yet. We'll notify you when you get likes, comments, and new followers!
                </p>
              </div>
            </SheetContent>
          </Sheet>

          <ThemeToggle />

          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full cursor-pointer">
              <User className="w-5 h-5" />
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent className="z-[60]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/feed"
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium hover:text-purple-600 transition"
                >
                  Feed
                </Link>
                <Link
                  href="/explore"
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium hover:text-purple-600 transition"
                >
                  Explore
                </Link>
                <Link
                  href="/upload"
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium hover:text-purple-600 transition"
                >
                  Upload
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium hover:text-purple-600 transition"
                >
                  Profile
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
