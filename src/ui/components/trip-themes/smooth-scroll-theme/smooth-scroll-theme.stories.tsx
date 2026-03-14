import type { Meta, StoryObj } from '@storybook/react';
import { SmoothScrollTheme } from './smooth-scroll-theme';
import { getThemeConfig } from '@/config/theme-config';
import { Theme } from '@/enums/theme';
import { randomTrip } from '@/mocks/trips';

const meta = {
  title: 'Components/Trip Themes/SmoothScrollTheme',
  component: SmoothScrollTheme,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SmoothScrollTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

const config = getThemeConfig(Theme.SmoothScroll);

export const Default: Story = {
  args: {
    trip: randomTrip(),
    config,
  },
};
