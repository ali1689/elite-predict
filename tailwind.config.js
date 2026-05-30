/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary — neon green system
        "primary":                  "#efffe3",
        "primary-container":        "#39ff14",
        "on-primary":               "#053900",
        "on-primary-container":     "#107100",
        "primary-fixed":            "#79ff5b",
        "primary-fixed-dim":        "#2ae500",
        "on-primary-fixed":         "#022100",
        "on-primary-fixed-variant": "#095300",
        "inverse-primary":          "#106e00",
        "surface-tint":             "#2ae500",

        // Secondary — blue system
        "secondary":                    "#adc7ff",
        "secondary-container":          "#4a8eff",
        "on-secondary":                 "#002e68",
        "on-secondary-container":       "#00285b",
        "secondary-fixed":              "#d8e2ff",
        "secondary-fixed-dim":          "#adc7ff",
        "on-secondary-fixed":           "#001a41",
        "on-secondary-fixed-variant":   "#004493",

        // Tertiary — neutral light
        "tertiary":                     "#f9fafa",
        "tertiary-container":           "#dddddd",
        "on-tertiary":                  "#2f3131",
        "on-tertiary-container":        "#606162",
        "tertiary-fixed":               "#e2e2e2",
        "tertiary-fixed-dim":           "#c6c6c7",
        "on-tertiary-fixed":            "#1a1c1c",
        "on-tertiary-fixed-variant":    "#454747",

        // Error
        "error":             "#ffb4ab",
        "error-container":   "#93000a",
        "on-error":          "#690005",
        "on-error-container":"#ffdad6",

        // Surfaces — driven by CSS vars (light default, .dark override)
        "background":                  "var(--color-bg)",
        "on-background":               "var(--color-on-bg)",
        "surface":                     "var(--color-surface)",
        "surface-dim":                 "var(--color-surface-dim)",
        "surface-bright":              "var(--color-surface-bright)",
        "surface-container-lowest":    "var(--color-surface-lowest)",
        "surface-container-low":       "var(--color-surface-low)",
        "surface-container":           "var(--color-surface-container)",
        "surface-container-high":      "var(--color-surface-high)",
        "surface-container-highest":   "var(--color-surface-highest)",
        "surface-variant":             "var(--color-surface-variant)",
        "on-surface":                  "var(--color-on-surface)",
        "on-surface-variant":          "var(--color-on-surface-variant)",
        "inverse-surface":             "var(--color-inverse-surface)",
        "inverse-on-surface":          "var(--color-inverse-on-surface)",

        // Outline
        "outline":         "var(--color-outline)",
        "outline-variant": "var(--color-outline-variant)",
      },

      fontFamily: {
        sans:          ["Inter", "sans-serif"],
        "data-point":  ["Lexend", "sans-serif"],
        "label-caps":  ["Lexend", "sans-serif"],
      },

      fontSize: {
        "display-xl":  ["72px",  { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "800" }],
        "headline-lg": ["40px",  { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px",  { lineHeight: "1.4", fontWeight: "600" }],
        "data-point":  ["18px",  { lineHeight: "1.0", fontWeight: "500" }],
        "label-caps":  ["12px",  { lineHeight: "1.0", letterSpacing: "0.1em",  fontWeight: "600" }],
        "body-md":     ["16px",  { lineHeight: "1.6", fontWeight: "400" }],
      },

      borderRadius: {
        DEFAULT: "0.25rem",
        lg:      "0.5rem",
        xl:      "0.75rem",
        "2xl":   "1rem",
        "3xl":   "1.5rem",
        full:    "9999px",
      },

      boxShadow: {
        neon:      "0 0 15px rgba(57,255,20,0.25)",
        "neon-lg": "0 0 35px rgba(57,255,20,0.35)",
      },

      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(57,255,20,0.2)" },
          "50%":       { boxShadow: "0 0 25px rgba(57,255,20,0.5)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.5s ease both",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
