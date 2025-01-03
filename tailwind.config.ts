import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      screens: {
        "1600px": "1600px",
        "4xl": "56rem",
        standalone: { raw: "(display-mode: standalone)" },
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
        "titlebar-area-x": "env(titlebar-area-x)",
        "titlebar-area-y": "env(titlebar-area-y)",
        "titlebar-area-width": "env(titlebar-area-width)",
        "titlebar-area-height": "env(titlebar-area-height)",
      },
    },
  },
  plugins: [
    {
      handler: function ({ addUtilities }) {
        const newUtilities = {
          ".scrollbar-hidden": {
            "-ms-overflow-style": "none",
            "scrollbar-width": "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          },
          ".app-region-drag": {
            "-webkit-app-region": "drag",
          },
        };
        addUtilities(newUtilities);
      },
    },
  ],
};

export default config;
