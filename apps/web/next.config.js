const { withSentryConfig } = require('@sentry/nextjs');
const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@podkiya/core', '@podkiya/db', '@podkiya/ui', '@podkiya/jobs'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.S3_PUBLIC_URL?.replace('https://', '') || 'media.podkiya.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

const sentryConfig = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

const sentryOptions = {
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
};

module.exports = withNextIntl(
  withSentryConfig(nextConfig, sentryConfig, sentryOptions)
);
