import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { tripsData } from "./trips-data";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const BUCKET = "trip-photos";

function publicUrl(path: string): string {
	return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function listFiles(path: string): Promise<string[]> {
	const { data, error } = await supabase.storage.from(BUCKET).list(path);
	if (error) throw new Error(`Storage list error at "${path}": ${error.message}`);
	return (data ?? []).map((f) => f.name).filter((n) => !n.startsWith("."));
}

async function seed() {
	for (const config of tripsData) {
		const coverFiles = await listFiles(`${config.id}/cover`);
		if (!coverFiles.length) {
			console.warn(`⚠️  No cover image found for "${config.id}", skipping`);
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
				photos: {
					create: photoFiles.map((file, index) => ({
						src: publicUrl(`${config.id}/photos/${file}`),
						order: index,
					})),
				},
			},
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
