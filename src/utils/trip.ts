import { Trip } from "@/types/trip";
import { trips } from "@/mocks/trips";
import { Theme } from "@/enums/theme";
import { tripThemes } from "@/mocks/trip-themes";
import { getThemeConfig, ThemeConfig } from "@/config/theme-config";
import { prisma } from "@/lib/prisma";
import type { Trip as PrismaTrip, Photo as PrismaPhoto, TripTheme as PrismaTripTheme } from "@/generated/prisma/client";

export function getTripById(id: string): Trip | undefined {
	return trips.find((trip) => trip.id === id);
}

export function getAllTrips(): Trip[] {
	return trips;
}

export function getThemeForTrip(tripId: string): Theme {
	const tripTheme = tripThemes.find((tt) => tt.tripId === tripId);
	return tripTheme?.theme ?? Theme.Collage;
}

export function getTripThemeConfig(tripId: string): ThemeConfig {
	const theme = getThemeForTrip(tripId);
	return getThemeConfig(theme);
}

// --- Database-backed async functions ---

type PrismaTripWithRelations = PrismaTrip & {
	photos: PrismaPhoto[];
	tripTheme: PrismaTripTheme | null;
};

function mapPrismaTrip(row: PrismaTripWithRelations): Trip {
	return {
		id: row.id,
		name: row.name,
		countries: row.countries,
		year: row.year ?? undefined,
		description: row.description ?? undefined,
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

export async function getAllTripsFromDb(): Promise<Trip[]> {
	const rows = await prisma.trip.findMany({
		include: { photos: true, tripTheme: true },
		orderBy: { name: "asc" },
	});
	return rows.map(mapPrismaTrip);
}

export async function getTripByIdFromDb(id: string): Promise<Trip | undefined> {
	const row = await prisma.trip.findUnique({
		where: { id },
		include: { photos: true, tripTheme: true },
	});
	return row ? mapPrismaTrip(row) : undefined;
}

export async function getThemeForTripFromDb(tripId: string): Promise<Theme> {
	const row = await prisma.tripTheme.findUnique({ where: { tripId } });
	return (row?.theme as Theme) ?? Theme.Collage;
}
