import { describe, it, expect } from "vitest";
import { PolaroidCardVariant } from "@/enums/polaroid-card-variant";

describe("PolaroidCardVariant", () => {
	it("has Trip and Photo variants", () => {
		expect(PolaroidCardVariant.Trip).toBe("trip");
		expect(PolaroidCardVariant.Photo).toBe("photo");
	});

	it("has exactly two variants", () => {
		expect(Object.keys(PolaroidCardVariant)).toHaveLength(2);
	});

	it("all values are lowercase strings", () => {
		for (const value of Object.values(PolaroidCardVariant)) {
			expect(typeof value).toBe("string");
			expect(value).toBe(value.toLowerCase());
		}
	});
});
