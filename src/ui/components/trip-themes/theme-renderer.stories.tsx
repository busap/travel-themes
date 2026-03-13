import type { Meta, StoryObj } from '@storybook/react';
import { ThemeRenderer } from './theme-renderer';
import { trips } from '@/mocks/trips';
import { Theme } from '@/enums/theme';
import { getThemeConfig } from '@/config/theme-config';

const meta = {
  title: 'Components/ThemeRenderer',
  component: ThemeRenderer,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ThemeRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CollageTheme: Story = {
  args: {
    trip: trips[0], // japan-2023
    config: getThemeConfig(Theme.Collage)
  },
};

export const DragShuffleTheme: Story = {
  args: {
    trip: trips.find((trip) => trip.id === 'swiss-alps') ?? trips[0],
    config: getThemeConfig(Theme.DragShuffle),
  },
};
