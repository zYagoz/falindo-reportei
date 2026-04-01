import { expect, test } from "@playwright/test";

test("shows future pages placeholders", async ({ page }) => {
  await page.goto("/facebook");
  await expect(page.getByText("Em breve")).toBeVisible();

  await page.goto("/linkedin");
  await expect(page.getByText("Em breve")).toBeVisible();
});
