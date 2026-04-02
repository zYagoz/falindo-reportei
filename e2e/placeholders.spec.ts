import { expect, test } from "@playwright/test";

test("shows future pages placeholders", async ({ page }) => {
  await page.goto("/facebook");
  await expect(page.getByRole("heading", { name: "Em breve", level: 1 })).toBeVisible();

  await page.goto("/linkedin");
  await expect(page.getByRole("heading", { name: "Em breve", level: 1 })).toBeVisible();
});
