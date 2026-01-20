import { Trip } from '@/types/trip';
import { trips } from '@/mocks/trips';
import {Theme} from "@/enums/theme";
import {tripThemes} from "@/mocks/trip-themes";
import { getThemeConfig, ThemeConfig } from '@/config/theme-config';

export function getTripById(id: string): Trip | undefined {
  return trips.find((trip) => trip.id === id);
}

export function getAllTrips(): Trip[] {
  return trips;
}

export function getThemeForTrip(tripId: string): Theme {
    const tripTheme = tripThemes.find((tt) => tt.tripId === tripId);
    return tripTheme?.theme ?? Theme.Minimal;
}

export function getTripThemeConfig(tripId: string): ThemeConfig {
  const theme = getThemeForTrip(tripId);
  return getThemeConfig(theme);
}
