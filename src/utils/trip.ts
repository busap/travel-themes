import { Trip } from '@/types/trip';
import { trips } from '@/mocks/trips';
import {Theme} from "@/enums/theme";
import {tripThemes} from "@/mocks/trip-themes";

export function getTripBySlug(slug: string): Trip | undefined {
  return trips.find((trip) => trip.id === slug);
}

export function getAllTrips(): Trip[] {
  return trips;
}

export function getThemeForTrip(tripId: string): Theme {
    const tripTheme = tripThemes.find((tt) => tt.tripId === tripId);
    return tripTheme?.theme ?? Theme.Minimal;
}
