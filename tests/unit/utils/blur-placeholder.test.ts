import { describe, it, expect, vi } from "vitest";

describe("blur-placeholder", () => {
	it("exports a base64 SVG data URL (Buffer path)", async () => {
		const { BLUR_DATA_URL } = await import("@/utils/blur-placeholder");
		expect(BLUR_DATA_URL).toMatch(/^data:image\/svg\+xml;base64,/);
		const base64 = BLUR_DATA_URL.replace("data:image/svg+xml;base64,", "");
		const decoded = Buffer.from(base64, "base64").toString("utf-8");
		expect(decoded).toContain("<svg");
		expect(decoded).toContain('fill="#e5e7eb"');
	});

	it("falls back to btoa when Buffer is unavailable (browser path)", async () => {
		vi.stubGlobal("Buffer", undefined);
		vi.resetModules();
		const { BLUR_DATA_URL } = await import("@/utils/blur-placeholder");
		expect(BLUR_DATA_URL).toMatch(/^data:image\/svg\+xml;base64,/);
		const base64 = BLUR_DATA_URL.replace("data:image/svg+xml;base64,", "");
		const decoded = atob(base64);
		expect(decoded).toContain("<svg");
		expect(decoded).toContain('fill="#e5e7eb"');
		vi.unstubAllGlobals();
	});
});
