import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ORIGIN, PAGES, websiteSchema } from "@/lib/seo";
export function applySeo(meta, path) {
  document.title = `${meta.title} | ElitePredicts`;
  const set = (selector, attributes) => {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement(
        selector.startsWith("link") ? "link" : "meta",
      );
      document.head.appendChild(el);
    }
    Object.entries(attributes).forEach(([key, value]) =>
      el.setAttribute(key, value),
    );
  };
  set('meta[name="description"]', {
    name: "description",
    content: meta.description,
  });
  set('meta[name="robots"]', {
    name: "robots",
    content: meta.noindex ? "noindex, follow" : "index, follow",
  });
  if (path)
    set('link[rel="canonical"]', { rel: "canonical", href: ORIGIN + path });
  else document.head.querySelector('link[rel="canonical"]')?.remove();
  for (const [property, content] of Object.entries({
    "og:title": document.title,
    "og:description": meta.description,
    "og:url": ORIGIN + (path || "/"),
    "og:type": "website",
    "og:site_name": "ElitePredicts",
    "og:image": ORIGIN + "/og-image.png",
  }))
    set(`meta[property="${property}"]`, { property, content });
  for (const [name, content] of Object.entries({
    "twitter:title": document.title,
    "twitter:description": meta.description,
    "twitter:image": ORIGIN + "/og-image.png",
    "twitter:card": "summary_large_image",
  }))
    set(`meta[name="${name}"]`, { name, content });
  document.getElementById("page-schema")?.remove();
  if (path === "/") {
    const script = document.createElement("script");
    script.id = "page-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(websiteSchema);
    document.head.appendChild(script);
  }
}
export default function SeoRoutes() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith("/matches/")) return;
    applySeo(
      PAGES[pathname] || {
        title: "Page not found",
        description:
          "Explore football predictions and match analysis on ElitePredicts.",
        noindex: true,
      },
      pathname,
    );
  }, [pathname]);
  return null;
}
