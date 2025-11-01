'use client';

import Link from 'next/link';
import { Menu, Search, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white">
            P
          </div>
          <span className="hidden sm:inline">Podkiya</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 ml-10">
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

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="w-5 h-5" />
          </Button>

          <ThemeToggle />

          <Link href="/auth/signin">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="w-5 h-5" />
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col gap-4 mt-8">
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
                  href="/auth/signin"
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium hover:text-purple-600 transition"
                >
                  Sign In
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
