import { Header } from '@/components/nav/header';
import { MiniPlayer } from '@/components/player/mini-player';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <MiniPlayer />
    </div>
  );
}
