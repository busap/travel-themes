import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HomeHero } from "./home-hero";
import { trips as mockTrips } from "@/mocks/trips";

const meta = {
	title: "Components/HomeHero",
	component: HomeHero,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof HomeHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		trips: mockTrips,
	},
};
