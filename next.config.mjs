/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel handles dynamic routing natively with SSR/ISR
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
