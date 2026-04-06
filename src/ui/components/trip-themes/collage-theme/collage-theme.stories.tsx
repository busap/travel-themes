import type { Meta, StoryObj } from "@storybook/react";
import { CollageTheme } from "./collage-theme";
import { randomTrip } from "@/mocks/trips";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";

const meta = {
	title: "Components/Trip Themes/CollageTheme",
	component: CollageTheme,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof CollageTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

const config = getThemeConfig(Theme.Collage);

export const Default: Story = {
	args: {
		trip: randomTrip(),
		config,
	},
};
