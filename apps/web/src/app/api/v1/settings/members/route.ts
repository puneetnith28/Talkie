import { NextRequest, NextResponse } from 'next/server';
import { prisma, MemberService } from '@talkie/database';
import { z } from 'zod';

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'admin', 'member', 'viewer']).default('member'),
});

export async function GET(req: NextRequest) {
  try {
    const workspaceId = req.headers.get('x-workspace-id') || 'ws_default_talkie_01';

    const members = await MemberService.listMembers(workspaceId);

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error: any) {
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

    const parsed = inviteMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    // Find or create user by email
    let user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: parsed.data.email,
          name: parsed.data.email.split('@')[0],
          passwordHash: 'invited_placeholder',
        },
      });
    }

    const membership = await MemberService.addMember({
      workspaceId,
      userId: user.id,
      role: parsed.data.role as any,
    });

    return NextResponse.json({
      success: true,
      data: membership,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
