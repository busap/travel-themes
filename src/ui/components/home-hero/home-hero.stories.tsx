import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HomeHero } from './home-hero';
import { HeroVariant } from '@/enums/hero-variant';
import { trips as mockTrips } from '@/mocks/trips';

const meta = {
  title: 'Components/HomeHero',
  component: HomeHero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: Object.values(HeroVariant),
      description: 'Visual style variant of the homepage hero',
    },
    featuredTripId: {
      control: 'text',
      description: 'Optional featured trip id for header/fullscreen variants',
    },
  },
} satisfies Meta<typeof HomeHero>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultTrips = mockTrips;

export const Map: Story = {
  args: {
    variant: HeroVariant.Map,
    trips: defaultTrips,
  },
};

export const Collage: Story = {
  args: {
    variant: HeroVariant.Collage,
    trips: defaultTrips,
  },
};

export const Fullscreen: Story = {
  args: {
    variant: HeroVariant.Fullscreen,
    trips: defaultTrips,
    featuredTripId: defaultTrips[0]?.id,
  },
};

export const Header: Story = {
  args: {
    variant: HeroVariant.Header,
    trips: defaultTrips,
    featuredTripId: defaultTrips[1]?.id,
  },
};

