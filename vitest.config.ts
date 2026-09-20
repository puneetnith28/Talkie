import { defineConfig } from 'vitest/config';
import path from 'path';

const aliases = {
  '@talkie/database': path.resolve(__dirname, 'packages/database/src/index.ts'),
  '@talkie/auth': path.resolve(__dirname, 'packages/auth/src/index.ts'),
  '@talkie/types': path.resolve(__dirname, 'packages/types/src/index.ts'),
  '@talkie/telephony': path.resolve(__dirname, 'packages/telephony/src/index.ts'),
  '@talkie/voice': path.resolve(__dirname, 'packages/voice/src/index.ts'),
  '@talkie/webhook-engine': path.resolve(__dirname, 'packages/webhook-engine/src/index.ts'),
  '@talkie/config': path.resolve(__dirname, 'packages/config/src/index.ts'),
  '@talkie/ui': path.resolve(__dirname, 'packages/ui/src/index.ts'),
  '@talkie/sdk': path.resolve(__dirname, 'packages/sdk-js/src/index.ts'),
  '@talkie/billing': path.resolve(__dirname, 'packages/billing/src/index.ts'),
  '@talkie/mcp-server': path.resolve(__dirname, 'packages/mcp-server/src/index.ts'),
};

export default defineConfig({
  resolve: {
    alias: aliases,
  },
  test: {
    globals: true,
    environment: 'node',
    env: {
      DATABASE_URL: `file:${path.resolve(__dirname, 'packages/database/prisma/dev.db')}`,
      NODE_ENV: 'test',
    },
    projects: [
      'packages/*',
      'apps/*',
      {
        resolve: {
          alias: aliases,
        },
        test: {
          name: 'integration',
          include: ['tests/**/*.test.ts'],
          environment: 'node',
          globals: true,
          env: {
            DATABASE_URL: `file:${path.resolve(__dirname, 'packages/database/prisma/dev.db')}`,
            NODE_ENV: 'test',
          },
        },
      },
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});

