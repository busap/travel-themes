import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.scss";

const preview: Preview = {
	parameters: {
		// Themes that call `useRouter` (Collage's back button) throw
		// "invariant expected app router to be mounted" without this.
		nextjs: {
			appDirectory: true,
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export default preview;
