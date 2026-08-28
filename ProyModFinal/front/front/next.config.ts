import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "es.web.img3.acsta.net",
      },
      {
        protocol: "https",
        hostname: "miapp.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "assets.adidas.com",
      },
      {
        protocol: "https",
        hostname: "brand.assets.adidas.com",
      },
    ],
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/products/:path*",
  //       destination: "https://nivoapp.netlify.app/:path*", // o el puerto real de tu backend
  //     },
  //   ];
  // },
};

export default nextConfig;