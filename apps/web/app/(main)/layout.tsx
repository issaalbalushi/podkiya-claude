'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/nav/header';
import { MiniPlayer } from '@/components/player/mini-player';
import { BottomNav } from '@/components/navigation/bottom-nav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFeedPage = pathname === '/feed';

  // Feed page needs special full-screen layout
  if (isFeedPage) {
    return (
      <>
        <Header />
        <main className="h-screen w-full overflow-hidden">{children}</main>
        <MiniPlayer />
        <BottomNav />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Header />
      <main className="flex-1">{children}</main>
      <MiniPlayer />
      <BottomNav />
    </div>
  );
}
