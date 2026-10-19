import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
const origin = `http://localhost:${process.env.PLAYWRIGHT_PORT || "3000"}`;
async function signup(page: Page) {
  const email = `pilot-${randomUUID()}@example.test`;
  await page.goto("/");
  await page
    .getByRole("button", { name: "New here? Create an account" })
    .click();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("local-test-password-2026");
  await page.getByRole("button", { name: "Create account →" }).click();
  await expect(
    page.getByRole("heading", { name: /Your next great course/ }),
  ).toBeVisible();
  return email;
}
async function saved(page: Page) {
  await expect(page.locator(".status[role=status]")).toHaveText(/Saved · v/, {
    timeout: 15000,
  });
}
test("authenticated course editing, canvas drag, image ownership, history, conflict and disabled AI", async ({
  page,
  browser,
}) => {
  const anonymous = await page.request.get("/api/courses");
  expect(anonymous.status()).toBe(401);
  await signup(page);
  await page.getByRole("button", { name: "+ Create a course" }).click();
  await page
    .getByLabel("Course title", { exact: true })
    .fill("Designing memorable learning");
  await page.getByLabel("Project", { exact: true }).fill("Pilot curriculum");
  await page.getByLabel("Who is it for?").fill("Course creators");
  await page.getByRole("button", { name: "Create course →" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Designing memorable learning",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  const courseId = page.url().split("/").pop()!;
  await page.getByRole("button", { name: "T   Text" }).click();
  await page.getByLabel("Object text").fill("Learning that lasts");
  await saved(page);
  await page.getByRole("button", { name: "▢   Shape" }).click();
  await page.getByLabel("Object x", { exact: true }).fill("250");
  await page.getByLabel("Object y", { exact: true }).fill("320");
  await saved(page);
  const canvas = page.locator("canvas");
  const bounds = (await canvas.boundingBox())!;
  const scale = bounds.width / 960;
  await page.mouse.move(bounds.x + 300 * scale, bounds.y + 370 * scale);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 380 * scale, bounds.y + 400 * scale, {
    steps: 10,
  });
  await page.mouse.up();
  await saved(page);
  const state = await (
    await page.request.get("/api/courses/" + courseId)
  ).json();
  expect(
    state.document.slides[0].objects.some(
      (o: { text: string }) => o.text === "Learning that lasts",
    ),
  ).toBe(true);
  expect(
    state.document.slides[0].objects.find(
      (o: { type: string }) => o.type === "shape",
    ).x,
  ).toBeGreaterThan(300);
  await page.getByRole("button", { name: "▧   Image" }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "pixel.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1kAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByLabel("Source / creator").fill("Original test image");
  await page.getByLabel("License / permission").fill("Original work");
  await page.getByRole("button", { name: "Add image", exact: true }).click();
  await expect(page.locator(".inspector .pill")).toHaveText("IMAGE");
  await saved(page);
  const imageState = await (
    await page.request.get("/api/courses/" + courseId)
  ).json();
  const asset = imageState.document.slides[0].objects.find(
    (o: { type: string }) => o.type === "image",
  ).assetId;
  expect((await page.request.get("/api/assets/" + asset)).status()).toBe(200);
  const exported = await page.request.get(
    "/api/courses/" + courseId + "/export",
  );
  expect(exported.status()).toBe(200);
  expect(exported.headers()["content-type"]).toContain(
    "presentationml.presentation",
  );
  expect(exported.headers()["x-presentation-revision"]).toBe(
    String(imageState.revision),
  );
  const pptxBytes = await exported.body();
  expect(pptxBytes.subarray(0, 2).toString()).toBe("PK");
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export PowerPoint", exact: true })
    .click();
  expect((await downloadEvent).suggestedFilename()).toBe(
    "course-presentation.pptx",
  );
  await page.reload();
  await expect(page.locator("canvas")).toBeVisible();
  await saved(page);
  const stale = await page.request.put(
    "/api/presentations/" + imageState.presentation_id,
    {
      headers: { Origin: origin },
      data: { expectedRevision: 1, document: imageState.document },
    },
  );
  expect(stale.status()).toBe(409);
  const forbiddenOrigin = await page.request.post("/api/courses", {
    headers: { Origin: "https://untrusted.invalid" },
    data: { title: "No", projectTitle: "No", audience: "" },
  });
  expect(forbiddenOrigin.status()).toBe(403);
  await page
    .getByRole("button", { name: "Version history", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Presentation history" }),
  ).toBeVisible();
  await page
    .locator(".version-row")
    .last()
    .getByRole("button", { name: "Restore" })
    .click();
  await saved(page);
  const restored = await (
    await page.request.get("/api/courses/" + courseId)
  ).json();
  expect(restored.revision).toBeGreaterThan(imageState.revision);
  expect(restored.document.slides[0].objects).toHaveLength(2);
  await page.getByRole("button", { name: "Explore AI drafting →" }).click();
  await expect(page.getByText(/No provider is enabled/)).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).last().click();
  const ai = await page.request.post("/api/generate", {
    headers: { Origin: origin },
    data: { courseId, idempotencyKey: randomUUID(), approved: true },
  });
  expect(ai.status()).toBe(503);
  const second = await browser.newContext();
  const other = await second.newPage();
  await signup(other);
  expect((await second.request.get("/api/courses/" + courseId)).status()).toBe(
    404,
  );
  expect((await second.request.get("/api/assets/" + asset)).status()).toBe(404);
  expect(
    (
      await second.request.get(
        "/api/presentations/" + imageState.presentation_id,
      )
    ).status(),
  ).toBe(404);
  expect(
    (
      await second.request.put(
        "/api/presentations/" + imageState.presentation_id,
        {
          headers: { Origin: origin },
          data: {
            expectedRevision: restored.revision,
            document: restored.document,
          },
        },
      )
    ).status(),
  ).toBe(404);
  expect(
    (await second.request.get("/api/courses/" + courseId + "/export")).status(),
  ).toBe(404);
  await second.close();
  await page.screenshot({
    path: "/workspace/scratch/course-studio.png",
    fullPage: true,
  });
});
