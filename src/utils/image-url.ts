import r2Loader from "@/utils/r2-loader";

// Resolve a stored image base URL to a concrete, fetchable derivative URL for a
// given render width. The DB stores base URLs (no width, no extension) and the
// real files live at `{base}/{width}.avif` — so a raw base URL is NOT a loadable
// image on its own.
//
// next/image handles this automatically through the custom loader, but anywhere
// we bypass <Image> — CSS `background-image`, `new Image()` preloads — we must
// resolve the URL ourselves. Use this helper in those places so the URL matches
// the same AVIF derivative <Image> would request.
export function resolveImageUrl(src: string, width: number): string {
	return r2Loader({ src, width, quality: undefined });
}
