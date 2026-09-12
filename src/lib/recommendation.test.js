import test from "node:test";
import assert from "node:assert/strict";
import {
  recommendation,
  pickLabel,
  pickProbabilityFromRow,
} from "./recommendation.js";
import { badgeKey, safeBadgeUrl, teamIndex } from "./badge-utils.js";
test("recommendations preserve the stored model market", () => {
  const m = {
    modelSignal: "Over 1.5 Goals",
    signal: "Home Win",
    modelConfidence: 74,
    home: "Arsenal",
    homeWin: 99,
  };
  assert.equal(pickLabel(m), "Over 1.5 Goals");
  assert.equal(recommendation(m).level, "Medium");
  assert.equal(
    pickProbabilityFromRow({
      primary_signal: "Over 1.5 Goals",
      over15: 82,
      over25: 51,
    }),
    82,
  );
  assert.equal(
    pickProbabilityFromRow({ primary_signal: "Over 1.5 Goals", over15: 0 }),
    0,
  );
  assert.equal(
    pickProbabilityFromRow({ primary_signal: "Unknown", over15: 99 }),
    null,
  );
});
test("confidence bands handle boundaries and unavailable scores", () => {
  for (const [score, level] of [
    [0, "Low"],
    [64, "Low"],
    [65, "Medium"],
    [79, "Medium"],
    [80, "High"],
    [100, "High"],
    [null, "Unrated"],
    [101, "Unrated"],
  ])
    assert.equal(
      recommendation({ modelSignal: "Home Win", modelConfidence: score }).level,
      level,
    );
  assert.equal(
    recommendation({ modelSignal: "No strong signal", modelConfidence: 99 })
      .score,
    null,
  );
  assert.equal(
    pickLabel({ modelSignal: "No strong signal", signal: "Home Win" }),
    "No clear pick",
  );
});
test("badges use exact normalized aliases and reject ambiguous aliases", () => {
  const teams = [
    { id: 1, name: "Bayern München", shortName: "Bayern" },
    { id: 2, name: "Other", shortName: "Bayern" },
  ];
  const index = teamIndex(teams);
  assert.equal(index.get(badgeKey("Bayern Munchen")).id, 1);
  assert.equal(index.get("bayern"), null);
  assert.equal(index.get("missing"), undefined);
});
test("badge URLs allow only provider public HTTPS image hosts", () => {
  assert.equal(
    safeBadgeUrl("https://crests.football-data.org/5.png"),
    "https://crests.football-data.org/5.png",
  );
  for (const url of [
    "http://crests.football-data.org/5.png",
    "https://evil.example/a.png",
    "https://user:pass@crests.football-data.org/a.png",
    undefined,
  ])
    assert.equal(safeBadgeUrl(url), null);
});
