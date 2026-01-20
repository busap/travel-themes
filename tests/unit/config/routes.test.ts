import { describe, it, expect } from 'vitest';
import { RouteKey, routes, RouteParams } from '@/config/routes';

describe('route configuration', () => {
  describe('RouteKey enum', () => {
    it('should have Home key', () => {
      expect(RouteKey.Home).toBe('home');
    });

    it('should have TripDetail key', () => {
      expect(RouteKey.TripDetail).toBe('tripDetail');
    });

    it('should have all expected route keys', () => {
      const keys = Object.values(RouteKey);
      expect(keys).toContain('home');
      expect(keys).toContain('tripDetail');
    });
  });

  describe('routes configuration', () => {
    it('should define home route', () => {
      expect(routes[RouteKey.Home]).toBeDefined();
      expect(routes[RouteKey.Home].path).toBe('/');
    });

    it('should define trip detail route', () => {
      expect(routes[RouteKey.TripDetail]).toBeDefined();
      expect(routes[RouteKey.TripDetail].path).toBe('/trip/:id');
    });

    it('should have home route without parameters', () => {
      expect(routes[RouteKey.Home].params).toBeUndefined();
    });

    it('should have trip detail route with id parameter', () => {
      expect(routes[RouteKey.TripDetail].params).toBeDefined();
      expect(routes[RouteKey.TripDetail].params).toContain('id');
      expect(routes[RouteKey.TripDetail].params?.length).toBe(1);
    });

    it('should have all route keys mapped in routes object', () => {
      const routeKeys = Object.values(RouteKey);
      routeKeys.forEach(key => {
        expect(routes[key as RouteKey]).toBeDefined();
        expect(routes[key as RouteKey]).toHaveProperty('path');
      });
    });

    it('should have valid path format for all routes', () => {
      Object.values(routes).forEach(route => {
        expect(route.path).toMatch(/^\//); // Should start with /
        expect(typeof route.path).toBe('string');
      });
    });

    it('should have consistent parameter format', () => {
      Object.values(routes).forEach(route => {
        if (route.params) {
          expect(Array.isArray(route.params)).toBe(true);
          route.params.forEach(param => {
            expect(typeof param).toBe('string');
            expect(route.path).toContain(`:${param}`);
          });
        }
      });
    });
  });

  describe('RouteParams type', () => {
    it('should type-check correctly for Home route', () => {
      // This test validates TypeScript types at compile time
      // Home route has no params, so the type should be 'never'
      type HomeParams = RouteParams[RouteKey.Home];
      // Type assertion to verify it's 'never' - this will only compile if the type is correct
      const _typeCheck: HomeParams extends never ? true : false = true;
      expect(_typeCheck).toBe(true);
    });

    it('should type-check correctly for TripDetail route', () => {
      // This test validates TypeScript types at compile time
      type TripDetailParams = RouteParams[RouteKey.TripDetail];
      const tripDetailParams: TripDetailParams = { id: 'test' };
      expect(tripDetailParams).toHaveProperty('id');
      expect(tripDetailParams.id).toBe('test');
    });
  });

  describe('route configuration integrity', () => {
    it('should not have duplicate paths', () => {
      const paths = Object.values(routes).map(r => r.path);
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(paths.length);
    });

    it('should not have duplicate route keys', () => {
      const keys = Object.keys(RouteKey);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('should have parameters match between params array and path', () => {
      Object.values(routes).forEach(route => {
        if (route.params) {
          route.params.forEach(param => {
            expect(route.path).toContain(`:${param}`);
          });

          // Count parameter placeholders in path
          const pathParamCount = (route.path.match(/:[^/]+/g) || []).length;
          expect(pathParamCount).toBe(route.params.length);
        } else {
          // If no params array, path should not contain parameter placeholders
          expect(route.path).not.toContain(':');
        }
      });
    });
  });
});
