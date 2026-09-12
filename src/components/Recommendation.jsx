import { recommendation, pickLabel } from "@/lib/recommendation";
import { percent } from "@/lib/presentation";
export function RecommendationFacts({ match }) {
  const r = recommendation(match);
  if (!r.available)
    return (
      <p className="v2-fine">
        The model has not supplied a clear pick for this fixture.
      </p>
    );
  return (
    <div className="v2-recommendation-facts">
      <ul>
        <li>
          Model selection: <strong>{r.signal}</strong>.
        </li>
        {r.probability !== null &&
          r.probability >= 0 &&
          r.probability <= 100 && (
            <li>
              This market’s estimated probability:{" "}
              <strong>{percent(r.probability)}</strong>.
            </li>
          )}
        {r.expectedGoals !== null && r.expectedGoals >= 0 && (
          <li>
            Expected total goals: <strong>{r.expectedGoals.toFixed(2)}</strong>.
          </li>
        )}
        {r.signal === "Over 1.5 Goals" && (
          <li>Over 1.5 Goals means 2 or more total goals.</li>
        )}
      </ul>
      <p>
        Confidence: High ≥80%, Medium 65–79%, Low &lt;65%. These are display
        bands for the existing model score, not guarantees. Market probabilities
        are separate estimates.
      </p>
    </div>
  );
}
export default function Recommendation({ match }) {
  const r = recommendation(match);
  return (
    <section className="v2-recommendation" aria-label="AI recommendation">
      <div className="v2-recommendation-heading">
        <div>
          <span className="v2-recommendation-eyebrow">AI recommendation</span>
          <small>{r.available ? "Best pick" : "Model assessment"}</small>
          <strong>{pickLabel(match)}</strong>
        </div>
        <div className="v2-recommendation-score">
          <strong>{r.score === null ? "—" : percent(r.score)}</strong>
          <span className={`v2-confidence-level ${r.level.toLowerCase()}`}>
            {r.level} confidence
          </span>
        </div>
      </div>
      <details>
        <summary>
          Why this pick? <span aria-hidden="true">+</span>
        </summary>
        <RecommendationFacts match={match} />
      </details>
    </section>
  );
}
