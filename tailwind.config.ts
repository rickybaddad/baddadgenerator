import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        surface: '#10131a',
        panel: '#151a24',
        accent: '#8b5cf6'
      }
    }
  },
  darkMode: 'class',
  plugins: []
};

export default config;
