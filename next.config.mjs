/** @type {import('next').NextConfig} */
const nextConfig = {
  // eslint-plugin-react@7.37+ has a circular ref in its config object that
  // causes JSON.stringify to throw during Next.js' lint step. Running ESLint
  // via `npx eslint .` still works correctly. Disable the build-time check
  // until the upstream bug is resolved.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "ia.media-imdb.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
