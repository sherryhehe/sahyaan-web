/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://*.stripe.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
