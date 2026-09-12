# ElitePredicts V2: badges, recommendations and SEO verification

Implemented on 12 September 2026. No commit, push, deployment or backend edits.

## Visual changes
- Real football-data.org club crests (111 clubs) and six league emblems, obtained through its competition teams endpoint. The frontend contains public image URLs only; the provider token is not bundled.
- Lazy images with reserved dimensions, descriptive alt text and initials/competition-marker fallback for missing or failed images. Exact provider names and short names are normalized; ambiguous names are not guessed.
- AI Recommendation / Best pick panels and expandable factual explanations on match cards and schedule rows. Comparison uses the same pick label.
- Branded focus-mark favicon in ICO (16/32/48), SVG, PNG and 180px Apple touch formats. No manifest added.
- Over 1.5 Goals consistently means 2+ total goals. Fixed a glossary error that incorrectly said three goals. The underlying over15 field and model threshold are unchanged.

## Recommendation logic
The display reads stored primary_signal, conf, the probability for that exact market, and xg_total. It does not select a higher-probability alternative or invent form-based explanations. The old frontend display signal can differ from primary_signal; these new recommendations deliberately show the stored model selection. Existing model calculations, filtering and tiers remain unchanged.

High = 80% or more; Medium = 65–79%; Low = below 65%. These are descriptive display bands, not calibrated guarantees or new model grades. Missing/invalid confidence is Unrated. No strong signal displays No clear pick. Confidence and market probability are separately labeled.

## SEO verification
The canonical origin remains https://www.elitepredicts.com. All 11 live sitemap URLs returned HTTP 200 with matching self-canonicals and no noindex. Existing sitemap, robots, route metadata and hosting rewrites were retained. Individual match titles and canonicals still resolve from real fixture data.

The bare domain currently redirects to www with HTTP 307. Recommended publishing action: change that domain redirect to permanent 308 in Vercel Domains. No domain settings were changed. See [Vercel domain redirects](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting).

## Maintenance and limits
- Refresh the badge directory manually with npm run refresh:badges and FOOTBALL_DATA_TOKEN set securely in the terminal. Never use a VITE-prefixed token. The script only writes public metadata after all six requests succeed; normal builds do not call the provider.
- Other competitions or unmatched team names retain initials. Broader coverage needs additional provider data. Passing stable team IDs and crest fields through the prediction feed would require future backend work, which was not performed.
- Match pages still depend on client rendering for fixture metadata. A future publishing/rendering step could add fresh match HTML and match sitemap entries; no speculative or stale match URLs were added.
- Provider asset documentation: https://docs.football-data.org/general/v4/team.html

## Validation
Production build passed. Seventeen automated tests cover existing SEO/calendar/saved-match behavior and new recommendation market mapping, confidence boundaries, name ambiguity and safe badge URLs. Verified PNG dimensions, three-size ICO and local HTTP loading. Browser checks covered homepage, upcoming schedule, league and match routes, light/dark appearance, expanded explanations, real league/club images and missing-club initials. No console errors observed on the tested routes. No horizontal overflow at 390px or 320px. Failed-image fallback is implemented through the image error handler; missing-image fallback was visually checked.

## Rollback
Backup: ../elite-predict-backup-before-badges-recommendations-20260912-095252
Run RESTORE-BADGES.ps1 to restore the state before this pass. It preserves the current files in another timestamped folder first.

## Friend test before publishing
Ask a first-time visitor to find a match, identify the model pick, explain the difference between confidence and home-win probability, and describe what Over 1.5 Goals means. Confirm the Why this pick disclosure is easy to find on their phone.

## Files changed
- src/components/FootballIdentity.jsx, Recommendation.jsx, V2.jsx, Discovery.jsx, MatchBrowser.jsx
- src/lib/badges.js, badge-utils.js, recommendation.js, recommendation.test.js, usePredictions.js
- src/data/football-badges.json, glossary.js; src/pages/Guide.jsx; src/index.css
- scripts/refresh-badges.mjs; package.json; index.html
- public/favicon.svg, favicon.ico, favicon-16x16.png, favicon-32x32.png, favicon-48x48.png, apple-touch-icon.png
- This report, BADGES-rollback.json, RESTORE-BADGES.ps1, and prior rollback manifests extended to cover new files.
