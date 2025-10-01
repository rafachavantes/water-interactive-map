import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Override default colors to use RGB instead of modern color spaces
      colors: {
        // Keep existing color definitions but ensure they use rgb() format
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--color-card-foreground) / <alpha-value>)',
        popover: 'rgb(var(--color-popover) / <alpha-value>)',
        'popover-foreground': 'rgb(var(--color-popover-foreground) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-foreground': 'rgb(var(--color-primary-foreground) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        'secondary-foreground': 'rgb(var(--color-secondary-foreground) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--color-muted-foreground) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-foreground': 'rgb(var(--color-accent-foreground) / <alpha-value>)',
        destructive: 'rgb(var(--color-destructive) / <alpha-value>)',
        'destructive-foreground': 'rgb(var(--color-destructive-foreground) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        input: 'rgb(var(--color-input) / <alpha-value>)',
        ring: 'rgb(var(--color-ring) / <alpha-value>)',
        'chart-1': 'rgb(var(--color-chart-1) / <alpha-value>)',
        'chart-2': 'rgb(var(--color-chart-2) / <alpha-value>)',
        'chart-3': 'rgb(var(--color-chart-3) / <alpha-value>)',
        'chart-4': 'rgb(var(--color-chart-4) / <alpha-value>)',
        'chart-5': 'rgb(var(--color-chart-5) / <alpha-value>)',
        sidebar: 'rgb(var(--color-sidebar) / <alpha-value>)',
        'sidebar-foreground': 'rgb(var(--color-sidebar-foreground) / <alpha-value>)',
        'sidebar-primary': 'rgb(var(--color-sidebar-primary) / <alpha-value>)',
        'sidebar-primary-foreground': 'rgb(var(--color-sidebar-primary-foreground) / <alpha-value>)',
        'sidebar-accent': 'rgb(var(--color-sidebar-accent) / <alpha-value>)',
        'sidebar-accent-foreground': 'rgb(var(--color-sidebar-accent-foreground) / <alpha-value>)',
        'sidebar-border': 'rgb(var(--color-sidebar-border) / <alpha-value>)',
        'sidebar-ring': 'rgb(var(--color-sidebar-ring) / <alpha-value>)',
      },
      borderRadius: {
        sm: 'calc(var(--radius-sm))',
        md: 'calc(var(--radius-md))',
        lg: 'calc(var(--radius-lg))',
        xl: 'calc(var(--radius-xl))',
      },
    },
  },
  plugins: [],
}

export default config
