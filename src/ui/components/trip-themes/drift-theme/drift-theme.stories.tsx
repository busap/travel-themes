import type { Meta, StoryObj } from '@storybook/react';
import { DriftTheme } from './drift-theme';
import { randomTrip } from '@/mocks/trips';
import { getThemeConfig } from '@/config/theme-config';
import { Theme } from '@/enums/theme';

const meta = {
  title: 'Components/Trip Themes/DriftTheme',
  component: DriftTheme,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DriftTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

const config = getThemeConfig(Theme.Drift);

export const Default: Story = {
  args: {
    trip: randomTrip(),
    config,
  },
};
