import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TripCard } from "./trip-card";
import { randomTrip } from "@/mocks/trips";

const meta = {
	title: "Components/TripCard",
	component: TripCard,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		priority: {
			control: "boolean",
			description:
				"Enable priority image loading for above-the-fold cards",
		},
	},
	decorators: [
		(Story) => (
			<div style={{ width: "400px" }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof TripCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		trip: randomTrip("trip-card-story"),
		priority: false,
	},
};
