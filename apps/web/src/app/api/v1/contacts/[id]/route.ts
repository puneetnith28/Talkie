import { NextRequest, NextResponse } from 'next/server';
import { ContactService } from '@talkie/database';
import { getAuthenticatedSession } from '@/lib/auth/session';
import { z } from 'zod';

const updateContactSchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  whatsappId: z.string().optional(),
  telegramId: z.string().optional(),
  telegramUsername: z.string().optional(),
  avatarUrl: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthenticatedSession(req);
    const workspaceId = session.workspaceId;

    const contact = await ContactService.getById(workspaceId, id);
    if (!contact) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: contact });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthenticatedSession(req);
    const workspaceId = session.workspaceId;
    const body = await req.json();

    const parsed = updateContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const updated = await ContactService.update(workspaceId, id, {
      name: parsed.data.name,
      phoneNumber: parsed.data.phoneNumber,
      email: parsed.data.email || undefined,
      whatsappId: parsed.data.whatsappId || undefined,
      telegramId: parsed.data.telegramId || undefined,
      telegramUsername: parsed.data.telegramUsername ? parsed.data.telegramUsername.replace(/^@/, '') : undefined,
      avatarUrl: parsed.data.avatarUrl || undefined,
      company: parsed.data.company,
      notes: parsed.data.notes,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthenticatedSession(req);
    const workspaceId = session.workspaceId;

    await ContactService.delete(workspaceId, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
