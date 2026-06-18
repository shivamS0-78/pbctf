import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
        dystopian: ['Dystopian', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        // Semantic surface stack
        void: 'var(--surface-void)',
        surface: {
          DEFAULT: 'var(--surface-base)',
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
          inset: 'var(--surface-inset)',
        },
        // Brand
        brand: {
          DEFAULT: 'var(--brand-primary)',
          hover: 'var(--brand-primary-hover)',
          press: 'var(--brand-primary-press)',
          ink: 'var(--brand-primary-ink)',
          soft: 'var(--brand-soft)',
          glow: 'var(--brand-glow)',
        },
        ink: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          subtle: 'var(--text-subtle)',
          disabled: 'var(--text-disabled)',
        },
        signal: {
          success: 'var(--success)',
          warning: 'var(--warning)',
          danger: 'var(--danger)',
          info: 'var(--info)',
        },
        // Custom accent kept
        heading: '#4ade80',

        // Shadcn compatibility — uses CSS HSL variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': '#00ff88',
          '2': '#38bdf8',
          '3': '#fbbf24',
          '4': '#a855f7',
          '5': '#f43f5e',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(0, 255, 136, 0.22)',
        'glow-md': '0 0 24px rgba(0, 255, 136, 0.32)',
        'glow-lg': '0 0 48px rgba(0, 255, 136, 0.4)',
        'card': '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 12px 32px rgba(0, 0, 0, 0.4)',
        'modal': '0 24px 64px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(0, 255, 136, 0.12)',
        'inner-hairline': 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-up':        'fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in':        'fade-in 0.25s ease-out both',
        'slide-up':       'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      letterSpacing: {
        tightest: '-0.04em',
        terminal: '0.02em',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
  safelist: ['scrollbar-hide'],
};
export default config;
