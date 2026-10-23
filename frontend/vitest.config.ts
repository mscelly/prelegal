import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // e2e/ holds Playwright tests, which run with `npm run test:e2e`.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
