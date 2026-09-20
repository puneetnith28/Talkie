import { NextRequest, NextResponse } from 'next/server';
import { CallManager } from '@/lib/voice/call-manager';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, providerCallId } = body;

    if (!from || !to) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'from and to phone numbers are required' },
        },
        { status: 400 }
      );
    }

    const result = await CallManager.startInboundCall({
      from,
      to,
      providerCallId,
    });

    return NextResponse.json({
      success: true,
      data: result.call,
    });
  } catch (error: any) {
    console.error('Inbound call webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INBOUND_CALL_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
