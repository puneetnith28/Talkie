import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@talkie/database';
import { getAuthenticatedSession } from '@/lib/auth/session';
import { z } from 'zod';

const createConversationSchema = z.object({
  contactId: z.string().optional(),
  phoneNumberId: z.string().optional(),
  agentId: z.string().optional(),
  channel: z.enum(['sms', 'mms', 'whatsapp']).optional().default('sms'),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const workspaceId = session.workspaceId;
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get('channel') || undefined;
    const agentId = searchParams.get('agentId') || undefined;
    const contactId = searchParams.get('contactId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const conversations = await MessageService.listConversations(workspaceId, {
      channel,
      agentId,
      contactId,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const workspaceId = session.workspaceId;
    const body = await req.json();

    const parsed = createConversationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 }
      );
    }

    const conversation = await MessageService.findOrCreateConversation(workspaceId, parsed.data);

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
