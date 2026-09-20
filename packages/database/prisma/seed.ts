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
      name: 'Support Concierge',
      description: 'Front-line customer support and inbound triage assistant',
      voiceMode: 'hosted',
      systemPrompt: 'You are a warm, helpful, and concise customer support specialist for Talkie.',
      beginMessage: 'Thank you for calling Talkie! How can I assist you today?',
      voice: 'aura-asteria-en',
      language: 'en-US',
      voiceSpeed: 1.0,
      interruptionSensitivity: 0.6,
      enableBackchannel: true,
      status: 'active',
    },
  });

  const sdrAgent = await prisma.agent.create({
    data: {
      workspaceId: workspace.id,
      name: 'Enterprise SDR Bot',
      description: 'Outbound sales qualification and product demonstration scheduler',
      voiceMode: 'hosted',
      systemPrompt: 'You are an energetic and polite sales development representative.',
      beginMessage: 'Hi there! Calling to follow up on your voice AI infrastructure interest.',
      voice: 'aura-orpheus-en',
      language: 'en-US',
      voiceSpeed: 1.05,
      interruptionSensitivity: 0.5,
      enableBackchannel: true,
      status: 'active',
    },
  });
  console.log('🤖 Created demo agents:', supportAgent.name, sdrAgent.name);

  // 6. Create Demo Phone Numbers
  const number1 = await prisma.phoneNumber.upsert({
    where: { phoneNumber: '+14155550142' },
    update: { agentId: supportAgent.id },
    create: {
      workspaceId: workspace.id,
      phoneNumber: '+14155550142',
      country: 'US',
      countryCode: '+1',
      areaCode: '415',
      provider: 'mock',
      capabilitiesJson: JSON.stringify({ voice: true, sms: true, mms: false }),
      status: 'active',
      agentId: supportAgent.id,
    },
  });

  const number2 = await prisma.phoneNumber.upsert({
    where: { phoneNumber: '+12125550198' },
    update: { agentId: sdrAgent.id },
    create: {
      workspaceId: workspace.id,
      phoneNumber: '+12125550198',
      country: 'US',
      countryCode: '+1',
      areaCode: '212',
      provider: 'mock',
      capabilitiesJson: JSON.stringify({ voice: true, sms: true, mms: true }),
      status: 'active',
      agentId: sdrAgent.id,
    },
  });
  console.log('📞 Provisioned numbers:', number1.phoneNumber, number2.phoneNumber);

  // 7. Create Demo Contacts
  const contactSarah = await prisma.contact.create({
    data: {
      workspaceId: workspace.id,
      name: 'Sarah Connor',
      phoneNumber: '+14155550188',
      email: 'sarah@cyberdyne.io',
      company: 'Cyberdyne Systems',
      notes: 'Interested in ultra-low latency voice agents',
    },
  });

  const contactMiles = await prisma.contact.create({
    data: {
      workspaceId: workspace.id,
      name: 'Miles Dyson',
      phoneNumber: '+12125550199',
      email: 'miles@neuralnet.org',
      company: 'Neural Net Labs',
      notes: 'Requested SMS notification webhooks demo',
    },
  });
  console.log('👥 Created contacts:', contactSarah.name, contactMiles.name);

  // 8. Create Demo Calls & Transcripts
  const call1 = await prisma.call.create({
    data: {
      workspaceId: workspace.id,
      agentId: supportAgent.id,
      phoneNumberId: number1.id,
      direction: 'inbound',
      fromNumber: contactSarah.phoneNumber,
      toNumber: number1.phoneNumber,
      status: 'completed',
      durationSeconds: 78,
      startedAt: new Date(Date.now() - 3600000),
      endedAt: new Date(Date.now() - 3600000 + 78000),
      summary: 'Caller inquired about pricing tiers and upgraded to Enterprise plan.',
      transcriptStatus: 'completed',
      transcripts: {
        create: [
          { speaker: 'agent', text: 'Thank you for calling Talkie! How can I assist you today?', timestampMs: 0 },
          { speaker: 'user', text: 'Hi! I wanted to check the pricing for high-concurrency phone streams.', timestampMs: 3200 },
          { speaker: 'agent', text: 'Our platform supports sub-500ms voice turnarounds with volume discounts starting at 50 concurrent lines.', timestampMs: 8100 },
          { speaker: 'user', text: 'That sounds perfect. Can we schedule a technical onboarding session?', timestampMs: 14500 },
          { speaker: 'agent', text: 'Absolutely! I have sent an invite link directly to your email on file.', timestampMs: 19800 },
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
      contactId: contactSarah.id,
      channel: 'sms',
      lastMessageAt: new Date(),
      messages: {
        create: [
          {
            direction: 'inbound',
            senderNumber: contactSarah.phoneNumber,
            recipientNumber: number1.phoneNumber,
            body: 'Hey, does Talkie support Spanish language models out of the box?',
            status: 'delivered',
            sentAt: new Date(Date.now() - 600000),
          },
          {
            direction: 'outbound',
            senderNumber: number1.phoneNumber,
            recipientNumber: contactSarah.phoneNumber,
            body: 'Yes! Talkie supports over 40 languages including Spanish (es-ES and es-MX) with native voice accents.',
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
