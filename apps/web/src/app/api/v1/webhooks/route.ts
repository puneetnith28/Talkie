import { NextRequest, NextResponse } from 'next/server';
import { WebhookService } from '@talkie/database';
import { z } from 'zod';

const createWebhookSchema = z.object({
  url: z.string().url('A valid HTTPS/HTTP webhook destination URL is required'),
  events: z.array(z.string()).optional().default(['*']),
  status: z.enum(['active', 'paused', 'disabled']).optional().default('active'),
});

export async function GET(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';
    const webhooks = await WebhookService.listWebhooks(workspaceId);

    return NextResponse.json({
      success: true,
      data: webhooks,
    });
  } catch (error: any) {
    console.error('Error fetching webhooks:', error);
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

    const parsed = createWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0].message,
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const webhook = await WebhookService.createWebhook(workspaceId, {
      url: parsed.data.url,
      events: parsed.data.events,
      status: parsed.data.status,
    });

    return NextResponse.json({
      success: true,
      data: webhook,
    });
  } catch (error: any) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
