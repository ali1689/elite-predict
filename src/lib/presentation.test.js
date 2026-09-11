import test from "node:test";
import assert from "node:assert/strict";
import {
  filterMatches,
  matchKey,
  savedFixture,
  readSaved,
  mergeResults,
  percent,
  dateKey,
} from "./presentation.js";
test("saving a fixture stores metadata, never protected prediction markets", () => {
  const m = {
    id: 1,
    matchId: 30,
    home: "Home",
    away: "Away",
    matchDate: "2026-09-10",
    conf: 94,
    homeWin: 70,
  };
  const saved = savedFixture(m);
  assert.equal(saved.conf, undefined);
  assert.equal(saved.homeWin, undefined);
  assert.equal(matchKey(m), matchKey({ ...m, id: 2 }));
  assert.notEqual(matchKey(m), matchKey({ ...m, matchDate: "2026-09-11" }));
});
test("invalid or corrupt browser storage is safely ignored", () => {
  for (const data of ["bad", "{}", "null", "[null,{},4]"])
    assert.deepEqual(readSaved(data), []);
  assert.equal(
    readSaved(JSON.stringify([{ key: "a", home: "A", away: "B" }, null]))
      .length,
    1,
  );
});
test("combined filters and sorting only return matching fixtures", () => {
  const rows = [
    {
      home: "Home",
      away: "Away",
      comp: "PL",
      tier: "A",
      conf: 90,
      matchDate: dateKey(),
      over25: 75,
    },
    {
      home: "Other",
      away: "Away",
      comp: "PL",
      tier: "B",
      conf: 70,
      matchDate: dateKey(1),
      over25: 55,
    },
    {
      home: "Home",
      away: "Third",
      comp: "PD",
      tier: "A",
      conf: 95,
      matchDate: dateKey(),
      over25: 80,
    },
  ];
  assert.equal(
    filterMatches(rows, {
      search: "hOmE",
      league: "PL",
      min: 80,
      date: "today",
      market: "over25",
    }).length,
    1,
  );
  assert.equal(filterMatches(rows, { date: "tomorrow" })[0].home, "Other");
  assert.equal(filterMatches(rows, { sort: "conf" })[0].conf, 95);
  assert.deepEqual(
    filterMatches(rows, { saved: true, keys: new Set([matchKey(rows[1])]) }),
    [rows[1]],
  );
});
test("settled history takes precedence over older pending snapshots", () => {
  const merged = mergeResults(
    [{ id: 1, settled: true, correct: false, matchDate: "2026-09-09" }],
    [
      { id: 1, settled: false, matchDate: "2026-09-09" },
      { id: 2, settled: false, matchDate: "2026-09-10" },
    ],
  );
  assert.equal(merged.length, 2);
  assert.equal(merged[1].correct, false);
});
test("percent formatter keeps zero and rejects missing values", () => {
  assert.equal(percent(0), "0%");
  assert.equal(percent(null), "—");
  assert.equal(percent(NaN), "—");
  assert.equal(percent(94.3), "94%");
});
