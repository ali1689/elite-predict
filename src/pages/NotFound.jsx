import { Link } from "react-router-dom";
import { Empty } from "@/components/V2";
export default function NotFound() {
  return <main className="v2-page"><Empty title="This page is off the pitch." icon="explore_off"><p>We couldn't find that page. Your next match is a click away.</p><Link to="/" className="v2-button">Back to home</Link></Empty></main>;
}
