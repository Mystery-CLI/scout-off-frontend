/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["ipfs.io", "gateway.pinata.cloud"],
  },
  i18n: {
    locales: ['en', 'fr', 'sw'],
    defaultLocale: 'en',
  },
  swcMinify: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
