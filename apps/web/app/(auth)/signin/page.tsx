'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/feed';

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error('Sign in failed. Please try again.');
      } else if (result?.ok) {
        toast.success('Signed in successfully!');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login for testing with seed data users
  const quickLogin = async (testEmail: string) => {
    setEmail(testEmail);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: testEmail,
        redirect: false,
        callbackUrl,
      });

      if (result?.ok) {
        toast.success('Signed in successfully!');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to Podkiya</CardTitle>
          <CardDescription className="text-center">
            Sign in to start exploring micro-learning audio clips
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Quick Login (Dev)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLogin('admin@podkiya.com')}
              disabled={isLoading}
            >
              Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLogin('reviewer1@podkiya.com')}
              disabled={isLoading}
            >
              Reviewer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLogin('creator1@podkiya.com')}
              disabled={isLoading}
            >
              Creator 1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLogin('creator2@podkiya.com')}
              disabled={isLoading}
            >
              Creator 2
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            For local development: Any email will auto-create an account
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
