import {
	getTripByIdFromDb,
	getAllTripsFromDb,
	getThemeForTripFromDb,
} from "@/utils/trip";
import { getThemeConfig } from "@/config/theme-config";
import { TripDetail } from "@/ui/pages/trip-detail/trip-detail";
import { notFound } from "next/navigation";

export default async function TripPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const trip = await getTripByIdFromDb(id);

	if (!trip) {
		notFound();
	}

	const theme = await getThemeForTripFromDb(trip.id);
	const config = getThemeConfig(theme);

	return <TripDetail trip={trip} config={config} />;
}

// Generate static params for all trips
export async function generateStaticParams() {
	const trips = await getAllTripsFromDb();
	return trips.map((trip) => ({
		id: trip.id,
	}));
}
