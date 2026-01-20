import { getTripById, getAllTrips, getThemeForTrip } from '@/utils/trip';
import { getThemeConfig } from '@/config/theme-config';
import { TripDetail } from '@/pages/trip-detail/trip-detail';
import { notFound } from 'next/navigation';

export default async function TripPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const trip = getTripById(id);

  if (!trip) {
    notFound();
  }

  const theme = getThemeForTrip(trip.id);
  const config = getThemeConfig(theme);

  return <TripDetail trip={trip} config={config} />;
}

// Generate static params for all trips
export async function generateStaticParams() {
  const trips = getAllTrips();
  return trips.map((trip) => ({
    id: trip.id,
  }));
}
