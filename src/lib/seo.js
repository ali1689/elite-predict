export const ORIGIN = "https://www.elitepredicts.com";
export const LEAGUES = [
  {
    code: "PL",
    slug: "premier-league",
    name: "Premier League",
    short: "PL",
    country: "England",
  },
  {
    code: "CL",
    slug: "champions-league",
    name: "Champions League",
    short: "UCL",
    country: "Europe",
  },
  {
    code: "PD",
    slug: "la-liga",
    name: "La Liga",
    short: "LL",
    country: "Spain",
  },
  {
    code: "SA",
    slug: "serie-a",
    name: "Serie A",
    short: "SA",
    country: "Italy",
  },
  {
    code: "BL1",
    slug: "bundesliga",
    name: "Bundesliga",
    short: "BL",
    country: "Germany",
  },
  {
    code: "FL1",
    slug: "ligue-1",
    name: "Ligue 1",
    short: "L1",
    country: "France",
  },
];
export const PAGES = {
  "/": {
    title: "AI Football Predictions Today",
    description:
      "Explore AI football predictions, match probabilities and football analysis. Browse today’s fixtures, save matches and check our public prediction results.",
    heading: "AI Football Predictions Today",
  },
  "/today": {
    title: "Football Predictions Today",
    description:
      "Today’s football predictions and AI match analysis. Explore model picks, goal probabilities and confidence scores across the available leagues.",
    heading: "Football predictions today",
  },
  "/predictions": {
    title: "Football Match Predictions & Upcoming Fixtures",
    description:
      "Browse upcoming football match predictions. Find your team, compare goal and match-result probabilities, and save fixtures to follow.",
    heading: "Upcoming football predictions",
  },
  "/track-record": {
    title: "Football Prediction Results & Track Record",
    description:
      "Check ElitePredicts football prediction results, hit rates and sample sizes. Explore settled outcomes by market and confidence tier.",
    heading: "Football prediction results",
  },
  "/guide": {
    title: "How Our AI Football Predictions Work",
    description:
      "Understand football prediction markets, model confidence, expected goals and the public track record. A quick guide to ElitePredicts.",
    heading: "How to read a prediction",
  },
  "/saved": {
    title: "Saved Football Matches",
    description: "Your saved football fixtures on this browser.",
    heading: "Saved matches",
    noindex: true,
  },
  "/login": {
    title: "Sign In",
    description: "Sign in to ElitePredicts to explore football match analysis.",
    heading: "Your account",
    noindex: true,
  },
  "/open": {
    title: "Daily Football Prediction Pack",
    description: "Open your free daily pack of football match predictions.",
    heading: "Your daily prediction pack",
    noindex: true,
  },
};
for (const league of LEAGUES)
  PAGES[`/leagues/${league.slug}`] = {
    title: `${league.name} Predictions`,
    heading: `${league.name} predictions`,
    description: `Explore ${league.name} football predictions, upcoming fixtures and AI match analysis. Compare goal probabilities and model picks when fixtures are available.`,
  };
export const leagueFor = (code) =>
  LEAGUES.find(
    (l) =>
      l.code === code || l.name.toLowerCase() === String(code).toLowerCase(),
  );
export const slugify = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const matchPath = (m) =>
  `/matches/${encodeURIComponent(m.id)}/${slugify(`${m.home}-vs-${m.away}`)}-prediction`;
export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function headTags(meta, path) {
  const title = `${meta.title} | ElitePredicts`,
    url = ORIGIN + path;
  return `<title>${escapeHtml(title)}</title>\n<meta name="description" content="${escapeHtml(meta.description)}">\n<meta name="robots" content="${meta.noindex ? "noindex, follow" : "index, follow"}">\n${path ? `<link rel="canonical" href="${escapeHtml(url)}">` : ""}\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="ElitePredicts">\n<meta property="og:title" content="${escapeHtml(title)}">\n<meta property="og:description" content="${escapeHtml(meta.description)}">\n${path ? `<meta property="og:url" content="${escapeHtml(url)}">` : ""}\n<meta property="og:image" content="${ORIGIN}/og-image.png">\n<meta property="og:image:alt" content="ElitePredicts — AI football predictions and match analysis">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${escapeHtml(title)}">\n<meta name="twitter:description" content="${escapeHtml(meta.description)}">\n<meta name="twitter:image" content="${ORIGIN}/og-image.png">`;
}
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ElitePredicts",
  alternateName: "Elite Predict",
  url: ORIGIN + "/",
  description: PAGES["/"].description,
};
