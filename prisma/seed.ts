import { config } from "dotenv";
config({ path: ".env.local" });
config(); // fallback to .env

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { tripsData } from "./trips-data";

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`Missing required env var: ${name}`);
	return value;
}

const BUCKET = requireEnv("R2_BUCKET");
const PUBLIC_URL = requireEnv("NEXT_PUBLIC_R2_PUBLIC_URL").replace(/\/$/, "");

const s3 = new S3Client({
	region: "auto",
	endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
		secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
	},
});

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// The DB stores the base URL (no width, no extension); the image loader appends
// `/{width}.avif` at request time.
function publicUrl(baseKey: string): string {
	return `${PUBLIC_URL}/${baseKey}`;
}

// Lists the distinct image base keys under a prefix. The bucket holds one AVIF
// file per width (`{baseKey}/{width}.avif`), so we strip the `/{width}.avif`
// suffix and dedupe — yielding exactly one base key per source image.
async function listBaseKeys(prefix: string): Promise<string[]> {
	const baseKeys = new Set<string>();
	let token: string | undefined;
	do {
		const res = await s3.send(
			new ListObjectsV2Command({
				Bucket: BUCKET,
				Prefix: prefix,
				ContinuationToken: token,
			})
		);
		for (const obj of res.Contents ?? []) {
			if (!obj.Key) continue;
			const baseKey = obj.Key.replace(/\/\d+\.avif$/, "");
			if (baseKey !== obj.Key) baseKeys.add(baseKey);
		}
		token = res.IsTruncated ? res.NextContinuationToken : undefined;
	} while (token);
	return [...baseKeys].sort();
}

async function seed() {
	const knownIds = tripsData.map((t) => t.id);
	const deleted = await prisma.trip.deleteMany({
		where: { id: { notIn: knownIds } },
	});
	if (deleted.count > 0) {
		console.log(`🗑️  Deleted ${deleted.count} stale trip(s)`);
	}

	for (const trip of tripsData) {
		const coverKeys = await listBaseKeys(`trip-photos/${trip.id}/cover/`);
		if (!coverKeys.length) {
			await prisma.trip.deleteMany({ where: { id: trip.id } });
			console.log(`⏭️  "${trip.id}" not in R2 yet — removed from DB`);
			continue;
		}
		const coverPhoto = publicUrl(coverKeys[0]);
		const photoKeys = await listBaseKeys(`trip-photos/${trip.id}/photos/`);

		await prisma.trip.upsert({
			where: { id: trip.id },
			update: {
				name: trip.name,
				countries: trip.countries,
				year: trip.year,
				description: trip.description,
				coverPhoto,
			},
			create: {
				id: trip.id,
				name: trip.name,
				countries: trip.countries,
				year: trip.year,
				description: trip.description,
				coverPhoto,
			},
		});

		await prisma.photo.deleteMany({ where: { tripId: trip.id } });
		await prisma.photo.createMany({
			data: photoKeys.map((key, index) => ({
				tripId: trip.id,
				src: publicUrl(key),
				order: index,
			})),
		});

		await prisma.tripTheme.upsert({
			where: { tripId: trip.id },
			update: { theme: trip.theme },
			create: { tripId: trip.id, theme: trip.theme },
		});

		console.log(`✓ ${trip.name} (${photoKeys.length} photos)`);
	}

	console.log("✅ Seed complete");
	await prisma.$disconnect();
}

seed().catch((e) => {
	console.error(e);
	process.exit(1);
});
