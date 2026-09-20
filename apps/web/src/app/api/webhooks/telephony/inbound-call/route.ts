import { NextRequest, NextResponse } from 'next/server';
import { NumberService, AgentService, ContactService, CallService } from '@talkie/database';
import { CallManager } from '@/lib/voice/call-manager';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let bodyJson: Record<string, any> = {};

    try {
      bodyJson = JSON.parse(rawBody);
    } catch {
      const searchParams = new URLSearchParams(rawBody);
      bodyJson = Object.fromEntries(searchParams.entries());
    }

    const from = bodyJson.From || bodyJson.from;
    const to = bodyJson.To || bodyJson.to;

    if (!from || !to) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PAYLOAD', message: 'From and To are required' } },
        { status: 400 }
      );
    }

    // Lookup destination phone number
    const phoneNumber = await NumberService.getByPhoneNumber(to);
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: `Destination number ${to} not registered` } },
        { status: 404 }
      );
    }

    const workspaceId = phoneNumber.workspaceId;
    const agentId = phoneNumber.agentId;

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_AGENT_ASSIGNED', message: 'No AI agent assigned to this phone number' } },
        { status: 422 }
      );
    }

    const agent = await AgentService.getById(workspaceId, agentId);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: { code: 'AGENT_NOT_FOUND', message: 'Assigned agent not found' } },
        { status: 404 }
      );
    }

    // Resolve caller contact
    let contact = await ContactService.getByPhoneNumber(workspaceId, from);
    if (!contact) {
      contact = await ContactService.create(workspaceId, {
        phoneNumber: from,
        name: `Caller (${from})`,
      });
    }

    // Create DB Call record
    const callRecord = await CallService.create(workspaceId, {
      agentId: agent.id,
      phoneNumberId: phoneNumber.id,
      contactId: contact.id,
      direction: 'inbound',
      callerNumber: from,
      calleeNumber: to,
      status: 'in-progress',
    });

    return NextResponse.json({
      success: true,
      data: {
        callId: callRecord.id,
        agent: {
          id: agent.id,
          name: agent.name,
          voice: agent.voice,
          beginMessage: agent.beginMessage,
        },
        action: 'answer',
      },
    });
  } catch (error: any) {
    console.error('Error handling inbound call webhook:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
