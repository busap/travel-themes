import { describe, it, expect, vi } from "vitest";
import { getCountryName, getCountryNames } from "@/utils/country";
import { Country } from "@/enums/country";

describe("getCountryName", () => {
	it("falls back to the raw code when DisplayNames returns undefined", async () => {
		vi.spyOn(globalThis.Intl, "DisplayNames").mockImplementation(
			function () {
				return { of: () => undefined, resolvedOptions: () => ({}) };
			} as never
		);
		vi.resetModules();
		const { getCountryName: fn } = await import("@/utils/country");
		expect(fn(Country.US)).toBe(Country.US);
		vi.restoreAllMocks();
	});

	it("should return a human-readable name for a country code", () => {
		expect(getCountryName(Country.DE)).toBe("Germany");
		expect(getCountryName(Country.TH)).toBe("Thailand");
		expect(getCountryName(Country.IT)).toBe("Italy");
		expect(getCountryName(Country.ES)).toBe("Spain");
		expect(getCountryName(Country.IS)).toBe("Iceland");
	});

	it("should return a string for every Country enum value", () => {
		Object.values(Country).forEach((code) => {
			expect(typeof getCountryName(code)).toBe("string");
			expect(getCountryName(code).length).toBeGreaterThan(0);
		});
	});
});

describe("getCountryNames", () => {
	it("should join a single country name without a separator", () => {
		expect(getCountryNames([Country.DE])).toBe("Germany");
	});

	it("should join multiple country names with the default separator", () => {
		expect(getCountryNames([Country.DE, Country.NL])).toBe(
			"Germany, Netherlands"
		);
	});

	it("should join multiple country names with a custom separator", () => {
		expect(
			getCountryNames([Country.IT, Country.ES, Country.IS], " & ")
		).toBe("Italy & Spain & Iceland");
	});

	it("should return an empty string for an empty array", () => {
		expect(getCountryNames([])).toBe("");
	});
});
