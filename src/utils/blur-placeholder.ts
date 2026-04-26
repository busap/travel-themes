/**
 * A tiny gray SVG used as a universal blur placeholder for Next.js <Image>.
 * Prevents the blank-white flash while remote images load.
 */
const svg =
	'<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#e5e7eb"/></svg>';

export const BLUR_DATA_URL =
	typeof Buffer !== "undefined"
		? `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
		: `data:image/svg+xml;base64,${btoa(svg)}`;
