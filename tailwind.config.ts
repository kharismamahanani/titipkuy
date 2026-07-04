import type { Config } from "tailwindcss";

const config: Config = {
  // Dark mode dihapus sepenuhnya: strategi "class" dengan nama kelas yang
  // sengaja tidak pernah dipasang di DOM, jadi utility "dark:" (media query
  // maupun class) tidak akan pernah aktif.
  darkMode: ["class", "tk-dark-disabled"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        body: ["var(--font-sans)", "sans-serif"],
        heading: ["var(--font-sans)", "sans-serif"],
      },
      colors: {
        // shadcn/ui semantic tokens (dibaca dari CSS variables di globals.css)
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        // primary = warna brand utama, gradasi ungu -> pink.
        // Ditulis literal (bukan var()) supaya class seperti "bg-primary/80" bisa jalan.
        primary: {
          DEFAULT: "#6C3FC4",
          foreground: "#FFFFFF",
          from: "#6C3FC4",
          to: "#E8337C",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: "oklch(var(--destructive) / <alpha-value>)",
        border: "var(--border)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Brand khusus TitipKuy! (Gen Z)
        // bg-dark & card-dark ditulis literal (bukan var()) supaya opacity
        // modifier seperti "bg-bg-dark/80" bisa jalan, sama seperti primary.
        "bg-dark": "#0D0D1A",
        "card-dark": "#1A1A2E",
        "card-border": "var(--card-border)",
        // Design system baru: warm, illustrated, neobrutalist (light mode only)
        tk: {
          cream: "#FAF6F0",
          "cream-alt": "#F0EAE0",
          charcoal: "#3D4A41",
          orange: "#E89C65",
          "orange-dark": "#C97A45",
          sage: "#7FA99B",
          "sage-dark": "#5D8A7B",
          card: "#FFFFFF",
          muted: "#5A6B62",
          light: "#8A9E94",
        },
      },
    },
  },
  plugins: [
    // shadcn/ui (base-ui) menulis variant seperti "data-checked:" dan
    // "data-open:" — sintaks itu bawaan Tailwind v4. Project ini pakai
    // Tailwind v3, jadi variant itu didaftarkan manual di sini supaya
    // Switch, Checkbox, Dialog, Select, dll benar-benar berubah tampilan
    // sesuai statusnya (bukan diam-diam tidak menghasilkan CSS apa pun).
    function ({ addVariant }: { addVariant: (name: string, selectors: string | string[]) => void }) {
      addVariant("data-open", [
        '&[data-state="open"]',
        '&[data-open]:not([data-open="false"])',
      ]);
      addVariant("data-closed", [
        '&[data-state="closed"]',
        '&[data-closed]:not([data-closed="false"])',
      ]);
      addVariant("data-checked", [
        '&[data-state="checked"]',
        '&[data-checked]:not([data-checked="false"])',
      ]);
      addVariant("data-unchecked", [
        '&[data-state="unchecked"]',
        '&[data-unchecked]:not([data-unchecked="false"])',
      ]);
      addVariant("data-selected", '&[data-selected="true"]');
      addVariant("data-disabled", [
        '&[data-disabled="true"]',
        '&[data-disabled]:not([data-disabled="false"])',
      ]);
      addVariant("data-active", [
        '&[data-state="active"]',
        '&[data-active]:not([data-active="false"])',
      ]);
      addVariant("data-horizontal", '&[data-orientation="horizontal"]');
      addVariant("data-vertical", '&[data-orientation="vertical"]');
      addVariant("data-placeholder", '&[data-placeholder]:not([data-placeholder="false"])');
    },
  ],
};
export default config;
