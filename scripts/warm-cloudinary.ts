import "dotenv/config";
import { getAllTrips } from "@/db/trips";
import cloudinaryLoader from "@/utils/cloudinary-loader";

// Must mirror the widths in next.config.ts (deviceSizes + imageSizes).
// next/image only ever requests these, so warming all of them covers every
// device/DPR combination — no visitor hits a cold transform afterward.
const WIDTHS = [256, 384, 640, 1080, 1920, 2560];

// next/image passes `quality: undefined` to a custom loader when no `quality`
// prop is set, which our loader maps to `q_auto`. None of the themes set
// quality, so undefined here produces byte-identical URLs to the browser.
const QUALITY = undefined;

// `f_auto` makes Cloudinary serve (and cache) a DIFFERENT derivative per
// `Accept` header — and it caches each format bucket separately (Vary: Accept).
// A plain fetch warms only the JPEG bucket, which no real browser requests, so
// browsers still hit a cold transform. We must replay the Accept headers real
// browsers send to warm the AVIF/WebP buckets they actually fetch.
const ACCEPT_PROFILES = [
	// Modern browsers: Chrome/Edge, Firefox, Safari 16+ (prefers AVIF). This one
	// profile covers essentially all current mobile + desktop traffic.
	"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
	// Add this back only if you need to cover old WebP-only-but-not-AVIF browsers
	// (e.g. Safari < 16) — doubles the job count for a small slice of traffic:
	// "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
];

const CONCURRENCY = 8;

async function main() {
	const trips = await getAllTrips();

	// Collect every Cloudinary source: cover photos + gallery photos.
	const sources = new Set<string>();
	for (const trip of trips) {
		if (trip.coverPhoto) sources.add(trip.coverPhoto);
		for (const photo of trip.photos) sources.add(photo.src);
	}

	// Expand each source into one URL per width (exactly what the loader emits),
	// then one job per Accept profile so every format bucket gets warmed.
	const urls = new Set<string>();
	for (const src of sources) {
		for (const width of WIDTHS) {
			urls.add(cloudinaryLoader({ src, width, quality: QUALITY }));
		}
	}
	const jobs: { url: string; accept: string }[] = [];
	for (const url of urls) {
		for (const accept of ACCEPT_PROFILES) jobs.push({ url, accept });
	}

	const all = jobs;
	console.log(
		`Warming ${all.length} jobs (${sources.size} images × ${WIDTHS.length} widths × ${ACCEPT_PROFILES.length} formats) across ${trips.length} trips...`,
	);

	let done = 0;
	let failed = 0;
	let cursor = 0;

	async function worker() {
		while (cursor < all.length) {
			const { url, accept } = all[cursor++];
			try {
				// `Range: bytes=0-0` still forces Cloudinary to generate + cache the
				// derivative, but transfers ~1 byte instead of the full image — so
				// warming costs transformations, not bandwidth.
				const res = await fetch(url, {
					redirect: "follow",
					headers: { Accept: accept, Range: "bytes=0-0" },
				});
				await res.arrayBuffer();
				// 200 (Range ignored) and 206 (Range honored) both mean it's cached.
				if (!res.ok && res.status !== 206) {
					failed++;
					console.warn(`  ${res.status} ${url}`);
				}
			} catch (err) {
				failed++;
				console.warn(`  ERR ${url} — ${(err as Error).message}`);
			}
			done++;
			if (done % 25 === 0 || done === all.length) {
				console.log(`  ${done}/${all.length} (${failed} failed)`);
			}
		}
	}

	await Promise.all(
		Array.from({ length: Math.min(CONCURRENCY, all.length) }, worker),
	);

	console.log(`Done. ${all.length - failed} warmed, ${failed} failed.`);
	if (failed > 0) process.exitCode = 1;
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => process.exit());
