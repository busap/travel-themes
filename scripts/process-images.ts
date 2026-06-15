import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ALL_WIDTHS } from "@/config/image-widths";

// Generates static AVIF derivatives for every source image (one per width) and
// uploads them to R2. This replaces Cloudinary's on-the-fly transforms: all the
// resizing/encoding happens once here, at build time, so serving costs nothing
// per request and there are no transformation quotas to hit.
//
// Local source layout mirrors the bucket exactly:
//   {IMAGE_SOURCE_DIR}/trip-photos/{tripId}/{cover|photos}/*.{jpg,png,webp,tiff}
// Each source `…/{name}.jpg` becomes `trip-photos/{tripId}/{kind}/{name}/{width}.avif`.

const SOURCE_DIR = process.env.IMAGE_SOURCE_DIR ?? "./source-images";
const BUCKET = requireEnv("R2_BUCKET");

// AVIF settings. `quality` (0–100) targets Cloudinary's q_auto ballpark; `effort`
// (0–9) trades encode CPU for smaller files — 4 is a sane build-time middle ground.
const AVIF_QUALITY = 55;
const AVIF_EFFORT = 4;

// One year, immutable: derivative URLs are content-addressed by width and never
// change for a given source, so the CDN/browser can cache them indefinitely.
const CACHE_CONTROL = "public, max-age=31536000, immutable";

const CONCURRENCY = 8;
const SOURCE_EXT = /\.(jpe?g|png|webp|tiff?)$/i;

const s3 = new S3Client({
	region: "auto",
	endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
		secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
	},
});

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`Missing required env var: ${name}`);
	return value;
}

// Walks the source tree and returns one entry per original image: its path on
// disk and the base key it maps to in the bucket (no width, no extension).
async function collectSources(): Promise<
	{ sourcePath: string; baseKey: string }[]
> {
	const root = join(SOURCE_DIR, "trip-photos");
	const sources: { sourcePath: string; baseKey: string }[] = [];

	const trips = await readdir(root, { withFileTypes: true });
	for (const trip of trips) {
		if (!trip.isDirectory()) continue;
		for (const kind of ["cover", "photos"] as const) {
			const dir = join(root, trip.name, kind);
			let entries;
			try {
				entries = await readdir(dir, { withFileTypes: true });
			} catch {
				continue; // a trip may have a cover but no photos folder, or vice versa
			}
			for (const entry of entries) {
				if (!entry.isFile() || !SOURCE_EXT.test(entry.name)) continue;
				const name = parse(entry.name).name;
				sources.push({
					sourcePath: join(dir, entry.name),
					baseKey: `trip-photos/${trip.name}/${kind}/${name}`,
				});
			}
		}
	}
	return sources;
}

async function processOne(sourcePath: string, baseKey: string): Promise<void> {
	const input = await readFile(sourcePath);
	for (const width of ALL_WIDTHS) {
		// `withoutEnlargement` mirrors Cloudinary's c_limit: never upscale past the
		// source — a smaller original just yields a smaller (capped) derivative.
		const body = await sharp(input)
			.resize({ width, withoutEnlargement: true })
			.avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
			.toBuffer();
		await s3.send(
			new PutObjectCommand({
				Bucket: BUCKET,
				Key: `${baseKey}/${width}.avif`,
				Body: body,
				ContentType: "image/avif",
				CacheControl: CACHE_CONTROL,
			})
		);
	}
}

async function main() {
	const sources = await collectSources();
	console.log(
		`Processing ${sources.length} images × ${ALL_WIDTHS.length} widths → bucket "${BUCKET}"...`
	);

	let done = 0;
	let failed = 0;
	let cursor = 0;

	async function worker() {
		while (cursor < sources.length) {
			const { sourcePath, baseKey } = sources[cursor++];
			try {
				await processOne(sourcePath, baseKey);
			} catch (err) {
				failed++;
				console.warn(`  ERR ${baseKey} — ${(err as Error).message}`);
			}
			done++;
			if (done % 10 === 0 || done === sources.length) {
				console.log(`  ${done}/${sources.length} (${failed} failed)`);
			}
		}
	}

	await Promise.all(
		Array.from({ length: Math.min(CONCURRENCY, sources.length) }, worker)
	);

	console.log(
		`Done. ${sources.length - failed} processed, ${failed} failed.`
	);
	if (failed > 0) process.exitCode = 1;
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => process.exit());
