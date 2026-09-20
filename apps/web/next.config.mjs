/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@talkie/ui',
    '@talkie/auth',
    '@talkie/config',
    '@talkie/types',
    '@talkie/database',
    '@talkie/telephony',
    '@talkie/voice',
    '@talkie/webhook-engine',
    '@talkie/billing',
    '@talkie/sdk',
    '@talkie/mcp-server',
  ],
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
