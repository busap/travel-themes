import type { NextConfig } from "next";
import { DEVICE_SIZES, IMAGE_SIZES } from "./src/config/image-widths";

const nextConfig: NextConfig = {
	images: {
		loader: "custom",
		loaderFile: "./src/utils/r2-loader.ts",
		deviceSizes: DEVICE_SIZES,
		imageSizes: IMAGE_SIZES,
	},
};

export default nextConfig;
