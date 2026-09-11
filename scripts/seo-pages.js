import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  PAGES,
  ORIGIN,
  LEAGUES,
  headTags,
  escapeHtml,
  websiteSchema,
} from "../src/lib/seo.js";
export function shell(meta) {
  return `<main class="v2-page"><p class="v2-eyebrow">ElitePredicts · Football match analysis</p><h1>${escapeHtml(meta.heading)}</h1><p>${escapeHtml(meta.description)}</p><nav aria-label="Football navigation"><a href="/today">Today's predictions</a> · <a href="/predictions">Upcoming matches</a> · <a href="/track-record">Prediction results</a> · <a href="/guide">How it works</a></nav><h2>Predictions by league</h2><ul>${LEAGUES.map((l) => `<li><a href="/leagues/${l.slug}">${escapeHtml(l.name)} predictions</a></li>`).join("")}</ul><p>Match data and interactive tools load with JavaScript.</p></main>`;
}
export function renderPage(html, path, fallback = false) {
  const meta = PAGES[path] || {
    title: "Football Match Predictions",
    heading: "Football match predictions",
    description: "AI football predictions and match analysis on ElitePredicts.",
  };
  const schema =
    path === "/" && !fallback
      ? `<script id="page-schema" type="application/ld+json">${JSON.stringify(websiteSchema).replace(/</g, "\\u003c")}</script>`
      : "";
  return html
    .replace(
      /<!--seo:start-->[\s\S]*?<!--seo:end-->/,
      `<!--seo:start-->${headTags(meta, fallback ? "" : path)}${schema}<!--seo:end-->`,
    )
    .replace(
      /<!--app-shell-->[\s\S]*?<!--\/app-shell-->/,
      `<!--app-shell-->${shell(meta)}<!--/app-shell-->`,
    );
}
export default function seoPages() {
  let outDir;
  return {
    name: "elitepredicts-seo-pages",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html, ctx) {
      return renderPage(html, ctx.path?.split("?")[0] || "/");
    },
    closeBundle() {
      const html = readFileSync(resolve(outDir, "index.html"), "utf8");
      if (
        !html.includes("<!--seo:start-->") ||
        !html.includes("<!--app-shell-->")
      )
        throw new Error("SEO template markers missing");
      mkdirSync(resolve(outDir, "seo-pages"), { recursive: true });
      for (const path of Object.keys(PAGES)) {
        const file =
          path === "/"
            ? "index.html"
            : `seo-pages/${path.slice(1).replaceAll("/", "-")}.html`;
        writeFileSync(resolve(outDir, file), renderPage(html, path));
      }
      writeFileSync(resolve(outDir, "spa.html"), renderPage(html, "", true));
      const urls = Object.entries(PAGES)
        .filter(([, meta]) => !meta.noindex)
        .map(([path]) => `  <url><loc>${ORIGIN}${path}</loc></url>`)
        .join("\n");
      writeFileSync(
        resolve(outDir, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
    },
  };
}
