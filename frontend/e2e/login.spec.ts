import { expect, test } from "@playwright/test";

test("signing in with any details opens the NDA creator", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Prelegal" })).toBeVisible();

  const form = page.getByRole("form", { name: "Sign in" });
  await form.getByLabel("Email").fill("ada@example.com");
  await form.getByLabel("Password").fill("anything");
  await form.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/nda/");
  await expect(page.getByRole("heading", { name: "Mutual NDA Creator" })).toBeVisible();
});

test("the backend health check answers", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok" });
});
