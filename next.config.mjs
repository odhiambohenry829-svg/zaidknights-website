/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // Transpile ESM packages for Next.js Pages Router compatibility
  transpilePackages: ['chess.js', 'react-chessboard'],

  // Ensures Prisma and bcrypt are only bundled server-side (Pages Router)
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
};

export default nextConfig;
