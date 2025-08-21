import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'asus-primary': '#0042a5',
        'asus-accent': '#0084ff',
      },
      fontFamily: {
        'sans': ['var(--font-inter)', 'system-ui', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
