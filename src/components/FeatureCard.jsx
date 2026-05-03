import { cn } from "@/lib/utils";

export default function FeatureCard({ icon, title, description, className }) {
  return (
    <div
      className={cn(
        "p-10 rounded-2xl bg-background border border-white/5",
        "hover:border-primary-container/30 transition-all duration-300 group",
        className
      )}
    >
      <div className="w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
        <span className="material-symbols-outlined text-primary-container text-4xl">{icon}</span>
      </div>
      <h3 className="text-headline-md font-semibold text-on-surface mb-4 leading-snug">{title}</h3>
      <p className="text-on-surface-variant text-body-md leading-relaxed">{description}</p>
    </div>
  );
}
