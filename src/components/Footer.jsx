import { Link } from "react-router-dom";
import { Icon } from "@/components/V2";
export default function Footer() {
  return (
    <footer className="v2-footer">
      <div className="v2-footer-inner">
        <div>
          <Link to="/" className="v2-logo">
            elitepredicts.
          </Link>
          <p>AI football predictions &amp; match analysis.</p>
          <small>Soccer predictions. Informed by data.</small>
        </div>
        <nav aria-label="Footer navigation">
          <Link to="/today">Matchday</Link>
          <Link to="/predictions">Upcoming</Link>
          <Link to="/track-record">Track record</Link>
          <Link to="/guide">How it works</Link>
          <Link to="/saved">Saved matches</Link>
          <a
            href="https://t.me/SmartBet_Signals"
            target="_blank"
            rel="noreferrer"
          >
            Telegram <Icon>north_east</Icon>
          </a>
        </nav>
      </div>
      <div className="v2-footer-bottom">
        <span>© {new Date().getFullYear()} ElitePredict</span>
        <span>
          Predictions are estimates, not guarantees. 18+ · Play responsibly.
        </span>
      </div>
    </footer>
  );
}
