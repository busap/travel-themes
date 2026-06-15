import { describe, it, expect, vi } from "vitest";

// The loader reads NEXT_PUBLIC_R2_PUBLIC_URL at module scope, so stub it before
// the dynamic import below.
vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_URL", "https://images.example.com");

const { default: r2Loader } = await import("@/utils/r2-loader");

describe("r2Loader", () => {
	it("appends the requested width and .avif to R2-hosted base URLs", () => {
		expect(
			r2Loader({
				src: "https://images.example.com/trip-photos/jp/cover/a",
				width: 640,
				quality: undefined,
			})
		).toBe("https://images.example.com/trip-photos/jp/cover/a/640.avif");
	});

	it("passes through URLs that aren't on the R2 host", () => {
		expect(r2Loader({ src: "/local.png", width: 256, quality: 80 })).toBe(
			"/local.png"
		);
		expect(
			r2Loader({
				src: "https://other.cdn/x.jpg",
				width: 256,
				quality: 80,
			})
		).toBe("https://other.cdn/x.jpg");
	});

	it("ignores quality — it's baked in at generation time", () => {
		const base = "https://images.example.com/p";
		expect(r2Loader({ src: base, width: 1080, quality: 10 })).toBe(
			r2Loader({ src: base, width: 1080, quality: 90 })
		);
	});
});
