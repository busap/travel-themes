import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			// Measure the pure-logic layer and DB query layer. React
			// components and hooks are covered by E2E / Storybook instead.
			include: [
				"src/utils/**/*.ts",
				"src/config/**/*.ts",
				"src/enums/**/*.ts",
				"src/mocks/**/*.ts",
				"src/db/**/*.ts",
			],
			exclude: [
				"node_modules/",
				"src/**/*.stories.tsx",
				".storybook/",
				"tests/",
			],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
