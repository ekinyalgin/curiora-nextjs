/** @type {import('next').NextConfig} */

const nextConfig = {
      images: {
            domains: ['lh3.googleusercontent.com'],
            remotePatterns: [
                  {
                        protocol: 'http',
                        hostname: 'localhost'
                  },
                  {
                        protocol: 'https',
                        hostname: 'your-production-domain.com'
                  }
            ],
            unoptimized: true
      },
      compiler: {
            styledComponents: false
      },
      reactStrictMode: true,
      transpilePackages: ['@uiw/react-md-editor']
}

module.exports = nextConfig
