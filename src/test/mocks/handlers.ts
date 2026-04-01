import { http, HttpResponse } from "msw";
import {
  demographicsFixture,
  instagramAccountsFixture,
  insightsFixture,
  postsFixture,
  reelsFixture,
} from "./fixtures/meta";

export const handlers = [
  http.get("/api/instagram/accounts", () => HttpResponse.json({ accounts: instagramAccountsFixture })),
  http.get("/api/instagram/insights", () => HttpResponse.json({ insights: insightsFixture })),
  http.get("/api/instagram/demographics", () => HttpResponse.json({ demographics: demographicsFixture })),
  http.get("/api/instagram/posts", () => HttpResponse.json({ posts: postsFixture })),
  http.get("/api/instagram/reels", () => HttpResponse.json({ reels: reelsFixture })),
];
