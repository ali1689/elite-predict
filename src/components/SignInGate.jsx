import { Link, useLocation } from "react-router-dom";
import { Icon, PageHeading } from "@/components/V2";
export default function SignInGate({
  eyebrow,
  title,
  lockedLabel = "Predictions",
  description = "Sign in to explore match probabilities and your daily prediction pack.",
  secondaryTo = "/open",
  secondaryLabel = "About the daily pack",
}) {
  const { pathname, search } = useLocation(),
    next = encodeURIComponent(pathname + search);
  return (
    <>
      {title && <PageHeading eyebrow={eyebrow} title={title} />}
      <section className="v2-gate">
        <span className="v2-gate-icon">
          <Icon>lock_open</Icon>
        </span>
        <div>
          <p className="v2-eyebrow">Your next match starts here</p>
          <h2>{lockedLabel}</h2>
          <p>{description}</p>
          <div className="v2-actions">
            <Link
              className="v2-button"
              to={`/login?mode=register&next=${next}`}
            >
              Create free account <Icon>arrow_forward</Icon>
            </Link>
            <Link className="v2-button secondary" to={`/login?next=${next}`}>
              Sign in
            </Link>
            {secondaryTo !== pathname && (
              <Link className="v2-text-link" to={secondaryTo}>
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
