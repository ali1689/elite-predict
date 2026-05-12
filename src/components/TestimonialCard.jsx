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
        "glass-card p-5 md:p-10 rounded-2xl md:rounded-3xl border-l-4 border-l-primary-container",
        "hover:shadow-neon transition-shadow duration-300",
        className
      )}
    >
      {/* Author row */}
      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-primary-container/20 flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="font-bold text-on-surface truncate">{testimonial.name}</div>
          <div className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5 truncate">
            {testimonial.role}
          </div>
        </div>
        <div className="ml-auto flex-shrink-0">
          <Stars count={testimonial.stars} />
        </div>
      </div>

      {/* Quote */}
      <p className="text-base md:text-headline-md font-semibold italic text-on-surface-variant leading-relaxed">
        "{testimonial.quote}"
      </p>
    </div>
  );
}
