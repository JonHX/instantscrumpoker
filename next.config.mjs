/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export for S3/CircleCI builds
  // Vercel handles dynamic routing natively, so we skip static export for Vercel
  output: process.env.VERCEL ? undefined : (process.env.NODE_ENV === 'production' ? 'export' : undefined),
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
