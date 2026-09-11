import { Link } from "react-router-dom";
import { PageHeading, Icon } from "@/components/V2";
export default function Guide() {
  return (
    <main className="v2-page v2-guide">
      <PageHeading
        eyebrow="A little context goes a long way"
        title="Make sense of the match."
        description="A straightforward guide to the numbers, markets, and features in ElitePredict."
      />
      <div className="v2-guide-grid">
        {[
          [
            "01",
            "Start with a model pick",
            "The primary signal is the selection displayed by the existing prediction model. Confidence is its score; individual market probabilities may differ because they describe different estimates. A high score is not a guarantee.",
          ],
          [
            "02",
            "Read the market",
            "Home or away to score means at least one goal by that team. Over 1.5 goals means two or more total goals. Over 2.5 means three or more. Both teams to score means each team scores at least once.",
          ],
          [
            "03",
            "Explore the full picture",
            "Match result shows home, draw, and away probabilities. Double chance combines two possible results. Expected goals describe the model’s estimated scoring level; Elo compares team strength. Use Compare match on up to three fixtures in the full match list to compare estimates side by side.",
          ],
          [
            "04",
            "Build your watchlist",
            "Bookmark a fixture from Home, Upcoming, Matchday, or your daily pack. The fixture is saved on this browser. The Saved page checks recent prediction history for available outcomes, without live score updates. Group saved fixtures by status, undo removals, and export upcoming kickoffs to your calendar. Follow teams or leagues under Your football, then filter to your favourites.",
          ],
          [
            "05",
            "Open your daily pack",
            "An account is required to open your daily pack. Opening it unlocks the Matchday view on this browser for that account until midnight in Europe/Warsaw.",
          ],
          [
            "06",
            "Look at the evidence",
            "The public record covers up to 500 recent settled predictions with confidence of at least 80%. The date range and sample sizes are displayed. Pending predictions are separate; hit rate alone does not describe profitability.",
          ],
        ].map(([n, title, text]) => (
          <section className="v2-panel" key={n}>
            <span className="v2-eyebrow">{n}</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
      </div>
      <Link className="v2-button" to="/today">
        Explore matchday <Icon>arrow_forward</Icon>
      </Link>
    </main>
  );
}

