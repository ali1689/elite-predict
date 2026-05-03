import { Link } from "react-router-dom";

const LEGAL_LINKS = [
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy",   href: "#" },
  { label: "Affiliates",       href: "#" },
  { label: "Contact Support",  href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-zinc-950 w-full py-12 border-t border-white/5">
      <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div>
          <Link to="/" className="text-lg font-black italic text-zinc-100 tracking-tighter block mb-2">
            ELITE PREDICT
          </Link>
          <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
            The premier destination for professional football analytics. Now a free community
            project for serious enthusiasts worldwide.
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { icon: "send",      label: "Telegram", href: "https://t.me/SmartBet_Signals" },
              { icon: "analytics", label: "Stats",    href: "#" },
            ].map(({ icon, label, href }) => (
              <a key={icon} href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={label}
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary-container transition-colors group">
                <span className="material-symbols-outlined text-zinc-500 group-hover:text-on-primary text-[20px]">
                  {icon}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="md:text-right">
          <div className="flex flex-wrap md:justify-end gap-x-8 gap-y-4 mb-8">
            {LEGAL_LINKS.map(({ label, href }) => (
              <a key={label} href={href}
                className="text-zinc-500 hover:text-primary-container transition-colors text-sm underline underline-offset-4">
                {label}
              </a>
            ))}
          </div>
          <div className="pt-6 border-t border-zinc-800 flex flex-col md:flex-row md:justify-end items-center gap-4">
            <span className="text-zinc-600 text-xs uppercase tracking-widest">
              © 2025 ELITE MATCH ANALYTICS. PRO-LEVEL PRECISION.
            </span>
            <span className="flex items-center gap-2 text-xs text-zinc-600 font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse-dot" />
              System Status: Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
