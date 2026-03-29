import type { Meta, StoryObj } from "@storybook/react";
import { ShowcaseTheme } from "./showcase-theme";
import { randomTrip } from "@/mocks/trips";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";

const meta = {
	title: "Components/Trip Themes/ShowcaseTheme",
	component: ShowcaseTheme,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof ShowcaseTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

const config = getThemeConfig(Theme.Showcase);

export const Default: Story = {
	args: {
		trip: randomTrip(),
		config,
	},
};
