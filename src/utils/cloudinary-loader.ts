import type { ImageLoaderProps } from "next/image";

export default function cloudinaryLoader({
	src,
	width,
	quality,
}: ImageLoaderProps): string {
	if (!src.includes("res.cloudinary.com")) {
		return src;
	}

	const params = [
		"f_auto",
		quality ? `q_${quality}` : "q_auto",
		`w_${width}`,
		"c_limit",
	].join(",");

	return src.replace("/image/upload/", `/image/upload/${params}/`);
}
