import { Trip } from "@/types/trip";
import { Theme } from "@/enums/theme";
import { Country } from "@/enums/country";
import { prisma } from "@/lib/prisma";
import type {
	Trip as PrismaTrip,
	Photo as PrismaPhoto,
	TripTheme as PrismaTripTheme,
} from "@/generated/prisma/client";

type PrismaTripWithRelations = PrismaTrip & {
	photos: PrismaPhoto[];
	tripTheme: PrismaTripTheme | null;
};

function parseCountry(value: string): Country {
	if (Object.values(Country).includes(value as Country))
		return value as Country;
	throw new Error(`Unknown country code: ${value}`);
}

function mapPrismaTrip(row: PrismaTripWithRelations): Trip {
	return {
		id: row.id,
		name: row.name,
		countries: row.countries.map(parseCountry),
		year: row.year,
		description: row.description,
		coverPhoto: row.coverPhoto,
		photos: row.photos
			.sort((a: PrismaPhoto, b: PrismaPhoto) => a.order - b.order)
			.map((p: PrismaPhoto) => ({
				src: p.src,
				title: p.title ?? undefined,
				description: p.description ?? undefined,
			})),
	};
}

function parseTheme(value: string | null | undefined): Theme {
	if (value && (Object.values(Theme) as string[]).includes(value)) {
		return value as Theme;
	}
	return Theme.Collage;
}

export async function getAllTrips(): Promise<Trip[]> {
	try {
		const rows = await prisma.trip.findMany({
			include: { photos: true, tripTheme: true },
			orderBy: { name: "asc" },
		});
		return rows.map(mapPrismaTrip);
	} catch {
		return [];
	}
}

export async function getTripById(id: string): Promise<Trip | undefined> {
	try {
		const row = await prisma.trip.findUnique({
			where: { id },
			include: { photos: true, tripTheme: true },
		});
		return row ? mapPrismaTrip(row) : undefined;
	} catch {
		return undefined;
	}
}

export async function getThemeForTrip(tripId: string): Promise<Theme> {
	try {
		const row = await prisma.tripTheme.findUnique({ where: { tripId } });
		return parseTheme(row?.theme);
	} catch {
		return Theme.Collage;
	}
}
