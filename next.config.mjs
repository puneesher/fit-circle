/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["oracledb"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/yuhonas/free-exercise-db/**",
      },
    ],
  },
};

export default nextConfig;
