import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TripCard } from "./trip-card";
import { TripCardVariant } from "@/enums/trip-card-variant";
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
		variant: {
			control: "select",
			options: Object.values(TripCardVariant),
			description: "Visual style variant of the card",
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

export const Polaroid: Story = {
	args: {
		trip: randomTrip("polaroid-story"),
		variant: TripCardVariant.Polaroid,
		priority: false,
	},
};

export const Immersive: Story = {
	args: {
		trip: randomTrip("immersive-story"),
		variant: TripCardVariant.Immersive,
		priority: false,
	},
};

export const AllVariants: Story = {
	args: {
		trip: randomTrip(),
	},
	decorators: [
		() => (
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(2, 400px)",
					gap: "24px",
					padding: "24px",
				}}
			>
				<div>
					<h3
						style={{
							marginBottom: "8px",
							fontSize: "14px",
							fontWeight: 600,
						}}
					>
						Polaroid
					</h3>
					<TripCard
						trip={randomTrip("all-variants-polaroid")}
						variant={TripCardVariant.Polaroid}
					/>
				</div>
				<div>
					<h3
						style={{
							marginBottom: "8px",
							fontSize: "14px",
							fontWeight: 600,
						}}
					>
						Immersive
					</h3>
					<TripCard
						trip={randomTrip("all-variants-immersive")}
						variant={TripCardVariant.Immersive}
					/>
				</div>
			</div>
		),
	],
};
