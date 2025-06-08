/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Only run ESLint on these directories during 'next build'
    dirs: ['app', 'pages', 'components', 'lib', 'src'],
    // Allow production builds to successfully complete even if project has ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to successfully complete even if project has type errors
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
