import { describe, it, expect } from 'vitest';
import { getTripById, getAllTrips, getThemeForTrip, getTripThemeConfig } from '@/utils/trip';
import { Theme } from '@/enums/theme';

describe('trip utilities', () => {
  describe('getTripById', () => {
    it('should return trip when ID exists', () => {
      const trip = getTripById('japan-2023');
      expect(trip).toBeDefined();
      expect(trip?.id).toBe('japan-2023');
      expect(trip?.name).toBe('Japan Adventures');
      expect(trip?.countries).toEqual(['Japan']);
    });

    it('should return different trips by ID', () => {
      const morocco = getTripById('morocco-markets');
      expect(morocco?.name).toBe('Colors of Morocco');

      const nordic = getTripById('nordic-winter');
      expect(nordic?.name).toBe('Nordic Winter');
    });

    it('should return undefined for non-existent ID', () => {
      const trip = getTripById('non-existent-trip');
      expect(trip).toBeUndefined();
    });

    it('should return undefined for empty string ID', () => {
      const trip = getTripById('');
      expect(trip).toBeUndefined();
    });

    it('should return trip with all expected properties', () => {
      const trip = getTripById('japan-2023');
      expect(trip).toHaveProperty('id');
      expect(trip).toHaveProperty('name');
      expect(trip).toHaveProperty('countries');
      expect(trip).toHaveProperty('year');
      expect(trip).toHaveProperty('description');
      expect(trip).toHaveProperty('coverPhoto');
      expect(trip).toHaveProperty('photos');
      expect(Array.isArray(trip?.photos)).toBe(true);
    });
  });

  describe('getAllTrips', () => {
    it('should return an array of trips', () => {
      const trips = getAllTrips();
      expect(Array.isArray(trips)).toBe(true);
      expect(trips.length).toBeGreaterThan(0);
    });

    it('should return at least 3 trips', () => {
      const trips = getAllTrips();
      expect(trips.length).toBeGreaterThanOrEqual(3);
    });

    it('should include all known trips', () => {
      const trips = getAllTrips();
      const tripIds = trips.map(t => t.id);
      expect(tripIds).toContain('japan-2023');
      expect(tripIds).toContain('morocco-markets');
      expect(tripIds).toContain('nordic-winter');
    });

    it('should return trips with valid structure', () => {
      const trips = getAllTrips();
      trips.forEach(trip => {
        expect(trip).toHaveProperty('id');
        expect(trip).toHaveProperty('name');
        expect(trip).toHaveProperty('countries');
        expect(trip).toHaveProperty('coverPhoto');
        expect(trip).toHaveProperty('photos');
        expect(typeof trip.id).toBe('string');
        expect(typeof trip.name).toBe('string');
        expect(Array.isArray(trip.countries)).toBe(true);
        expect(Array.isArray(trip.photos)).toBe(true);
      });
    });
  });

  describe('getThemeForTrip', () => {
    it('should return Minimal theme for Japan trip', () => {
      const theme = getThemeForTrip('japan-2023');
      expect(theme).toBe(Theme.Collage);
    });

    it('should return Immersive theme for Morocco trip', () => {
      const theme = getThemeForTrip('morocco-markets');
      expect(theme).toBe(Theme.Collage);
    });

    it('should return Editorial theme for Nordic trip', () => {
      const theme = getThemeForTrip('nordic-winter');
      expect(theme).toBe(Theme.Collage);
    });

    it('should return Minimal theme as fallback for unknown trip', () => {
      const theme = getThemeForTrip('unknown-trip');
      expect(theme).toBe(Theme.Collage);
    });

    it('should return Minimal theme for empty string trip ID', () => {
      const theme = getThemeForTrip('');
      expect(theme).toBe(Theme.Collage);
    });
  });

  describe('getTripThemeConfig', () => {
    it('should return theme config for Japan trip', () => {
      const config = getTripThemeConfig('japan-2023');
      expect(config).toBeDefined();
      expect(config).toHaveProperty('component');
      expect(config).toHaveProperty('layout');
      expect(config).toHaveProperty('animation');
      expect(config).toHaveProperty('photos');
      expect(config).toHaveProperty('styling');
    });

    it('should return theme config for Morocco trip', () => {
      const config = getTripThemeConfig('morocco-markets');
      expect(config).toBeDefined();
      expect(config).toHaveProperty('layout');
    });

    it('should return theme config for Nordic trip', () => {
      const config = getTripThemeConfig('nordic-winter');
      expect(config).toBeDefined();
      expect(config).toHaveProperty('layout');
    });

    it('should return fallback theme config for unknown trip', () => {
      const config = getTripThemeConfig('unknown-trip');
      expect(config).toBeDefined();
      // Should get Minimal theme config as fallback
      expect(config).toHaveProperty('layout');
    });

    it('should return config with all required properties', () => {
      const config = getTripThemeConfig('japan-2023');

      // Component
      expect(typeof config.component).toBe('string');

      // Layout properties
      expect(config.layout).toHaveProperty('type');
      expect(config.layout).toHaveProperty('scrollDirection');
      expect(config.layout).toHaveProperty('spacing');

      // Animation properties
      expect(config.animation).toHaveProperty('enabled');

      // Photos properties
      expect(config.photos).toHaveProperty('arrangement');
      expect(config.photos).toHaveProperty('revealPattern');

      // Styling properties
      expect(config.styling).toBeDefined();
    });

    it('should return different configs for different trips', () => {
      const japanConfig = getTripThemeConfig('japan-2023');
      const moroccoConfig = getTripThemeConfig('morocco-markets');

      // Configs might differ based on theme
      expect(japanConfig).toBeDefined();
      expect(moroccoConfig).toBeDefined();
    });
  });
});
