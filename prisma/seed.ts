import { config } from "dotenv";
config({ path: ".env.local" });
config(); // fallback to .env

import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { tripsData } from "./trips-data";

cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const FOLDER = "trip-photos";

function publicUrl(path: string): string {
	return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${FOLDER}/${path}`;
}

async function listFiles(path: string): Promise<string[]> {
	try {
		const result = await cloudinary.api.resources_by_asset_folder(
			`${FOLDER}/${path}`,
			{ max_results: 500 }
		);
		return (result.resources as { public_id: string }[])
			.map((r) => r.public_id)
			.filter(Boolean);
	} catch (e: unknown) {
		if ((e as { error?: { http_code?: number } })?.error?.http_code === 404) {
			return [];
		}
		throw e;
	}
}

async function seed() {
	const knownIds = tripsData.map((t) => t.id);
	const deleted = await prisma.trip.deleteMany({
		where: { id: { notIn: knownIds } },
	});
	if (deleted.count > 0) {
		console.log(`🗑️  Deleted ${deleted.count} stale trip(s)`);
	}

	for (const config of tripsData) {
		const coverFiles = await listFiles(`${config.id}/cover`);
		if (!coverFiles.length) {
			await prisma.trip.deleteMany({ where: { id: config.id } });
			console.log(`⏭️  "${config.id}" not on Cloudinary yet — removed from DB`);
			continue;
		}
		const coverPhoto = publicUrl(`${config.id}/cover/${coverFiles[0]}`);
		const photoFiles = await listFiles(`${config.id}/photos`);

		await prisma.trip.upsert({
			where: { id: config.id },
			update: {
				name: config.name,
				countries: config.countries,
				year: config.year,
				description: config.description,
				coverPhoto,
			},
			create: {
				id: config.id,
				name: config.name,
				countries: config.countries,
				year: config.year,
				description: config.description,
				coverPhoto,
			},
		});

		await prisma.photo.deleteMany({ where: { tripId: config.id } });
		await prisma.photo.createMany({
			data: photoFiles.map((file, index) => ({
				tripId: config.id,
				src: publicUrl(`${config.id}/photos/${file}`),
				order: index,
			})),
		});

		await prisma.tripTheme.upsert({
			where: { tripId: config.id },
			update: { theme: config.theme },
			create: { tripId: config.id, theme: config.theme },
		});

		console.log(`✓ ${config.name} (${photoFiles.length} photos)`);
	}

	console.log("✅ Seed complete");
	await prisma.$disconnect();
}

seed().catch((e) => {
	console.error(e);
	process.exit(1);
});
