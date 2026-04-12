import { describe, it, expect } from "vitest";
import { Country } from "@/enums/country";

describe("Country enum", () => {
	it("should contain common travel country codes", () => {
		expect(Country.JP).toBe("JP");
		expect(Country.FR).toBe("FR");
		expect(Country.IT).toBe("IT");
		expect(Country.ES).toBe("ES");
		expect(Country.DE).toBe("DE");
		expect(Country.US).toBe("US");
		expect(Country.GB).toBe("GB");
		expect(Country.AU).toBe("AU");
		expect(Country.TH).toBe("TH");
		expect(Country.PT).toBe("PT");
	});

	it("should have all values as 2-letter uppercase strings", () => {
		Object.values(Country).forEach((code) => {
			expect(typeof code).toBe("string");
			expect(code).toHaveLength(2);
			expect(code).toBe(code.toUpperCase());
		});
	});

	it("should have no duplicate values", () => {
		const values = Object.values(Country);
		const unique = new Set(values);
		expect(unique.size).toBe(values.length);
	});

	it("should have keys matching values", () => {
		Object.entries(Country).forEach(([key, value]) => {
			expect(key).toBe(value);
		});
	});

	it("should cover all continents with representative countries", () => {
		// Europe
		expect(Country).toHaveProperty("FR");
		expect(Country).toHaveProperty("DE");
		// Asia
		expect(Country).toHaveProperty("JP");
		expect(Country).toHaveProperty("CN");
		// Americas
		expect(Country).toHaveProperty("US");
		expect(Country).toHaveProperty("BR");
		// Africa
		expect(Country).toHaveProperty("MA");
		expect(Country).toHaveProperty("EG");
		// Oceania
		expect(Country).toHaveProperty("AU");
		expect(Country).toHaveProperty("NZ");
	});
});
