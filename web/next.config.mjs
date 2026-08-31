/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Mídia de apoio enquanto os arquivos não são servidos do próprio domínio.
    remotePatterns: [
      { protocol: "https", hostname: "d8j0ntlcm91z4.cloudfront.net" },
    ],
  },
};

export default nextConfig;
