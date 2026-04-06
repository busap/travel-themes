import type { Meta, StoryObj } from '@storybook/react';
import { TrippyTheme } from './trippy-theme';
import { getThemeConfig } from '@/config/theme-config';
import { Theme } from '@/enums/theme';
import { randomTrip } from '@/mocks/trips';

const meta = {
  title: 'Components/Trip Themes/TrippyTheme',
  component: TrippyTheme,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TrippyTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

const config = getThemeConfig(Theme.Trippy);

export const Default: Story = {
  args: {
    trip: randomTrip(),
    config,
  },
};
