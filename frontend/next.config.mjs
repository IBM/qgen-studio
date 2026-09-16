/** @type {import('next').NextConfig} */
const nextConfig = {
  // Nothing in the studio renders images through next/image, so the Image
  // Optimization API is unused surface area. Turning it off makes /_next/image
  // 404 before any image is fetched or decoded, which takes the sharp/libheif
  // AVIF decode path (GHSA-2xp9-vwfh-vxw4) out of reach.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
