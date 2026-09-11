# V2 clarity and search visibility update

## Visual changes

Kept the navy/ivory/sage V2 style. The homepage now says **AI Football Predictions Today**, with direct Today/Upcoming actions. Replaced the long introductory sections with three visual steps and a six-league navigator. Added lightweight team-initial badges, competition markers, clearer fixture links, and visible home/draw/away probability tiles. Picks now use plain English such as **2+ total goals**; the model values and selection logic are unchanged. Shortened headings across the site and made the guide scannable. The account form now has the primary heading on mobile.

The current project/feed has no crest URLs or logo assets. Team badges and competition markers are deliberately not official logos; no guessed club-to-logo mapping or remote image requests were added. A reviewed asset set or reliable crest mapping can replace the fallback markers later.

## SEO changes

- Central page titles, descriptions, self-canonicals and social metadata. Canonicals use `https://www.elitepredicts.com`, verified as the live destination of the non-www redirect.
- Homepage title/H1 explicitly identify AI football predictions. League URLs cover Premier League, Champions League, La Liga, Serie A, Bundesliga and Ligue 1.
- New `/matches/{prediction-row-id}/{home}-vs-{away}-prediction` pages load the actual record through the existing read-only client API and use real team names in title/H1/description. Missing records receive a noindex message.
- Linked public fixture summaries improve discovery without unlocking protected analysis. Match pages retain the existing account/featured-preview rules.
- The Vite build now emits initial titles, descriptions, canonicals, a visible heading and navigation for 14 known routes. Vercel rewrites serve these route-specific files. This is a static page shell, not a full snapshot of prediction data.
- Updated robots.txt and sitemap (11 public routes), removed obsolete dates, and excluded private account/saved/pack pages from indexing. Retired routes redirect permanently to Today.
- Added a real local 1200×630 social-preview PNG; the previously referenced image did not exist. Website JSON-LD describes the site without invented reviews or sports-event details.

Google can render JavaScript, but rendering remains part of discovery for live data: [Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Important publishing limits

Individual match data and metadata still load in the browser. Social crawlers that do not execute JavaScript will receive a generic football preview for match URLs. A refreshed match sitemap, full initial match HTML, durable historical pages when prediction rows are removed, and true HTTP 404 responses for missing records need an additional rendering/publishing layer. No such backend layer or scheduled job was created. Gated analysis also limits the public content available for those searches.

After publishing, inspect Home, one league and one match in Search Console, submit `/sitemap.xml`, verify the canonical host and social previews, and check direct route reloads on Vercel. Search rankings are not guaranteed by these changes.

## Checks and friend test

Production build and all 13 tests passed. Browser checks covered desktop, 390px and 320px phones, a 768px tablet, light/dark views, league navigation, real match metadata, and signed-in/public match access. Repeated development-server restarts during formatting required a reload; final runtime checks are separate from those transient HMR messages.

Ask your friend, without explaining the site first:

1. After five seconds, what does this website do?
2. Find a Premier League match and explain its highlighted pick.
3. Explain the difference between confidence in “team to score” and the probability of a home win.
4. Find today's predictions, open the free account/pack flow, and save a fixture.

## Backup and restore

Pre-change snapshot: `../elite-predict-backup-before-clarity-seo-20260912-012858`.

To restore the V2 from before this round, stop the dev server and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\RESTORE-CLARITY-SEO.ps1
```

It preserves the affected current files in a timestamped sibling folder before restoring the snapshot. The existing full V2 rollback manifest was extended for the new application files. Environment files, dependencies, Databricks notebooks, model logic, schema and pipelines are unchanged. Nothing was committed or pushed in this round.

## Files changed in this round
- `index.html`
- `public/og-image.png`
- `public/robots.txt`
- `public/sitemap.xml`
- `scripts/seo-pages.js`
- `scripts/seo.test.js`
- `src/App.jsx`
- `src/components/FootballIdentity.jsx`
- `src/components/Footer.jsx`
- `src/components/Navbar.jsx`
- `src/components/Seo.jsx`
- `src/components/V2.jsx`
- `src/index.css`
- `src/lib/seo.js`
- `src/lib/usePredictions.js`
- `src/pages/Guide.jsx`
- `src/pages/Home.jsx`
- `src/pages/LeaguePredictions.jsx`
- `src/pages/Login.jsx`
- `src/pages/MatchPrediction.jsx`
- `src/pages/Open.jsx`
- `src/pages/Predictions.jsx`
- `src/pages/Saved.jsx`
- `src/pages/Today.jsx`
- `src/pages/TrackRecord.jsx`
- `vercel.json`
- `vite.config.js`
- Rollback documentation: V2-rollback.json, CLARITY-SEO-rollback.json, RESTORE-CLARITY-SEO.ps1 and this report.
