/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/soil-sathi111',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
