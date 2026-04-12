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
			// Only measure the pure-logic layer — the parts unit tests
			// are responsible for. React components, hooks, the DB layer,
			// and infrastructure setup are covered by E2E / Storybook and
			// cannot be run in the node environment without jsdom setup.
			include: [
				"src/utils/**/*.ts",
				"src/config/**/*.ts",
				"src/enums/**/*.ts",
				"src/mocks/**/*.ts",
				// src/db/** omitted — requires generated Prisma client;
				// tested end-to-end once the DB is seeded
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
