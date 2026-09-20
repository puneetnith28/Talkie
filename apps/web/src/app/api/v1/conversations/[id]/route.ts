import { NextRequest, NextResponse } from 'next/server';
import { MessageService, prisma } from '@talkie/database';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, workspaceId },
      include: {
        contact: true,
        phoneNumber: true,
        agent: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
        { status: 404 }
      );
    }

    const messages = await MessageService.getConversationMessages(workspaceId, conversationId);

    return NextResponse.json({
      success: true,
      data: {
        ...conversation,
        messages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching conversation details:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
