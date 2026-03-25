import type { Meta, StoryObj } from '@storybook/react';
import { LogoCarouselTheme } from './logo-carousel-theme';
import { trips } from '@/mocks/trips';
import { getThemeConfig } from '@/config/theme-config';
import { Theme } from '@/enums/theme';

const meta = {
  title: 'Components/Trip Themes/LogoCarouselTheme',
  component: LogoCarouselTheme,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LogoCarouselTheme>;

export default meta;

type Story = StoryObj<typeof meta>;

const thailandTrip = trips.find((trip) => trip.id === 'thailand-adventure')!;
const config = getThemeConfig(Theme.LogoCarousel);

export const Default: Story = {
  args: {
    trip: thailandTrip,
    config,
  },
};
