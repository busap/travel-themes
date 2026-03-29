import type { Meta, StoryObj } from '@storybook/react';
import { PhotoCarouselTheme } from './photo-carousel-theme';
import { trips } from '@/mocks/trips';
import { getThemeConfig } from '@/config/theme-config';
import { Theme } from '@/enums/theme';

const meta = {
  title: 'Components/Trip Themes/PhotoCarouselTheme',
  component: PhotoCarouselTheme,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PhotoCarouselTheme>;

export default meta;

type Story = StoryObj<typeof meta>;

const thailandTrip = trips.find((trip) => trip.id === 'thailand-adventure')!;
const config = getThemeConfig(Theme.PhotoCarousel);

export const Default: Story = {
  args: {
    trip: thailandTrip,
    config,
  },
};
