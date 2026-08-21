import { describe, it, expect, vi } from "vitest";

// resolveImageUrl delegates to the R2 loader, which reads
// NEXT_PUBLIC_R2_PUBLIC_URL at module scope — stub it before importing.
vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_URL", "https://images.example.com");

const { resolveImageUrl } = await import("@/utils/image-url");

describe("resolveImageUrl", () => {
	it("resolves an R2 base URL to the width-specific AVIF derivative", () => {
		expect(
			resolveImageUrl(
				"https://images.example.com/trip-photos/es/photos/a",
				1920
			)
		).toBe("https://images.example.com/trip-photos/es/photos/a/1920.avif");
	});

	it("passes through URLs that aren't on the R2 host", () => {
		expect(resolveImageUrl("/local.png", 640)).toBe("/local.png");
		expect(resolveImageUrl("https://other.cdn/x.jpg", 640)).toBe(
			"https://other.cdn/x.jpg"
		);
	});
});
