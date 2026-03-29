/**
 * Route Configuration
 *
 * Defines all application routes with type-safe parameter handling.
 * Use route builder functions from utils/route.ts to generate URLs.
 */

export enum RouteKey {
	Home = "home",
	TripDetail = "tripDetail",
}

interface RouteConfig {
	path: string;
	params?: string[];
}

/**
 * Application route definitions
 *
 * Pattern format:
 * - Static segments: /about
 * - Dynamic segments: /trip/:id
 * - Multiple params: /trips/:country/:year
 */
export const routes: Record<RouteKey, RouteConfig> = {
	[RouteKey.Home]: {
		path: "/",
	},
	[RouteKey.TripDetail]: {
		path: "/trip/:id",
		params: ["id"],
	},
};

/**
 * Route parameter types for type-safe route building
 */
export type RouteParams = {
	[RouteKey.Home]: never;
	[RouteKey.TripDetail]: { id: string };
};
