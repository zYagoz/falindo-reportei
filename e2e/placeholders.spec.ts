import { expect, test } from "@playwright/test";

test("keeps only linkedin as a future placeholder", async ({ page }) => {
  await page.goto("/linkedin", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Em breve", level: 1 })).toBeVisible();
});
