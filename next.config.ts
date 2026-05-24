import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		loader: "custom",
		loaderFile: "./src/utils/cloudinary-loader.ts",
		deviceSizes: [640, 1080, 1920, 2560],
		imageSizes: [256, 384],
	},
};

export default nextConfig;
