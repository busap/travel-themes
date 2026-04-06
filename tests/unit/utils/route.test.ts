import { describe, it, expect } from "vitest";
import { buildRoute, getTripRoute, getHomeRoute } from "@/utils/route";
import { RouteKey } from "@/config/routes";

describe("route utilities", () => {
	describe("buildRoute", () => {
		it("should build home route without parameters", () => {
			const result = buildRoute(RouteKey.Home);
			expect(result).toBe("/");
		});

		it("should build trip detail route with id parameter", () => {
			const result = buildRoute(RouteKey.TripDetail, {
				id: "japan-2023",
			});
			expect(result).toBe("/trip/japan-2023");
		});

		it("should URL-encode route parameters", () => {
			const result = buildRoute(RouteKey.TripDetail, {
				id: "trip with spaces",
			});
			expect(result).toBe("/trip/trip%20with%20spaces");
		});

		it("should handle special characters in parameters", () => {
			const result = buildRoute(RouteKey.TripDetail, {
				id: "trip-2024/special",
			});
			expect(result).toBe("/trip/trip-2024%2Fspecial");
		});

		it("should return unprocessed path when params object is missing", () => {
			// @ts-expect-error - Testing runtime behavior when params are missing (prevented by TypeScript)
			const result = buildRoute(RouteKey.TripDetail);
			expect(result).toBe("/trip/:id");
		});

		it("should throw error when parameter is undefined", () => {
			// @ts-expect-error - Testing runtime error for undefined parameter
			expect(() =>
				buildRoute(RouteKey.TripDetail, { id: undefined })
			).toThrow('Missing required parameter "id" for route "tripDetail"');
		});

		it("should handle empty string parameters", () => {
			const result = buildRoute(RouteKey.TripDetail, { id: "" });
			expect(result).toBe("/trip/");
		});
	});

	describe("getTripRoute", () => {
		it("should build trip detail route", () => {
			const result = getTripRoute("japan-2023");
			expect(result).toBe("/trip/japan-2023");
		});

		it("should handle different trip IDs", () => {
			expect(getTripRoute("morocco-markets")).toBe(
				"/trip/morocco-markets"
			);
			expect(getTripRoute("nordic-winter")).toBe("/trip/nordic-winter");
		});

		it("should URL-encode trip IDs", () => {
			const result = getTripRoute("trip with spaces");
			expect(result).toBe("/trip/trip%20with%20spaces");
		});
	});

	describe("getHomeRoute", () => {
		it("should return home route", () => {
			const result = getHomeRoute();
			expect(result).toBe("/");
		});

		it("should always return the same value", () => {
			expect(getHomeRoute()).toBe(getHomeRoute());
		});
	});
});
