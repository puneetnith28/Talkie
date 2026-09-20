import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/auth/session';
import { prisma } from '@talkie/database';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(req);
    if (!auth.isAuthenticated || !auth.workspaceId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const [activeNumbers, totalAgents] = await Promise.all([
      prisma.phoneNumber.count({ where: { workspaceId: auth.workspaceId, status: 'active' } }),
      prisma.agent.count({ where: { workspaceId: auth.workspaceId } }),
    ]);

    const hasTwilioKey = Boolean(process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_ACCOUNT_SID.includes('mock'));
    const hasTelnyxKey = Boolean(process.env.TELNYX_API_KEY && !process.env.TELNYX_API_KEY.includes('mock'));

    const providerStatus = hasTwilioKey
      ? 'twilio_live'
      : hasTelnyxKey
      ? 'telnyx_live'
      : 'mock_sandbox';

    return NextResponse.json({
      success: true,
      data: {
        providerStatus,
        isLiveCarrier: hasTwilioKey || hasTelnyxKey,
        telephonyLatencyMs: 42,
        activeNumbers,
        totalAgents,
        supportedCountries: ['US', 'CA', 'GB', 'AU', 'IN'],
        supportedCapabilities: {
          voice: true,
          sms: true,
          mms: true,
          whatsapp: true,
          telegram: true,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
