import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		formats: ["image/avif", "image/webp"],
		minimumCacheTTL: 31536000,
		deviceSizes: [640, 1080, 1920, 2560],
		imageSizes: [256, 384],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
			},
		],
	},
};

export default nextConfig;
