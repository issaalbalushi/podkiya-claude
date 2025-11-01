import { Upload as UploadIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 mb-6">
            <UploadIcon className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold mb-4">Upload Coming Soon</h1>

          <p className="text-lg text-muted-foreground mb-8">
            We're building an amazing creator experience. Soon you'll be able to upload
            your educational audio clips and share knowledge with the world.
          </p>

          <div className="bg-card rounded-2xl border p-6 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600 mt-1" />
              <div className="text-left">
                <h3 className="font-semibold mb-1">What to expect:</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Upload 1-3 minute audio clips</li>
                  <li>• Automatic transcription and captioning</li>
                  <li>• Analytics dashboard for your content</li>
                  <li>• Monetization through subscriptions</li>
                  <li>• Build your audience of curious learners</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link href="/feed">
              <Button size="lg" className="rounded-full">
                Explore Content
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="rounded-full">
                Browse Creators
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
