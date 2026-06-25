import { cn } from "@/lib/utils";
import { useTilt } from "@/lib/useTilt";

export default function FeatureCard({ icon, title, description, className }) {
  const tilt = useTilt({ max: 4, scale: 1.015 });
  return (
    <div
      {...tilt}
      className={cn(
        "relative overflow-hidden p-6 md:p-10 rounded-2xl bg-background border border-white/5",
        "hover:border-primary-container/40 hover:shadow-[0_0_30px_-8px_rgba(57,255,20,0.45)] transition-[box-shadow,border-color] duration-300 group",
        className
      )}
    >
      <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-5 md:mb-8 group-hover:scale-110 transition-transform duration-300">
        <span className="material-symbols-outlined text-primary-container text-3xl md:text-4xl">{icon}</span>
      </div>
      <h3 className="relative text-lg md:text-headline-md font-semibold text-on-surface mb-3 md:mb-4 leading-snug">{title}</h3>
      <p className="relative text-on-surface-variant text-sm md:text-body-md leading-relaxed">{description}</p>
    </div>
  );
}
