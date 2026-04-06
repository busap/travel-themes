import type { Meta, StoryObj } from "@storybook/react";
import { MosaicTheme } from "./mosaic-theme";
import { randomTrip } from "@/mocks/trips";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";

const meta = {
	title: "Components/Trip Themes/MosaicTheme",
	component: MosaicTheme,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof MosaicTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

const config = getThemeConfig(Theme.Mosaic);

export const Default: Story = {
	args: {
		trip: randomTrip(),
		config,
	},
};
