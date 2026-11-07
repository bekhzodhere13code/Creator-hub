/** @type {import('next').NextConfig} */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "irswmzdwfosbzaztxlfb.supabase.co";
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: supabaseHost },
    ],
  },
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};
export default nextConfig;
