/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    // Smaller device buckets so mobile gets a 384/640px image, not 3840
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Modern formats — WebP/AVIF are 30–60% smaller than JPG
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // Transpile ESM packages for Next.js Pages Router compatibility
  transpilePackages: ['chess.js', 'react-chessboard'],

  // Ensures Prisma and bcrypt are only bundled server-side (Pages Router)
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    // Optimize CSS in production
    optimizeCss: false, // keep false unless you add critters; can flip on later
  },

  // Stronger HTTP caching for static gallery assets
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/logo.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
