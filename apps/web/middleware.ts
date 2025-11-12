import { NextRequest, NextResponse } from 'next/server';

export default function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Relaxed CSP for local development (Next.js needs unsafe-eval in dev mode)
  const isDev = process.env.NODE_ENV === 'development';

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = isDev
    ? `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      connect-src 'self' ws: wss:;
    `.replace(/\s{2,}/g, ' ').trim()
    : `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
