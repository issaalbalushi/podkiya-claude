import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Placeholder for Inngest webhook endpoint
// In production, this would handle background job triggers
// For local dev, we'll process jobs synchronously in server actions

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Log the job request (for local dev)
    console.log('[Inngest] Job request:', body);

    return NextResponse.json({
      success: true,
      message: 'Job queued (running synchronously in local dev)',
    });
  } catch (error) {
    console.error('[Inngest] Error:', error);
    return NextResponse.json({ error: 'Job failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    mode: 'local-dev',
    message: 'Inngest endpoint ready (local development mode)',
  });
}
