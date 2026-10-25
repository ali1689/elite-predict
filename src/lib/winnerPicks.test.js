import test from "node:test";
import assert from "node:assert/strict";
import { MIN_WIN_PROBABILITY, selectWinnerPicks } from "./winnerPicks.js";

const now = Date.parse("2026-10-25T10:00:00Z");
const fixture = (overrides = {}) => ({
  id: 1, matchId: 101, home: "Home FC", away: "Away FC", comp: "PL",
  matchDate: "2026-10-25", utcDate: "2026-10-25T18:00:00Z",
  homeWin: 70, draw: 20, awayWin: 10,
  homeScore: null, awayScore: null,
  ...overrides,
});

test("only home/away wins at the exact 70% cutoff qualify, independently of primary picks", () => {
  assert.equal(MIN_WIN_PROBABILITY, 70);
  const match = fixture({ signal: "Over 1.5 Goals", modelSignal: "Over 1.5 Goals", conf: 99, tier: "C" });
  const [pick] = selectWinnerPicks([match], now);
  assert.equal(pick.selection, "1");
  assert.equal(pick.team, "Home FC");
  assert.equal(pick.probability, 70);
  assert.equal(match.signal, "Over 1.5 Goals");
  assert.deepEqual(selectWinnerPicks([fixture({ homeWin: 69.99, conf: 100 })], now), []);
  assert.deepEqual(selectWinnerPicks([fixture({ homeWin: 10, draw: 80, awayWin: 10 })], now), []);
  assert.deepEqual(selectWinnerPicks([fixture({ homeWin: 40, draw: 20, awayWin: 40, dc12: 90 })], now), []);
});

test("away winners use selection 2 and the away team; sort by probability then kickoff", () => {
  const rows = [
    fixture({ id: 2, matchId: 102, homeWin: 10, awayWin: "80", draw: 10 }),
    fixture({ id: 3, matchId: 103, homeWin: 80, utcDate: "2026-10-25T16:00:00Z" }),
    fixture(),
  ];
  const picks = selectWinnerPicks(rows, now);
  assert.deepEqual(picks.map(p => p.match.id), [3, 2, 1]);
  assert.equal(picks[1].selection, "2");
  assert.equal(picks[1].team, "Away FC");
  assert.deepEqual(rows.map(m => m.id), [2, 3, 1]);
});

test("finished, kicked-off and unknown-time fixtures never enter the shortlist", () => {
  for (const override of [
    { utcDate: "2026-10-25T10:00:00Z" },
    { utcDate: "2026-10-25T09:59:00Z" },
    { utcDate: "2026-10-25T11:00:00+01:00" },
    { utcDate: "2026-10-25" }, { utcDate: "invalid" },
    { utcDate: "2026-10-25T18:00:00" }, { utcDate: null },
    { homeScore: 0 }, { awayScore: 1 },
  ]) assert.equal(selectWinnerPicks([fixture(override)], now).length, 0);
  assert.equal(selectWinnerPicks([fixture()], Date.parse("2026-10-25T18:00:00Z")).length, 0);
});

test("invalid market probabilities are excluded without substituting confidence", () => {
  for (const field of ["homeWin", "awayWin", "draw"]) {
    for (const value of [null, undefined, "", "invalid", NaN, Infinity, -1, 101, true]) {
      assert.equal(selectWinnerPicks([fixture({ [field]: value, conf: 99 })], now).length, 0);
    }
  }
  assert.equal(selectWinnerPicks([fixture({ homeWin: 80, draw: 90 })], now).length, 0);
  assert.deepEqual(selectWinnerPicks([], now), []);
});

test("duplicate fixture rows yield one selection", () => {
  const a = fixture();
  const b = fixture({ id: 999 });
  assert.equal(selectWinnerPicks([a, b], now).length, 1);
});
