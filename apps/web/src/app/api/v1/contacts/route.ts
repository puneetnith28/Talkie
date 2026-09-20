import { NextRequest, NextResponse } from 'next/server';
import { ContactService } from '@talkie/database';
import { z } from 'zod';

const contactSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const contacts = await ContactService.list(workspaceId, {
      query: search,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: contacts,
    });
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
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

    const parsed = contactSchema.safeParse(body);
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

    const contact = await ContactService.create(workspaceId, {
      phoneNumber: parsed.data.phoneNumber,
      name: parsed.data.name,
      email: parsed.data.email || undefined,
      company: parsed.data.company,
      notes: parsed.data.notes,
    });

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error: any) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
