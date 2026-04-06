import type { Meta, StoryObj } from "@storybook/react";
import { ImageGridHeroTheme } from "./image-grid-hero-theme";
import { randomTrip } from "@/mocks/trips";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";

const meta = {
	title: "Components/Trip Themes/ImageGridHeroTheme",
	component: ImageGridHeroTheme,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof ImageGridHeroTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

const config = getThemeConfig(Theme.ImageGridHero);

export const Default: Story = {
	args: {
		trip: randomTrip(),
		config,
	},
};
