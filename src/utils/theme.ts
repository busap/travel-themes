import { ThemeConfig } from "@/config/theme-config";

export function isScrollTheme(config: ThemeConfig): boolean {
	return config.layout.scrollDirection !== "none";
}

export function getScrollContainer(config: ThemeConfig): string {
	return config.layout.scrollDirection === "horizontal"
		? "overflow-x-auto"
		: "overflow-y-auto";
}
