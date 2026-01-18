import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TripCard } from './trip-card';
import { Trip } from '@/types/trip';

const sampleTrip: Trip = {
  id: 'japan-2023',
  name: 'Japan Adventures',
  countries: ['Japan'],
  year: 2023,
  description: 'Cherry blossoms, ancient temples, and neon-lit streets',
  coverPhoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
  photos: [],
};

const meta = {
  title: 'Components/TripCard',
  component: TripCard,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    priority: {
      control: 'boolean',
      description: 'Enable priority image loading for above-the-fold cards',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TripCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trip: sampleTrip,
    priority: false,
  },
};
