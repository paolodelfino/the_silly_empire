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
        "6xl": "72rem",
        "7xl": "82rem",
        monitor: "1600px",
        standalone: { raw: "(display-mode: standalone)" },
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
    },
  },
  plugins: [
    {
      handler: function ({ addUtilities }) {
        const newUtilities = {
          ".scrollbar-hidden": {
            "-ms-overflow-style": "none" /* Internet Explorer 10+ */,
            "scrollbar-width": "none" /* Firefox */,
            "&::-webkit-scrollbar": {
              display: "none" /* Safari and Chrome */,
            },
          },
        };

        addUtilities(newUtilities);
      },
    },
  ],
};

export default config;
