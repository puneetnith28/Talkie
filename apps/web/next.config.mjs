/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@talkie/ui',
    '@talkie/auth',
    '@talkie/config',
    '@talkie/types',
    '@talkie/database',
    '@talkie/telephony',
  ],
  reactStrictMode: true,
};

export default nextConfig;
