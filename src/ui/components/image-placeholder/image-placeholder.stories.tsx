import type { Meta, StoryObj } from '@storybook/react';
import { ImagePlaceholder } from './image-placeholder';

const meta = {
    title: 'Components/Image Placeholder',
    component: ImagePlaceholder,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ width: "300px", height: "300px" }}>
                <Story />
            </div>
        ),
    ]
} satisfies Meta<typeof ImagePlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {}
