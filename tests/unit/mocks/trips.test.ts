import { describe, it, expect } from "vitest";
import { randomTrip, trips } from "@/mocks/trips";
import { Country } from "@/enums/country";

describe("trips mock data", () => {
	it("exports a non-empty trips array", () => {
		expect(Array.isArray(trips)).toBe(true);
		expect(trips.length).toBeGreaterThan(0);
	});

	it("every trip has the required fields", () => {
		for (const trip of trips) {
			expect(typeof trip.id).toBe("string");
			expect(typeof trip.name).toBe("string");
			expect(Array.isArray(trip.countries)).toBe(true);
			expect(typeof trip.year).toBe("number");
			expect(typeof trip.description).toBe("string");
			expect(typeof trip.coverPhoto).toBe("string");
			expect(Array.isArray(trip.photos)).toBe(true);
		}
	});

	it("all country codes are valid Country enum values", () => {
		const validCodes = new Set(Object.values(Country));
		for (const trip of trips) {
			for (const code of trip.countries) {
				expect(validCodes.has(code)).toBe(true);
			}
		}
	});

	it("all trip IDs are unique", () => {
		const ids = trips.map((t) => t.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe("randomTrip", () => {
	it("returns a trip with all required fields", () => {
		const trip = randomTrip();
		expect(typeof trip.id).toBe("string");
		expect(typeof trip.name).toBe("string");
		expect(Array.isArray(trip.countries)).toBe(true);
		expect(typeof trip.year).toBe("number");
		expect(typeof trip.description).toBe("string");
		expect(typeof trip.coverPhoto).toBe("string");
		expect(Array.isArray(trip.photos)).toBe(true);
	});

	it("uses the provided seed as the trip ID", () => {
		expect(randomTrip("my-seed").id).toBe("my-seed");
	});

	it("generates a prefixed ID when no seed is given", () => {
		expect(randomTrip().id).toMatch(/^trip-/);
	});

	it("returns 1 or 2 countries", () => {
		for (let i = 0; i < 20; i++) {
			const { countries } = randomTrip();
			expect(countries.length).toBeGreaterThanOrEqual(1);
			expect(countries.length).toBeLessThanOrEqual(2);
		}
	});

	it("year is between 2020 and 2024 inclusive", () => {
		for (let i = 0; i < 20; i++) {
			const { year } = randomTrip();
			expect(year).toBeGreaterThanOrEqual(2020);
			expect(year).toBeLessThanOrEqual(2024);
		}
	});

	it("returns 1 to 4 photos", () => {
		for (let i = 0; i < 20; i++) {
			const { photos } = randomTrip();
			expect(photos.length).toBeGreaterThanOrEqual(1);
			expect(photos.length).toBeLessThanOrEqual(4);
		}
	});

	it("coverPhoto is an Unsplash URL", () => {
		expect(randomTrip().coverPhoto).toMatch(
			/^https:\/\/images\.unsplash\.com\//
		);
	});

	it("photo src values are Unsplash URLs", () => {
		const { photos } = randomTrip();
		for (const photo of photos) {
			expect(photo.src).toMatch(/^https:\/\/images\.unsplash\.com\//);
		}
	});

	it("countries are valid Country enum values", () => {
		const validCodes = new Set(Object.values(Country));
		for (let i = 0; i < 10; i++) {
			for (const code of randomTrip().countries) {
				expect(validCodes.has(code)).toBe(true);
			}
		}
	});
});
