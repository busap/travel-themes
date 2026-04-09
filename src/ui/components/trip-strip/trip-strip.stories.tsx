import type { Meta, StoryObj } from "@storybook/react";
import { TripStrip } from "./trip-strip";
import { getAllTrips } from "@/utils/trip";

const meta: Meta<typeof TripStrip> = {
	title: "Components/TripStrip",
	component: TripStrip,
	parameters: {
		layout: "fullscreen",
		backgrounds: { default: "dark" },
	},
	decorators: [
		(Story) => (
			<div style={{ position: "relative", height: "100vh", background: "#050a14" }}>
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof TripStrip>;

export const Default: Story = {
	args: {
		trips: getAllTrips(),
	},
};
