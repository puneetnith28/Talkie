import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

async function scryptHash(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

async function main() {
  console.log('🌱 Starting Talkie database seed...');

  // 1. Create or upsert Demo User
  const passwordHash = await scryptHash('demo1234');
  const user = await prisma.user.upsert({
    where: { email: 'alex@talkie.ai' },
    update: {},
    create: {
      email: 'alex@talkie.ai',
      name: 'Alex Rivera',
      passwordHash,
    },
  });
  console.log('👤 Created user:', user.email);

  // 2. Create or upsert Demo Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'talkie-demo' },
    update: {},
    create: {
      name: 'Talkie AI Labs',
      slug: 'talkie-demo',
      balanceCents: 5000, // $50.00 initial credit
    },
  });
  console.log('🏢 Created workspace:', workspace.name);

  // 3. Workspace Membership
  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'owner',
    },
  });

  // 4. API Key
  const rawApiKey = 'tk_live_d3m0k3y1234567890abcdef12345678';
  const keyHash = hashApiKey(rawApiKey);
  await prisma.apiKey.upsert({
    where: { keyHash },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'Production Server Key',
      keyHash,
      keyHint: 'tk_live_...5678',
    },
  });

  // 5. Create Demo Agents
  const supportAgent = await prisma.agent.create({
    data: {
      workspaceId: workspace.id,
      name: 'Priya — Support Concierge',
      description: 'Front-line Indian customer support and inbound triage assistant',
      voiceMode: 'hosted',
      systemPrompt: 'You are a warm, helpful, and concise customer support specialist for Talkie in India. You speak fluent Indian English with natural bilingual Hindi fluency.',
      beginMessage: 'Namaste and thank you for calling Talkie India! How can I assist you today?',
      voice: 'aura-priya-in',
      language: 'en-IN',
      voiceSpeed: 1.0,
      interruptionSensitivity: 0.6,
      enableBackchannel: true,
      status: 'active',
    },
  });

  const sdrAgent = await prisma.agent.create({
    data: {
      workspaceId: workspace.id,
      name: 'Aarav — Enterprise SDR Bot',
      description: 'Outbound sales qualification and product demonstration scheduler for Indian enterprises',
      voiceMode: 'hosted',
      systemPrompt: 'You are an energetic and polite sales development representative based in Bengaluru.',
      beginMessage: 'Namaste! Aarav calling from Talkie regarding your voice AI telecom infrastructure interest.',
      voice: 'aura-aarav-in',
      language: 'en-IN',
      voiceSpeed: 1.05,
      interruptionSensitivity: 0.5,
      enableBackchannel: true,
      status: 'active',
    },
  });
  console.log('🤖 Created demo agents:', supportAgent.name, sdrAgent.name);

  // 6. Create Demo Phone Numbers (India +91)
  const number1 = await prisma.phoneNumber.upsert({
    where: { phoneNumber: '+918045678901' },
    update: { agentId: supportAgent.id },
    create: {
      workspaceId: workspace.id,
      phoneNumber: '+918045678901',
      country: 'IN',
      countryCode: '+91',
      areaCode: '80',
      provider: 'mock',
      capabilitiesJson: JSON.stringify({ voice: true, sms: true, mms: false }),
      status: 'active',
      agentId: supportAgent.id,
    },
  });

  const number2 = await prisma.phoneNumber.upsert({
    where: { phoneNumber: '+919876543210' },
    update: { agentId: sdrAgent.id },
    create: {
      workspaceId: workspace.id,
      phoneNumber: '+919876543210',
      country: 'IN',
      countryCode: '+91',
      areaCode: '98',
      provider: 'mock',
      capabilitiesJson: JSON.stringify({ voice: true, sms: true, mms: true }),
      status: 'active',
      agentId: sdrAgent.id,
    },
  });
  console.log('📞 Provisioned Indian numbers:', number1.phoneNumber, number2.phoneNumber);

  // 7. Create Demo Contacts (India)
  const contactPriya = await prisma.contact.create({
    data: {
      workspaceId: workspace.id,
      name: 'Priya Sharma',
      phoneNumber: '+919820155432',
      email: 'priya.sharma@infosys-tech.in',
      company: 'Tech Solutions India',
      notes: 'Interested in ultra-low latency voice agents for Indian telecom',
    },
  });

  const contactRahul = await prisma.contact.create({
    data: {
      workspaceId: workspace.id,
      name: 'Rahul Verma',
      phoneNumber: '+919988776655',
      email: 'rahul.verma@bangalore-startups.com',
      company: 'Bengaluru AI Ventures',
      notes: 'Requested WhatsApp Business & SMS webhooks integration demo',
    },
  });
  console.log('👥 Created contacts:', contactPriya.name, contactRahul.name);

  // 8. Create Demo Calls & Transcripts
  const call1 = await prisma.call.create({
    data: {
      workspaceId: workspace.id,
      agentId: supportAgent.id,
      phoneNumberId: number1.id,
      direction: 'inbound',
      fromNumber: contactPriya.phoneNumber,
      toNumber: number1.phoneNumber,
      status: 'completed',
      durationSeconds: 78,
      startedAt: new Date(Date.now() - 3600000),
      endedAt: new Date(Date.now() - 3600000 + 78000),
      summary: 'Caller inquired about Indian telecom SIP trunks and upgraded to Enterprise plan.',
      transcriptStatus: 'completed',
      transcripts: {
        create: [
          { speaker: 'agent', text: 'Namaste and thank you for calling Talkie India! How can I assist you today?', timestampMs: 0 },
          { speaker: 'user', text: 'Hi! I wanted to check the pricing for Indian SIP numbers and WhatsApp Cloud integration.', timestampMs: 3200 },
          { speaker: 'agent', text: 'Our platform supports sub-500ms voice turnarounds with full support for Indian +91 numbers and Airtel/Jio carrier routes.', timestampMs: 8100 },
          { speaker: 'user', text: 'That sounds perfect. Can we schedule a technical onboarding session for our Bengaluru team?', timestampMs: 14500 },
          { speaker: 'agent', text: 'Absolutely! I have sent an invite link directly to your email and WhatsApp.', timestampMs: 19800 },
        ],
      },
    },
  });

  // 9. Create Demo Conversations & Messages
  const conversation = await prisma.conversation.create({
    data: {
      workspaceId: workspace.id,
      agentId: supportAgent.id,
      phoneNumberId: number1.id,
      contactId: contactPriya.id,
      channel: 'sms',
      lastMessageAt: new Date(),
      messages: {
        create: [
          {
            direction: 'inbound',
            senderNumber: contactPriya.phoneNumber,
            recipientNumber: number1.phoneNumber,
            body: 'Namaste, does Talkie support Hindi and Indian regional languages out of the box?',
            status: 'delivered',
            sentAt: new Date(Date.now() - 600000),
          },
          {
            direction: 'outbound',
            senderNumber: number1.phoneNumber,
            recipientNumber: contactPriya.phoneNumber,
            body: 'Yes! Talkie supports Hindi, Indian English, Tamil, Telugu, and over 40 global languages with natural accents.',
            status: 'delivered',
            sentAt: new Date(Date.now() - 540000),
          },
        ],
      },
    },
  });

  // 10. Create Demo Webhook
  const webhook = await prisma.webhook.create({
    data: {
      workspaceId: workspace.id,
      url: 'https://webhook.site/talkie-demo-receiver',
      secret: 'whsec_demo9876543210fedcba',
      status: 'active',
      eventsJson: JSON.stringify(['call.started', 'call.ended', 'message.received']),
      deliveries: {
        create: [
          {
            event: 'call.ended',
            payloadJson: JSON.stringify({ callId: call1.id, duration: 78, status: 'completed' }),
            statusCode: 200,
            responseBody: '{"ok":true}',
            latencyMs: 142,
            status: 'success',
          },
        ],
      },
    },
  });

  // 11. Create Demo Usage Records
  await prisma.usageRecord.createMany({
    data: [
      { workspaceId: workspace.id, type: 'voice_minute', quantity: 78, unit: 'seconds', costCents: 6 },
      { workspaceId: workspace.id, type: 'sms', quantity: 2, unit: 'messages', costCents: 2 },
      { workspaceId: workspace.id, type: 'llm_token', quantity: 450, unit: 'tokens', costCents: 1 },
    ],
  });

  console.log('✅ Talkie database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
