import { z } from 'zod';

// E.164 Phone Number Regex: + followed by 7 to 15 digits
export const E164_PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .regex(E164_PHONE_REGEX, 'Phone number must be in valid E.164 format (e.g. +14155550199)');

export const contactValidationSchema = z.object({
  phoneNumber: phoneSchema,
  name: z.string().trim().min(1, 'Contact name is required').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  company: z.string().trim().max(100, 'Company name too long').optional().or(z.literal('')),
  notes: z.string().trim().max(1000, 'Notes cannot exceed 1000 characters').optional().or(z.literal('')),
});

export type ContactFormData = z.infer<typeof contactValidationSchema>;

export const webhookValidationSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Endpoint URL is required')
    .url('Must be a valid URL starting with http:// or https://')
    .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
      message: 'URL must use HTTP or HTTPS protocol',
    }),
  events: z.array(z.string()).min(1, 'At least one event must be selected'),
});

export type WebhookFormData = z.infer<typeof webhookValidationSchema>;

export const agentValidationSchema = z.object({
  name: z.string().trim().min(2, 'Agent name must be at least 2 characters').max(64, 'Name too long'),
  description: z.string().trim().max(250, 'Description too long').optional().or(z.literal('')),
  voiceMode: z.enum(['hosted', 'webhook']),
  webhookUrl: z
    .string()
    .trim()
    .url('Webhook URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  systemPrompt: z.string().trim().min(10, 'System prompt must be at least 10 characters'),
  beginMessage: z.string().trim().min(2, 'Begin message must be at least 2 characters'),
  voice: z.string().min(1, 'Please select a voice model'),
  language: z.string().min(2, 'Language code required'),
  voiceSpeed: z.number().min(0.5).max(2.0).default(1.0),
  interruptionSensitivity: z.number().min(0.0).max(1.0).default(0.6),
  enableBackchannel: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.voiceMode === 'webhook') {
      return !!data.webhookUrl && data.webhookUrl.length > 0;
    }
    return true;
  },
  {
    message: 'Webhook URL is required when voice mode is set to Custom Webhook Dispatch',
    path: ['webhookUrl'],
  }
);

export type AgentFormData = z.infer<typeof agentValidationSchema>;

export const apiKeyValidationSchema = z.object({
  name: z.string().trim().min(2, 'API key name must be at least 2 characters').max(64, 'Name too long'),
  permissions: z.array(z.string()).optional(),
  expiresInDays: z.number().positive().optional(),
});

export type ApiKeyFormData = z.infer<typeof apiKeyValidationSchema>;

export const memberInviteValidationSchema = z.object({
  email: z.string().trim().email('Valid work email is required'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']).default('MEMBER'),
});

export type MemberInviteFormData = z.infer<typeof memberInviteValidationSchema>;

export const messageValidationSchema = z.object({
  to: phoneSchema,
  from: z.string().optional(),
  body: z.string().trim().min(1, 'Message body cannot be empty').max(1600, 'Message body cannot exceed 1600 characters'),
});

export type MessageFormData = z.infer<typeof messageValidationSchema>;
