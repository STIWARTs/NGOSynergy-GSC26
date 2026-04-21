import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#0F172A',
        surface: '#1E293B',
        border: '#334155',
        action: '#2563EB',
        urgency: '#DC2626',
        success: '#16A34A',
        text: {
          primary: '#F1F5F9',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundColor: {
        'base': '#0F172A',
        'surface': '#1E293B',
      },
      borderColor: {
        'base': '#334155',
      },
      textColor: {
        'primary': '#F1F5F9',
        'muted': '#94A3B8',
      },
    },
  },
  plugins: [],
}

export default config
