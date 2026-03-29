import { RouteKey, RouteParams, routes } from "@/config/routes";

/**
 * Type-safe route builder
 *
 * Builds URLs based on route configuration with compile-time type checking.
 *
 * @example
 * buildRoute(RouteKey.Home) // => '/'
 * buildRoute(RouteKey.TripDetail, { id: 'japan-2023' }) // => '/trip/japan-2023'
 */
export function buildRoute<K extends RouteKey>(
	key: K,
	...args: RouteParams[K] extends never ? [] : [RouteParams[K]]
): string {
	const route = routes[key];
	const params = args[0] as Record<string, string> | undefined;

	if (!route.params || !params) {
		return route.path;
	}

	let path = route.path;
	for (const param of route.params) {
		const value = params[param];
		if (value === undefined) {
			throw new Error(
				`Missing required parameter "${param}" for route "${key}"`
			);
		}
		path = path.replace(`:${param}`, encodeURIComponent(value));
	}

	return path;
}

export function getTripRoute(tripId: string): string {
	return buildRoute(RouteKey.TripDetail, { id: tripId });
}

export function getHomeRoute(): string {
	return buildRoute(RouteKey.Home);
}
