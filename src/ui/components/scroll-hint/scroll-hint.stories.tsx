import type { Meta, StoryObj } from "@storybook/react";
import { ScrollHint } from "./scroll-hint";

const meta = {
	title: "Components/ScrollHint",
	component: ScrollHint,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div
				style={{
					position: "relative",
					width: "500px",
					height: "500px",
					backgroundColor: "lightblue",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div>Content area - Scroll hint appears in the corner</div>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ScrollHint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};
