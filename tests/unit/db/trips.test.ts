import { describe, it, expect, vi, beforeEach } from "vitest";
import { Theme } from "@/enums/theme";
import { Country } from "@/enums/country";

vi.mock("@/lib/prisma", () => ({
	prisma: {
		trip: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
		},
		tripTheme: {
			findUnique: vi.fn(),
		},
	},
}));

// Dynamic imports after mock is registered
const { getAllTrips, getTripById, getThemeForTrip } = await import(
	"@/db/trips"
);
const { prisma } = await import("@/lib/prisma");

const mockTripRow = {
	id: "test-trip",
	name: "Test Trip",
	countries: ["ES"],
	year: 2021,
	description: "A test trip",
	coverPhoto: "https://res.cloudinary.com/test/image/upload/test.jpg",
	createdAt: new Date(),
	photos: [
		{
			id: 2,
			tripId: "test-trip",
			src: "https://res.cloudinary.com/test/image/upload/p2.jpg",
			title: null,
			description: null,
			order: 1,
		},
		{
			id: 1,
			tripId: "test-trip",
			src: "https://res.cloudinary.com/test/image/upload/p1.jpg",
			title: "Photo 1",
			description: "A photo",
			order: 2,
		},
	],
	tripTheme: { tripId: "test-trip", theme: "collage" },
};

beforeEach(() => {
	vi.clearAllMocks();
});

describe("getTripById", () => {
	it("returns mapped trip when found", async () => {
		vi.mocked(prisma.trip.findUnique).mockResolvedValueOnce(mockTripRow);

		const trip = await getTripById("test-trip");

		expect(trip).toBeDefined();
		expect(trip!.id).toBe("test-trip");
		expect(trip!.name).toBe("Test Trip");
		expect(trip!.year).toBe(2021);
		expect(trip!.countries).toEqual([Country.ES]);
	});

	it("returns undefined when not found", async () => {
		vi.mocked(prisma.trip.findUnique).mockResolvedValueOnce(null);

		const trip = await getTripById("nonexistent");

		expect(trip).toBeUndefined();
	});

	it("sorts photos by ascending order", async () => {
		vi.mocked(prisma.trip.findUnique).mockResolvedValueOnce(mockTripRow);

		const trip = await getTripById("test-trip");

		expect(trip!.photos[0].src).toContain("p2.jpg");
		expect(trip!.photos[1].src).toContain("p1.jpg");
	});

	it("coerces null photo title and description to undefined", async () => {
		vi.mocked(prisma.trip.findUnique).mockResolvedValueOnce(mockTripRow);

		const trip = await getTripById("test-trip");
		const firstPhoto = trip!.photos[0];

		expect(firstPhoto.title).toBeUndefined();
		expect(firstPhoto.description).toBeUndefined();
	});

	it("preserves non-null photo title and description", async () => {
		vi.mocked(prisma.trip.findUnique).mockResolvedValueOnce(mockTripRow);

		const trip = await getTripById("test-trip");
		const secondPhoto = trip!.photos[1];

		expect(secondPhoto.title).toBe("Photo 1");
		expect(secondPhoto.description).toBe("A photo");
	});

	it("maps multiple countries correctly", async () => {
		vi.mocked(prisma.trip.findUnique).mockResolvedValueOnce({
			...mockTripRow,
			countries: ["ES", "FR"],
		});

		const trip = await getTripById("test-trip");

		expect(trip!.countries).toEqual([Country.ES, Country.FR]);
	});

	it("returns undefined on invalid country code", async () => {
		vi.mocked(prisma.trip.findUnique).mockResolvedValueOnce({
			...mockTripRow,
			countries: ["XX"],
		});

		// parseCountry throws, but the try-catch in getTripById swallows it
		const trip = await getTripById("test-trip");
		expect(trip).toBeUndefined();
	});

	it("returns undefined on prisma error", async () => {
		vi.mocked(prisma.trip.findUnique).mockRejectedValueOnce(
			new Error("DB error")
		);

		const trip = await getTripById("test-trip");

		expect(trip).toBeUndefined();
	});
});

describe("getAllTrips", () => {
	it("returns empty array when no trips exist", async () => {
		vi.mocked(prisma.trip.findMany).mockResolvedValueOnce([]);

		const trips = await getAllTrips();

		expect(trips).toEqual([]);
	});

	it("maps multiple trips correctly", async () => {
		const secondRow = {
			...mockTripRow,
			id: "second-trip",
			name: "Second Trip",
			countries: ["JP"],
		};
		vi.mocked(prisma.trip.findMany).mockResolvedValueOnce([
			mockTripRow,
			secondRow,
		]);

		const trips = await getAllTrips();

		expect(trips).toHaveLength(2);
		expect(trips[0].id).toBe("test-trip");
		expect(trips[1].id).toBe("second-trip");
		expect(trips[1].countries).toEqual([Country.JP]);
	});

	it("returns empty array on prisma error", async () => {
		vi.mocked(prisma.trip.findMany).mockRejectedValueOnce(
			new Error("DB error")
		);

		const trips = await getAllTrips();

		expect(trips).toEqual([]);
	});
});

describe("getThemeForTrip", () => {
	it("returns the stored theme when found", async () => {
		vi.mocked(prisma.tripTheme.findUnique).mockResolvedValueOnce({
			tripId: "test-trip",
			theme: "aurora",
		});

		const theme = await getThemeForTrip("test-trip");

		expect(theme).toBe(Theme.Aurora);
	});

	it("falls back to Collage when tripTheme is null", async () => {
		vi.mocked(prisma.tripTheme.findUnique).mockResolvedValueOnce(null);

		const theme = await getThemeForTrip("test-trip");

		expect(theme).toBe(Theme.Collage);
	});

	it("falls back to Collage for an unknown theme string", async () => {
		vi.mocked(prisma.tripTheme.findUnique).mockResolvedValueOnce({
			tripId: "test-trip",
			theme: "not-a-real-theme",
		});

		const theme = await getThemeForTrip("test-trip");

		expect(theme).toBe(Theme.Collage);
	});

	it("falls back to Collage on prisma error", async () => {
		vi.mocked(prisma.tripTheme.findUnique).mockRejectedValueOnce(
			new Error("DB error")
		);

		const theme = await getThemeForTrip("test-trip");

		expect(theme).toBe(Theme.Collage);
	});

	it("recognises all valid Theme enum values", async () => {
		for (const themeValue of Object.values(Theme)) {
			vi.mocked(prisma.tripTheme.findUnique).mockResolvedValueOnce({
				tripId: "test-trip",
				theme: themeValue,
			});

			const theme = await getThemeForTrip("test-trip");
			expect(theme).toBe(themeValue);
		}
	});
});
