import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  timeout: 90000,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    launchOptions: { executablePath: "/usr/bin/chromium" },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000/api/health",
    reuseExistingServer: false,
    timeout: 90000,
  },
  reporter: "list",
});
