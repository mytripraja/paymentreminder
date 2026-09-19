/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cover: '#17261D',
        cover2: '#1F3327',
        paper: '#F1ECDD',
        ink: '#1F2A22',
        inksoft: '#5A6459',
        cream: '#EDE7D3',
        amber: '#B5651D',
        overdue: '#8C2F1B',
        paidcol: '#3F6B3F'
      },
      fontFamily: {
        slab: ['"Roboto Slab"', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
