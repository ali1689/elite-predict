import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTodayPredictions } from "@/lib/usePredictions";
import { isPackOpenedToday, markPackOpened, dateKey } from "@/lib/presentation";
import {
  Empty,
  ErrorState,
  Icon,
  Loading,
  MatchList,
  PageHeading,
} from "@/components/V2";
import SignInGate from "@/components/SignInGate";
export default function Open() {
  const { user, loading: authLoading } = useAuth(),
    { data, loading, error, refresh } = useTodayPredictions();
  const [opened, setOpened] = useState(false),
    [storageError, setStorageError] = useState("");
  useEffect(() => {
    const sync = () => setOpened(isPackOpenedToday(user?.id));
    sync();
    window.addEventListener("focus", sync);
    const timer = setInterval(sync, 60000);
    return () => {
      window.removeEventListener("focus", sync);
      clearInterval(timer);
    };
  }, [user?.id]);
  function open() {
    if (markPackOpened(user?.id)) {
      setOpened(true);
      setStorageError("");
    } else
      setStorageError(
        "Enable browser storage to open and remember your daily pack.",
      );
  }
  return (
    <main className="v2-page">
      <PageHeading
        eyebrow={`Daily selection / ${dateKey()}`}
        title="Your daily prediction pack"
        description="Open today’s free collection of football predictions."
      />
      {loading || authLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState retry={refresh} />
      ) : !user ? (
        <SignInGate
          lockedLabel="Your daily pack"
          description="Sign in to open the free daily pack and explore today’s model predictions."
          secondaryTo="/guide"
          secondaryLabel="How predictions work"
        />
      ) : !data.length ? (
        <Empty title="Your next pack is on its way">
          There are no predictions available for today yet.
        </Empty>
      ) : opened ? (
        <>
          <div className="v2-section-title">
            <h2>Your pack is open · {data.length} fixtures</h2>
            <Link className="v2-button secondary" to="/today">
              Go to Matchday <Icon>arrow_forward</Icon>
            </Link>
          </div>
          <MatchList matches={[...data].sort((a, b) => b.conf - a.conf)} />
        </>
      ) : (
        <section className="v2-pack-layout">
          <div className="v2-pack-art" aria-hidden="true">
            <div />
            <div />
            <div>
              <Icon>sports_soccer</Icon>
              <strong>elitepredict.</strong>
              <span>THE DAILY SELECTION</span>
            </div>
          </div>
          <div>
            <p className="v2-eyebrow">Ready when you are</p>
            <h2>
              {data.length} matches.
              <br />
              One new perspective.
            </h2>
            <p>
              Open the pack to reveal today’s predictions and their market
              details. Keep your favourites in Saved.
            </p>
            <button className="v2-button" onClick={open}>
              Open my daily pack <Icon>arrow_forward</Icon>
            </button>
            <p className="v2-fine">
              Free daily pack · resets at midnight, Europe/Warsaw.
            </p>
            {storageError && (
              <p role="alert" className="v2-error">
                {storageError}
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
