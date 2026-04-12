import { describe, it, expect } from "vitest";
import {
	countryNameToId,
	countryCodeToId,
	idToCountryName,
} from "@/utils/globe-country-map";

describe("globe-country-map", () => {
	describe("countryCodeToId", () => {
		it("should map common ISO codes to numeric IDs", () => {
			expect(countryCodeToId["JP"]).toBe("392");
			expect(countryCodeToId["FR"]).toBe("250");
			expect(countryCodeToId["DE"]).toBe("276");
			expect(countryCodeToId["US"]).toBe("840");
			expect(countryCodeToId["GB"]).toBe("826");
			expect(countryCodeToId["AU"]).toBe("036");
		});

		it("should have all values as 3-digit zero-padded strings", () => {
			Object.values(countryCodeToId).forEach((id) => {
				expect(id).toMatch(/^\d{3}$/);
			});
		});

		it("should have all keys as 2-letter uppercase strings", () => {
			Object.keys(countryCodeToId).forEach((code) => {
				expect(code).toHaveLength(2);
				expect(code).toBe(code.toUpperCase());
			});
		});

		it("should cover all countries used in mock trips", () => {
			// Countries used in src/mocks/trips.ts
			expect(countryCodeToId["JP"]).toBeDefined(); // Japan
			expect(countryCodeToId["MA"]).toBeDefined(); // Morocco
			expect(countryCodeToId["NO"]).toBeDefined(); // Norway
			expect(countryCodeToId["IS"]).toBeDefined(); // Iceland
			expect(countryCodeToId["IT"]).toBeDefined(); // Italy
			expect(countryCodeToId["GR"]).toBeDefined(); // Greece
			expect(countryCodeToId["TH"]).toBeDefined(); // Thailand
			expect(countryCodeToId["FR"]).toBeDefined(); // France
			expect(countryCodeToId["CH"]).toBeDefined(); // Switzerland
			expect(countryCodeToId["ES"]).toBeDefined(); // Spain
			expect(countryCodeToId["AU"]).toBeDefined(); // Australia
			expect(countryCodeToId["NZ"]).toBeDefined(); // New Zealand
			expect(countryCodeToId["ID"]).toBeDefined(); // Indonesia
			expect(countryCodeToId["PT"]).toBeDefined(); // Portugal
			expect(countryCodeToId["PE"]).toBeDefined(); // Peru
		});
	});

	describe("countryNameToId", () => {
		it("should map full country names to numeric IDs", () => {
			expect(countryNameToId["Japan"]).toBe("392");
			expect(countryNameToId["France"]).toBe("250");
			expect(countryNameToId["Germany"]).toBe("276");
		});

		it("should handle country name aliases", () => {
			expect(countryNameToId["Czech Republic"]).toBe("203");
			expect(countryNameToId["Czechia"]).toBe("203");
		});
	});

	describe("idToCountryName", () => {
		it("should map numeric IDs to country names", () => {
			expect(idToCountryName["392"]).toBe("Japan");
			expect(idToCountryName["250"]).toBe("France");
			expect(idToCountryName["840"]).toBe("United States");
		});

		it("should be consistent with countryNameToId for unambiguous entries", () => {
			// For entries that don't have aliases, round-trip should work
			const unambiguous = ["Japan", "France", "Germany", "Australia", "Norway"];
			unambiguous.forEach((name) => {
				const id = countryNameToId[name];
				expect(idToCountryName[id]).toBe(name);
			});
		});
	});
});
