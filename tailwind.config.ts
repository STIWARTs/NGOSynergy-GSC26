import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: 'var(--color-base)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        action: 'var(--color-action)',
        urgency: 'var(--color-urgency)',
        success: 'var(--color-success)',
        text: {
          primary: 'var(--color-text-primary)',
          muted: 'var(--color-text-muted)',
        },
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundColor: {
        'base': 'var(--color-base)',
        'surface': 'var(--color-surface)',
      },
      borderColor: {
        'base': 'var(--color-border)',
      },
      textColor: {
        'primary': 'var(--color-text-primary)',
        'muted': 'var(--color-text-muted)',
      },
    },
  },
  plugins: [],
}

export default config
