import type { Meta, StoryObj } from "@storybook/react";
import { GlobeTooltipCard } from "./globe-tooltip-card";
import { randomTrip } from "@/mocks/trips";

const mockTrip = randomTrip("tooltip-story");

const meta = {
	title: "Components/GlobeTooltipCard",
	component: GlobeTooltipCard,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
	args: {
		trips: [mockTrip],
		countryName: "Germany",
		x: 300,
		y: 300,
	},
} satisfies Meta<typeof GlobeTooltipCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Desktop: positioned fixed tooltip that follows the cursor
export const Desktop: Story = {};

// Mobile: portal-rendered <Link> fixed to the bottom of the screen,
// showing "Tap to explore →" and navigating to the trip on click.
export const Mobile: Story = {
	args: {
		mobile: true,
	},
};
