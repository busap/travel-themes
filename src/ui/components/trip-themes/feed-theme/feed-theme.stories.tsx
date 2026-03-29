import type { Meta, StoryObj } from "@storybook/react";
import { FeedTheme } from "./feed-theme";
import { randomTrip } from "@/mocks/trips";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";

const meta = {
	title: "Components/Trip Themes/FeedTheme",
	component: FeedTheme,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof FeedTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

const config = getThemeConfig(Theme.Feed);

export const Default: Story = {
	args: {
		trip: randomTrip(),
		config,
	},
};
