import { expect, test } from "@playwright/test";

test("filling in the form updates the preview and names the PDF", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Mutual NDA Creator" })).toBeVisible();

  const form = page.getByRole("region", { name: "NDA details" });
  const preview = page.getByRole("region", { name: "NDA preview" });

  // Blank fields show placeholders until the user fills them in.
  await expect(preview).toContainText("[Governing Law]");

  await form.getByLabel("Governing law").fill("Delaware");
  await form.getByLabel("Effective date").fill("2026-03-01");
  await form.getByLabel("MNDA term in years").fill("2");
  await form.getByLabel("In perpetuity").check();

  const party1 = form.getByRole("group", { name: "Party 1" });
  await party1.getByLabel("Print name").fill("Ada Lovelace");
  await party1.getByLabel("Company").fill("Analytical Ltd");
  await form.getByRole("group", { name: "Party 2" }).getByLabel("Company").fill("Enigma Inc");

  await expect(preview).toContainText("Governing Law: Delaware");
  await expect(preview).toContainText("March 1, 2026");
  await expect(preview).toContainText("Expires 2 years from Effective Date.");
  await expect(preview.getByRole("cell", { name: "Ada Lovelace" })).toBeVisible();
  await expect(preview.getByRole("cell", { name: "Analytical Ltd" })).toBeVisible();
  await expect(preview.getByRole("cell", { name: "Enigma Inc" })).toBeVisible();

  const perpetuity = preview.getByRole("listitem").filter({ hasText: "In perpetuity." });
  await expect(perpetuity.getByRole("img", { name: "Selected" })).toBeVisible();

  // Record the title the print dialog would see instead of opening it.
  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printedTitle = document.title;
    };
  });
  await page.getByRole("button", { name: "Download PDF" }).click();
  await expect(page.locator("body")).toHaveAttribute(
    "data-printed-title",
    "Mutual NDA - Analytical Ltd - Enigma Inc",
  );
});
