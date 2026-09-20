import { NextResponse } from 'next/server';
import { prisma } from '@talkie/database';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unready',
        database: 'disconnected',
        error: err.message,
      },
      { status: 503 }
    );
  }
}
