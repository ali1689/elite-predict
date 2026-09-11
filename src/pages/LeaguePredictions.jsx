import { useParams } from "react-router-dom";
import { LEAGUES } from "@/lib/seo";
import Predictions from "./Predictions";
import NotFound from "./NotFound";
export default function LeaguePredictions() {
  const { slug } = useParams(),
    league = LEAGUES.find((l) => l.slug === slug);
  return league ? <Predictions league={league} /> : <NotFound />;
}
