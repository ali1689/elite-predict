import { cn } from "@/lib/utils";

function Stars({ count = 5 }) {
  return (
    <div className="flex gap-0.5 text-primary-container">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="material-symbols-outlined fill text-lg">
          star
        </span>
      ))}
    </div>
  );
}

export default function TestimonialCard({ testimonial, className }) {
  return (
    <div
      className={cn(
        "ep-testimonial group relative glass-card p-6 md:p-10 rounded-2xl md:rounded-3xl overflow-hidden h-full",
        className
      )}
    >
      {/* Top accent bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-container via-primary-container/40 to-transparent" />

      {/* Oversized decorative quote glyph */}
      <span
        aria-hidden="true"
        className="material-symbols-outlined fill pointer-events-none select-none absolute -top-3 right-3 text-primary-container/10 leading-none transition-transform duration-500 group-hover:scale-110"
        style={{ fontSize: "120px" }}
      >
        format_quote
      </span>

      <div className="relative z-10 flex flex-col h-full">
        <Stars count={testimonial.stars} />

        {/* Quote */}
        <p className="mt-4 md:mt-6 text-base md:text-headline-md font-semibold italic text-on-surface leading-relaxed">
          "{testimonial.quote}"
        </p>

        {/* Author */}
        <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-white/5 flex items-center gap-3 md:gap-4">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-primary-container/25 flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="min-w-0">
            <div className="font-bold text-on-surface truncate flex items-center gap-1.5">
              {testimonial.name}
              <span
                title="Verified member"
                className="material-symbols-outlined fill text-primary-container flex-shrink-0"
                style={{ fontSize: "16px" }}
              >
                verified
              </span>
            </div>
            <div className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5 truncate">
              {testimonial.role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
