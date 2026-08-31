/** @type {import('next').NextConfig} */
const nextConfig = {
  // `scripts/gerar-previa.mjs` liga PREVIA=1 para exportar HTML estático e
  // juntar tudo num arquivo só. O build normal, o que vai para a Vercel,
  // segue sem isso.
  ...(process.env.PREVIA === "1" ? { output: "export" } : {}),

  images: {
    // Mídia de apoio enquanto os arquivos não são servidos do próprio domínio.
    remotePatterns: [
      { protocol: "https", hostname: "d8j0ntlcm91z4.cloudfront.net" },
    ],
  },
};

export default nextConfig;
