import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PolaroidCard } from "./polaroid-card";

const meta = {
	title: "Components/PolaroidCard",
	component: PolaroidCard,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof PolaroidCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PhotoVariant: Story = {
	args: {
		imageSrc:
			"https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
		imageAlt: "Mountain landscape",
		caption: "Summit view",
		rotation: 5,
		verticalOffset: 10,
		aspectRatio: "portrait",
	},
	decorators: [
		(Story) => (
			<div style={{ padding: "40px" }}>
				<Story />
			</div>
		),
	],
};

export const AllVariants = {
	render: () => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(2, 1fr)",
				gap: "48px",
				padding: "48px",
			}}
		>
			<div>
				<h3
					style={{
						marginBottom: "16px",
						fontSize: "14px",
						fontWeight: 600,
					}}
				>
					Photo (Portrait)
				</h3>
				<PolaroidCard
					imageSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
					imageAlt="Mountain view"
					caption="Alpine summit"
					rotation={4}
					verticalOffset={15}
					aspectRatio="portrait"
				/>
			</div>
			<div>
				<h3
					style={{
						marginBottom: "16px",
						fontSize: "14px",
						fontWeight: 600,
					}}
				>
					Photo (Square)
				</h3>
				<PolaroidCard
					imageSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
					imageAlt="Mountain view"
					caption="Peak experience"
					rotation={-3}
					verticalOffset={-20}
					aspectRatio="square"
				/>
			</div>
		</div>
	),
};

export const Gallery = {
	render: () => (
		<div
			style={{
				display: "flex",
				gap: "32px",
				padding: "48px",
				alignItems: "center",
				backgroundColor: "#f4f4f5",
			}}
		>
			{[
				{ rotation: -8, offset: 10 },
				{ rotation: 5, offset: -15 },
				{ rotation: -3, offset: 20 },
				{ rotation: 6, offset: -5 },
			].map((transform, index) => (
				<PolaroidCard
					key={index}
					imageSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
					imageAlt={`Photo ${index + 1}`}
					caption={`Memory ${index + 1}`}
					rotation={transform.rotation}
					verticalOffset={transform.offset}
					aspectRatio="portrait"
				/>
			))}
		</div>
	),
};
