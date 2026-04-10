import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: "http://localhost:8090",
    headless: true,
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "make dev",
    url: "http://localhost:8090",
    timeout: 30000,
    reuseExistingServer: true,
  },
});
