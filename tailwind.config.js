/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#090914',
          secondary: '#10101c',
          card: '#151525',
          elevated: '#1a1a2e',
          border: '#34344d',
          text: '#f5f3ff',
          muted: '#b5b5cc',
        },
        light: {
          bg: '#f8fafc',
          card: '#ffffff',
          text: '#0f172a',
          muted: '#475569',
          border: '#e2e8f0',
        },
        editorial: {
          purple: {
            bg: '#271838',
            border: '#462b66',
            text: '#e9d5ff',
            tag: '#d8b4fe',
          },
          teal: {
            bg: '#143438',
            border: '#1f535a',
            text: '#99f6e4',
            tag: '#5eead4',
          },
          mauve: {
            bg: '#381f33',
            border: '#5c3254',
            text: '#fbcfe8',
            tag: '#f472b6',
          },
          ochre: {
            bg: '#372a11',
            border: '#57421a',
            text: '#fef08a',
            tag: '#fde047',
          },
          sage: {
            bg: '#1a3121',
            border: '#2a5036',
            text: '#bbf7d0',
            tag: '#86efac',
          },
          indigo: {
            bg: '#17223b',
            border: '#273860',
            text: '#c7d2fe',
            tag: '#93c5fd',
          },
          yellow: '#fde047',
          yellowHover: '#facc15',
          gold: '#eab308',
          pill: '#422c5c',
          pillText: '#d8b4fe',
        },
        brand: {
          purple: '#8B5CF6',
          fuchsia: '#A855F7',
          indigo: '#6366F1',
          accent: '#7C3AED',
          accentLight: '#A78BFA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 35px -5px rgba(139, 92, 246, 0.45)',
        'dock': '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'card-hover': '0 20px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px -5px rgba(139, 92, 246, 0.15)',
      }
    },
  },
  plugins: [],
}
