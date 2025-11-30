/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export for production builds
  // Dev mode needs dynamic params which aren't supported with output: 'export'
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
