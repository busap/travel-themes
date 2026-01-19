import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TripCard } from './trip-card';
import { Trip } from '@/types/trip';
import { TripCardVariant } from '@/enums/trip-card-variant';

const parisTrip: Trip = {
  id: 'paris-2024',
  name: 'Parisian Dreams',
  countries: ['France'],
  year: 2024,
  description: 'Romance, art, and culinary delights in the city of lights',
  coverPhoto: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  photos: [],
};

const icelandTrip: Trip = {
  id: 'iceland-2022',
  name: 'Iceland Odyssey',
  countries: ['Iceland'],
  year: 2022,
  description: 'Glaciers, waterfalls, and the ethereal northern lights',
  coverPhoto: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80',
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
    variant: {
      control: 'select',
      options: Object.values(TripCardVariant),
      description: 'Visual style variant of the card',
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

export const Polaroid: Story = {
  args: {
    trip: parisTrip,
    variant: TripCardVariant.Polaroid,
    priority: false,
  },
};

export const Immersive: Story = {
  args: {
    trip: icelandTrip,
    variant: TripCardVariant.Immersive,
    priority: false,
  },
};

export const AllVariants: Story = {
  args: {
    trip: parisTrip,
  },
  decorators: [
    () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 400px)', gap: '24px', padding: '24px' }}>
        <div>
          <h3 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Polaroid</h3>
          <TripCard trip={parisTrip} variant={TripCardVariant.Polaroid} />
        </div>
        <div>
          <h3 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Immersive</h3>
          <TripCard trip={icelandTrip} variant={TripCardVariant.Immersive} />
        </div>
      </div>
    ),
  ],
};