import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-5 max-w-sm">
        <div className="text-[80px] font-black text-primary-container leading-none">404</div>
        <h1 className="text-2xl font-black text-on-surface">Page not found</h1>
        <p className="text-on-surface-variant text-sm">
          That URL doesn't exist. Head back to predictions.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary-container text-on-primary font-['Lexend'] font-bold text-[12px] uppercase tracking-widest px-5 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[16px]">home</span>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
