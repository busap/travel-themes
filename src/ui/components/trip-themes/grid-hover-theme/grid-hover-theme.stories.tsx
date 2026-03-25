import type { Meta, StoryObj } from '@storybook/react';
import { GridHoverTheme } from './grid-hover-theme';
import { randomTrip } from '@/mocks/trips';
import { getThemeConfig } from '@/config/theme-config';
import { Theme } from '@/enums/theme';

const meta = {
  title: 'Components/Trip Themes/GridHoverTheme',
  component: GridHoverTheme,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GridHoverTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

const config = getThemeConfig(Theme.GridHover);

export const Default: Story = {
  args: {
    trip: randomTrip(),
    config,
  },
};
