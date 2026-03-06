import type { Meta, StoryObj } from '@storybook/react';
import { TrailTheme } from './trail-theme';
import { trips } from '@/mocks/trips';
import { getThemeConfig } from '@/config/theme-config';
import { Theme } from '@/enums/theme';

const meta = {
  title: 'Components/Trip Themes/TrailTheme',
  component: TrailTheme,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TrailTheme>;

export default meta;

type Story = StoryObj<typeof meta>;

const thailandTrip = trips.find((trip) => trip.id === 'thailand-adventure')!;
const config = getThemeConfig(Theme.Trail);

export const Default: Story = {
  args: {
    trip: thailandTrip,
    config,
  },
};

