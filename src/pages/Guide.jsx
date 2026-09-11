import { Link } from "react-router-dom";
import { PageHeading, Icon } from "@/components/V2";
export default function Guide() {
  const cards = [
    [
      "psychology",
      "The AI pick",
      [
        "The model’s highlighted prediction for this fixture.",
        "Confidence scores the pick. It does not guarantee the result.",
      ],
    ],
    [
      "sports_soccer",
      "Goals, in plain English",
      [
        "Team to score = at least 1 goal by that team.",
        "2+ total goals = over 1.5 goals. 3+ = over 2.5.",
        "Both teams to score = each team scores at least once.",
      ],
    ],
    [
      "bar_chart",
      "Match probabilities",
      [
        "Home win, draw and away win estimate the match outcome.",
        "These are different from confidence in the highlighted pick. Rounding can affect the total.",
      ],
    ],
    [
      "compare_arrows",
      "Compare the numbers",
      [
        "Compare up to 3 fixtures in the full match list.",
        "Expected goals estimate scoring; Elo measures relative team strength.",
      ],
    ],
    [
      "bookmark",
      "Save your football",
      [
        "Bookmark fixtures or follow favourite teams and leagues.",
        "Saved groups upcoming fixtures and available outcomes. Calendar export uses scheduled kickoff.",
        "Your preferences stay on this browser.",
      ],
    ],
    [
      "fact_check",
      "Check the evidence",
      [
        "Results cover up to 500 recent settled picks with confidence ≥80%.",
        "Check sample sizes and dates. Hit rate does not measure profit.",
      ],
    ],
  ];
  return (
    <main className="v2-page v2-guide">
      <PageHeading
        eyebrow="A quick guide"
        title="How to read a prediction"
        description="The essentials: picks, probabilities and results."
      />
      <div className="v2-guide-grid">
        {cards.map(([icon, title, lines]) => (
          <section className="v2-panel" key={title}>
            <Icon>{icon}</Icon>
            <h2>{title}</h2>
            <ul className="v2-guide-points">
              {lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="v2-fine">
        Today’s full matchday view requires an account and an opened daily pack.
        The pack resets at midnight, Europe/Warsaw.
      </p>
      <Link className="v2-button" to="/today">
        Today’s predictions <Icon>arrow_forward</Icon>
      </Link>
    </main>
  );
}
