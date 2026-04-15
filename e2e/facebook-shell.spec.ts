import { expect, test } from "@playwright/test";
import {
  activityFixture,
  demographicsFixture,
  facebookInsightsFixture,
  facebookOverviewFixture,
  facebookOverviewUnavailableFixture,
  facebookPagesFixture,
  instagramAccountsFixture,
  insightsFixture,
  overviewFixture,
  postsFixture,
  previousFacebookOverviewFixture,
  reelsFixture,
  reelsSummaryFixture,
  storiesFixture,
} from "../src/test/mocks/fixtures/meta";

async function mockInstagramApis(page: Parameters<typeof test>[0]["page"]) {
  await page.route("**/api/instagram/accounts", async (route) => {
    await route.fulfill({ json: { accounts: instagramAccountsFixture } });
  });
  await page.route("**/api/instagram/insights**", async (route) => {
    await route.fulfill({ json: { insights: insightsFixture } });
  });
  await page.route("**/api/instagram/overview**", async (route) => {
    await route.fulfill({ json: { overview: overviewFixture } });
  });
  await page.route("**/api/instagram/demographics**", async (route) => {
    await route.fulfill({ json: { demographics: demographicsFixture } });
  });
  await page.route("**/api/instagram/activity**", async (route) => {
    await route.fulfill({ json: { activity: activityFixture } });
  });
  await page.route("**/api/instagram/posts**", async (route) => {
    await route.fulfill({ json: { posts: postsFixture } });
  });
  await page.route("**/api/instagram/stories**", async (route) => {
    await route.fulfill({ json: { stories: storiesFixture } });
  });
  await page.route("**/api/instagram/reels**", async (route) => {
    await route.fulfill({ json: { reels: reelsFixture } });
  });
  await page.route("**/api/instagram/reels-summary**", async (route) => {
    await route.fulfill({ json: { summary: reelsSummaryFixture } });
  });
}

async function mockFacebookPages(page: Parameters<typeof test>[0]["page"]) {
  await page.route("**/api/facebook/pages", async (route) => {
    await route.fulfill({ json: { pages: facebookPagesFixture } });
  });
  await page.route("**/api/facebook/overview**", async (route) => {
    const requestUrl = new URL(route.request().url());
    const requestedSince = requestUrl.searchParams.get("since");

    await route.fulfill({
      json: {
        overview:
          requestedSince === "2026-02-10" || requestedSince === "2026-03-01"
            ? previousFacebookOverviewFixture
            : facebookOverviewFixture,
      },
    });
  });
  await page.route("**/api/facebook/insights**", async (route) => {
    await route.fulfill({ json: { insights: facebookInsightsFixture } });
  });
}

test("navigates to facebook from the platform menu and loads overview", async ({ page }) => {
  await mockInstagramApis(page);
  await mockFacebookPages(page);

  await page.goto("/instagram", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: /Facebook/i })).toBeVisible();
  await expect(page.getByText("Em breve")).toHaveCount(1);

  await page.getByRole("link", { name: /Facebook/i }).click();

  await expect(page).toHaveURL(/\/facebook$/);
  await expect(page.getByRole("heading", { name: "Social Insights Dashboard", level: 1 })).toBeVisible();
  await expect(page.getByLabel("Selecionar conta")).toBeVisible();
  await expect(page.getByText("Pagina selecionada")).toBeVisible();
  await expect(page.getByText("Seguidores atuais")).toBeVisible();
  await expect(page.getByText("Seguidores liquidos")).toBeVisible();
  await expect(page.getByText("Visualizacoes", { exact: true })).toBeVisible();
  await expect(page.getByText("Visitas ao Facebook")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Visualizacoes ao longo do periodo", level: 3 })).toBeVisible();
});

test("persists the selected facebook page after reload", async ({ page }) => {
  await mockFacebookPages(page);

  await page.goto("/facebook", { waitUntil: "domcontentloaded" });

  const pageSelect = page.locator('select[aria-label="Selecionar conta"]');
  await expect(pageSelect).toBeVisible();

  await pageSelect.selectOption("fb-page-2");
  await expect(pageSelect).toHaveValue("fb-page-2");

  await page.reload();
  await expect(pageSelect).toBeVisible();
  await expect(pageSelect).toHaveValue("fb-page-2");
  await expect(page.getByText("Seguidores atuais")).toBeVisible();
});

test("shows unavailable insights state instead of zeroed kpis for low-like pages", async ({ page }) => {
  await page.route("**/api/facebook/pages", async (route) => {
    await route.fulfill({ json: { pages: [facebookPagesFixture[0]] } });
  });
  await page.route("**/api/facebook/overview**", async (route) => {
    await route.fulfill({ json: { overview: facebookOverviewUnavailableFixture } });
  });
  await page.route("**/api/facebook/insights**", async (route) => {
    await route.fulfill({ json: { insights: { views: [] } } });
  });

  await page.goto("/facebook", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("Insights indisponiveis via API", { exact: true })).toBeVisible();
  await expect(page.getByText("Seguidores atuais")).toBeVisible();
  await expect(page.getByText("Curtidas da pagina")).toBeVisible();
  await expect(page.getByText("Assim que a pagina atingir o limiar exigido pela Meta")).toBeVisible();
  await expect(page.getByText("Seguidores liquidos")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Visualizacoes ao longo do periodo", level: 3 })).toHaveCount(0);
});
