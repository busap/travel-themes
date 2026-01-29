import type { Meta, StoryObj } from '@storybook/react';
import { ScrollHint } from './scroll-hint';

const meta = {
  title: 'Components/ScrollHint',
  component: ScrollHint,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
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
