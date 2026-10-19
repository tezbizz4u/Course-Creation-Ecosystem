import { defineConfig } from "@playwright/test";
const port = process.env.PLAYWRIGHT_PORT || "3000";
const baseURL = `http://localhost:${port}`;
export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  timeout: 90000,
  use: {
    baseURL,
    headless: true,
    launchOptions: { executablePath: "/usr/bin/chromium" },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start",
    url: baseURL + "/api/health",
    env: { PORT: port, AUTH_URL: baseURL },
    reuseExistingServer: false,
    timeout: 90000,
  },
  reporter: "list",
});
