# ElitePredict V2 — local preview

The frontend refresh is saved directly in this folder. Open this folder in VS Code and run:

```powershell
npm run dev
```

Use the local URL printed in the terminal. Dependencies are unchanged. Nothing has been committed, pushed, or deployed. Databricks notebooks and prediction calculations are untouched.

## What changed

- Consistent midnight navy, ivory, and sage design with light/dark appearance.
- Refreshed Home, Matchday, Upcoming, Track record, Daily pack, account forms, and missing-page screen.
- Saved fixtures, browser persistence, search and combined filters, expanded market details, mobile navigation, and a prediction guide.
- Track record metrics and settled history use the same loaded records; data scope is visible.
- Live is removed from navigation and sitemap. Old /live URLs redirect to Matchday.

Saved matches stay in this browser, not your account. They retain fixture metadata, not locked prediction details. Results are available only within the loaded recent history.

## Checks

Production build and five data-presentation tests passed. Desktop/mobile layouts, saving across refresh, filtering, pagination, registration UI, and the Live redirect were checked with real data. Account sign-in, Google sign-in, email confirmation/recovery, and the signed-in daily-pack flow require your account test. Existing Supabase redirect configuration must allow your local origin for email/OAuth flows.

```powershell
node --test src/lib/presentation.test.js
npm run build
```

## Rollback

Stop the development server, then run from this folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\ROLLBACK-V2.ps1
```

The script first preserves the affected V2 files in a timestamped sibling folder, then restores the original frontend files from `elite-predict-backup-before-v2-20260910`. It only restores files listed in `V2-rollback.json`; environment files, dependencies, Git history, and backend files are untouched. Keep the backup folder and manifest until you decide which design to keep. Restart the development server after rollback.

## Interaction update

Added subtle entrance and expansion animations, animated market bars, bookmark feedback, dismissible save notifications, and individually removable filter chips. Reduced-motion preferences disable the animations. Browser checks confirmed saving shows feedback and removing a search chip clears its filter. No animation dependencies were added.

The four files changed in this pass also have a separate pre-motion backup at `../elite-predict-backup-before-motion-20260911-203750`. The original full-design rollback remains available.

## Discovery features

- Follow teams and leagues under **Your football**, then choose **Show my favourites**. Preferences stay in this browser.
- Use **Compare match** on the full match list to compare up to three fixtures. Comparison shows only displayed, accessible fixtures and resets when you leave the page. A filtered-out fixture is removed from comparison.
- Saved now has All, Upcoming, Settled, and Other/awaiting-result groups. Removal offers a temporary Undo action.
- Upcoming saved fixtures with an explicit kickoff timestamp offer **Add to calendar**, downloading an `.ics` file. This does not subscribe to schedule updates or create automatic notifications.
- Kickoff labels distinguish a passed scheduled time without implying live match status. Prediction details include an expandable explanation of confidence, expected goals, and Elo.

Eight tests passed, including calendar timezone conversion, text escaping, missing timestamps, and Unicode line folding. Browser checks covered comparison, favourite filtering, saved groups, and undo. Run all current tests with:

```powershell
node --test src/lib/presentation.test.js src/lib/calendar.test.js
```

The pre-feature source snapshot is in `../elite-predict-backup-before-features-20260911-205232`. The full V2 rollback manifest includes the newly added files. No backend changes, dependency additions, commits, or deployment were made.
