import { NextRequest, NextResponse } from 'next/server';
import { ChannelAccountService } from '@talkie/database';
import { TelegramBotProvider } from '@talkie/telephony';
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

    const accounts = await ChannelAccountService.listAccounts(auth.workspaceId, 'telegram');
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
    const { botToken, secretToken, name } = body;

    if (!botToken) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Telegram botToken is required' },
        },
        { status: 400 }
      );
    }

    // Verify token validity with Telegram Bot API
    const provider = new TelegramBotProvider({ botToken });
    let botProfile: { id: number; username?: string; first_name: string } = {
      id: 0,
      username: 'TalkieBot',
      first_name: 'Talkie Bot',
    };
    try {
      botProfile = await provider.getMe();
    } catch (err: any) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'TELEGRAM_ERROR', message: `Invalid Telegram token: ${err.message}` },
        },
        { status: 400 }
      );
    }

    const identifier = botProfile.username ? `@${botProfile.username}` : String(botProfile.id);
    const generatedSecret = secretToken || `tk_tg_sec_${Date.now()}`;

    const account = await ChannelAccountService.upsertAccount(auth.workspaceId, {
      type: 'telegram',
      name: name || `Telegram Bot (${identifier})`,
      identifier,
      credentials: {
        botToken,
        botId: botProfile.id,
        botUsername: botProfile.username,
        secretToken: generatedSecret,
      },
      webhookUrl: `/api/v1/channels/telegram/webhook`,
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
    return NextResponse.json({ success: true, message: 'Telegram account disconnected' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
