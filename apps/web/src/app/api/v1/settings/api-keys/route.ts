import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@talkie/database';
import { generateApiKey } from '@talkie/auth';
import { z } from 'zod';

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Key name is required'),
});

export async function GET(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';

    const keys = await prisma.apiKey.findMany({
      where: { workspaceId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        keyHint: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: keys,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';
    const body = await req.json();

    const parsed = createApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    // Generate secret key & hash
    const { rawKey, keyHash, keyHint } = generateApiKey('live');

    const created = await prisma.apiKey.create({
      data: {
        workspaceId,
        name: parsed.data.name,
        keyHash,
        keyHint,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        rawKey, // Returned ONCE on creation
        keyHint: created.keyHint,
        createdAt: created.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';
    const body = await req.json().catch(() => ({}));
    const keyId = body.id || req.nextUrl.searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'API key ID is required' } },
        { status: 400 }
      );
    }

    await prisma.apiKey.updateMany({
      where: { id: keyId, workspaceId },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
