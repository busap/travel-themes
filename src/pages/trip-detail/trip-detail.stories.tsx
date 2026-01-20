import type { Meta, StoryObj } from '@storybook/react';
import { TripDetail } from './trip-detail';
import { trips } from '@/mocks/trips';
import { Theme } from '@/enums/theme';
import { getThemeConfig } from '@/config/theme-config';

const meta = {
  title: 'Pages/TripDetail',
  component: TripDetail,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TripDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MinimalTheme: Story = {
  args: {
    trip: trips[0], // japan-2023
    config: getThemeConfig(Theme.Minimal)
  },
};

export const ImmersiveTheme: Story = {
  args: {
    trip: trips[1], // morocco-markets
    config: getThemeConfig(Theme.Immersive)
  },
};

export const EditorialTheme: Story = {
  args: {
    trip: trips[2], // nordic-winter
    config: getThemeConfig(Theme.Editorial)
  },
};
