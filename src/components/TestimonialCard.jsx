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
        "glass-card p-10 rounded-3xl border-l-4 border-l-primary-container",
        "hover:shadow-neon transition-shadow duration-300",
        className
      )}
    >
      {/* Author row */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-container/20"
        />
        <div>
          <div className="font-bold text-on-surface">{testimonial.name}</div>
          <div className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
            {testimonial.role}
          </div>
        </div>
        <div className="ml-auto">
          <Stars count={testimonial.stars} />
        </div>
      </div>

      {/* Quote */}
      <p className="text-headline-md font-semibold italic text-on-surface-variant leading-relaxed">
        "{testimonial.quote}"
      </p>
    </div>
  );
}
