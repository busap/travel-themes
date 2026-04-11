import type { Meta, StoryObj } from "@storybook/react";
import { ParallaxTheme } from "./parallax-theme";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { randomTrip } from "@/mocks/trips";

const meta = {
	title: "Components/Trip Themes/ParallaxTheme",
	component: ParallaxTheme,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof ParallaxTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

const config = getThemeConfig(Theme.Parallax);

export const Default: Story = {
	args: {
		trip: randomTrip(),
		config,
	},
};
