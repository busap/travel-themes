import type { ImageLoaderProps } from "next/image";

// Public base URL of the R2 bucket — its r2.dev domain or a custom domain, with
// no trailing slash. Read at module scope so Next inlines it into the client
// bundle at build time (no runtime env needed in the browser).
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

// Images are pre-generated as static AVIF derivatives — one file per width —
// and stored in R2 under `{baseKey}/{width}.avif`. The DB stores the base URL
// (no width, no extension); this loader appends the width next/image asked for.
//
// `quality` is intentionally ignored: it's baked in at generation time
// (scripts/process-images.ts), so there's nothing to negotiate per request.
export default function r2Loader({ src, width }: ImageLoaderProps): string {
	// Only rewrite our own R2-hosted base URLs. Anything else — data URIs, local
	// /public assets, third-party images — passes through untouched.
	if (R2_PUBLIC_URL && src.startsWith(R2_PUBLIC_URL)) {
		return `${src}/${width}.avif`;
	}
	return src;
}
