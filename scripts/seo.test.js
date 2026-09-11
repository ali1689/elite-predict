import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PAGES, ORIGIN, matchPath, headTags } from "../src/lib/seo.js";
import { renderPage } from "./seo-pages.js";
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
test("each public route has a unique title and self canonical before JavaScript", () => {
  const titles = new Set();
  for (const [path, meta] of Object.entries(PAGES)) {
    const out = renderPage(html, path);
    assert.equal((out.match(/<title>/g) || []).length, 1);
    assert.equal((out.match(/rel="canonical"/g) || []).length, 1);
    assert.ok(out.includes(`href="${ORIGIN}${path}"`));
    assert.equal(titles.has(meta.title), false);
    titles.add(meta.title);
    assert.equal((out.match(/<h1>/g) || []).length, 1);
    assert.ok(out.includes(meta.noindex ? "noindex, follow" : "index, follow"));
  }
});
test("unknown match shell does not inherit homepage canonical or noindex", () => {
  const out = renderPage(html, "", true);
  assert.ok(!out.includes('rel="canonical"'));
  assert.ok(!out.includes("noindex"));
  assert.ok(!out.includes('id="page-schema"'));
});
test("match URLs use record identity and readable team names", () => {
  assert.equal(
    matchPath({ id: 123, home: "FC Bayern München", away: "Paris & Co" }),
    "/matches/123/fc-bayern-munchen-vs-paris-co-prediction",
  );
});
test("metadata escapes untrusted names and attributes", () => {
  const out = headTags(
    { title: "Team <script>", description: '" onload="bad' },
    "/matches/123/a",
  );
  assert.ok(!out.includes("<script>"));
  assert.ok(out.includes("&lt;script&gt;"));
  assert.ok(out.includes("&quot; onload=&quot;bad"));
});
test("hosting rewrites route to generated metadata pages, preserving the data proxy", () => {
  const config = JSON.parse(
    readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
  );
  assert.equal(config.rewrites[0].source, "/sb/:path*");
  for (const path of Object.keys(PAGES).filter((p) => p !== "/"))
    assert.ok(
      config.rewrites.some(
        (r) => r.source === path && r.destination.startsWith("/seo-pages/"),
      ),
    );
  assert.equal(config.rewrites.at(-1).destination, "/spa.html");
});
