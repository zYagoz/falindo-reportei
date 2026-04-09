import { http, HttpResponse } from "msw";
import {
  activityFixture,
  demographicsFixture,
  instagramAccountsFixture,
  insightsFixture,
  overviewFixture,
  postsFixture,
  reelsSummaryFixture,
  reelsFixture,
  storiesFixture,
} from "./fixtures/meta";

export const handlers = [
  http.get("/api/instagram/accounts", () => HttpResponse.json({ accounts: instagramAccountsFixture })),
  http.get("/api/instagram/insights", () => HttpResponse.json({ insights: insightsFixture })),
  http.get("/api/instagram/overview", () => HttpResponse.json({ overview: overviewFixture })),
  http.get("/api/instagram/activity", () => HttpResponse.json({ activity: activityFixture })),
  http.get("/api/instagram/demographics", () => HttpResponse.json({ demographics: demographicsFixture })),
  http.get("/api/instagram/posts", () => HttpResponse.json({ posts: postsFixture })),
  http.get("/api/instagram/stories", () => HttpResponse.json({ stories: storiesFixture })),
  http.get("/api/instagram/reels-summary", () => HttpResponse.json({ summary: reelsSummaryFixture })),
  http.get("/api/instagram/reels", () => HttpResponse.json({ reels: reelsFixture })),
];
