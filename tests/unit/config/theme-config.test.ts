import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";

describe("theme-config", () => {
	describe("getThemeConfig", () => {
		it("should return a config for every Theme enum value", () => {
			Object.values(Theme).forEach((theme) => {
				const config = getThemeConfig(theme);
				expect(config).toBeDefined();
			});
		});

		it("should have a component string for every theme", () => {
			Object.values(Theme).forEach((theme) => {
				const config = getThemeConfig(theme);
				expect(typeof config.component).toBe("string");
				expect(config.component.length).toBeGreaterThan(0);
			});
		});

		it("should have component names ending with -theme", () => {
			Object.values(Theme).forEach((theme) => {
				const config = getThemeConfig(theme);
				expect(config.component).toMatch(/-theme$/);
			});
		});

		it("should have an animation object for every theme", () => {
			Object.values(Theme).forEach((theme) => {
				const config = getThemeConfig(theme);
				expect(config.animation).toBeDefined();
				expect(typeof config.animation).toBe("object");
			});
		});

		it("should return unique component names for each theme", () => {
			const components = Object.values(Theme).map(
				(theme) => getThemeConfig(theme).component
			);
			const unique = new Set(components);
			expect(unique.size).toBe(components.length);
		});

		it("should return correct configs for known themes", () => {
			expect(getThemeConfig(Theme.Collage).component).toBe("collage-theme");
			expect(getThemeConfig(Theme.Aurora).component).toBe("aurora-theme");
			expect(getThemeConfig(Theme.Mosaic).component).toBe("mosaic-theme");
		});
	});
});
