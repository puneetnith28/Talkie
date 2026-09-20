import { NextRequest, NextResponse } from 'next/server';
import { ChannelAccountService } from '@talkie/database';
import { getAuthenticatedSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(req);
    if (!auth.isAuthenticated || !auth.workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const accounts = await ChannelAccountService.listAccounts(auth.workspaceId, 'whatsapp');
    return NextResponse.json({ success: true, data: accounts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(req);
    if (!auth.isAuthenticated || !auth.workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { phoneNumberId, accessToken, appSecret, verifyToken, name } = body;

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'phoneNumberId and accessToken are required' },
        },
        { status: 400 }
      );
    }

    const account = await ChannelAccountService.upsertAccount(auth.workspaceId, {
      type: 'whatsapp',
      name: name || `WhatsApp Business (${phoneNumberId})`,
      identifier: phoneNumberId,
      credentials: {
        phoneNumberId,
        accessToken,
        appSecret: appSecret || '',
        verifyToken: verifyToken || 'talkie_wa_verify_token',
      },
      webhookUrl: `/api/v1/channels/whatsapp/webhook`,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: account.id,
        name: account.name,
        type: account.type,
        identifier: account.identifier,
        status: account.status,
        webhookUrl: account.webhookUrl,
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
    const auth = await getAuthenticatedSession(req);
    if (!auth.isAuthenticated || !auth.workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('id');

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing account ID' } },
        { status: 400 }
      );
    }

    await ChannelAccountService.disconnectAccount(auth.workspaceId, accountId);
    return NextResponse.json({ success: true, message: 'WhatsApp account disconnected' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
