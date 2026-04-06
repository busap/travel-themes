import type { Meta, StoryObj } from "@storybook/react";
import { DragShuffleTheme } from "./drag-shuffle-theme";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { randomTrip } from "@/mocks/trips";

const meta = {
	title: "Components/Trip Themes/DragShuffleTheme",
	component: DragShuffleTheme,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof DragShuffleTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

const config = getThemeConfig(Theme.DragShuffle);

export const Default: Story = {
	args: {
		trip: randomTrip(),
		config,
	},
};
