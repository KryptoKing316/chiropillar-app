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
        // Navy luminance scale
        navy: {
          DEFAULT: '#0B1B3E',
          '2': '#0F2347',
          '3': '#152C58',
          '4': '#1C3668',
        },
        // Gold system
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C96A',
          hover: '#B8973F',
          deep: '#A08032',
          dim: 'rgba(201,168,76,0.12)',
          glow: 'rgba(201,168,76,0.08)',
          border: 'rgba(201,168,76,0.20)',
        },
        // Dashboard semantic tokens
        dash: {
          text: '#F2EEE7',
          secondary: '#9BA8C0',
          muted: '#4A5880',
          disabled: '#2C3E5A',
          green: '#2ECC8B',
          red: '#E74C3C',
          blue: '#3498DB',
          amber: '#F39C12',
        },
        // Marketing / light surface tokens
        kb: {
          bg: '#F2EEE7',
          text: '#F2EEE7',
          body: '#5A6A7E',
          label: '#2C3E5A',
          muted: '#9BA8C0',
          faint: '#4A5880',
          border: '#E5DDD0',
          'border-dark': 'rgba(255,255,255,0.08)',
          green: '#2ECC8B',
          red: '#E74C3C',
          info: '#3498DB',
        },
        // White opacity utilities
        'white-2': 'rgba(255,255,255,0.02)',
        'white-3': 'rgba(255,255,255,0.03)',
        'white-4': 'rgba(255,255,255,0.04)',
        'white-5': 'rgba(255,255,255,0.05)',
        'white-8': 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Inter Variable', 'DM Sans', 'SF Pro Display', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      fontWeight: {
        reading: '400',
        emphasis: '510',
        strong: '590',
      },
      borderRadius: {
        micro: '2px',
        standard: '4px',
        comfortable: '6px',
        card: '8px',
        panel: '12px',
        pill: '9999px',
      },
      boxShadow: {
        'gold-glow': 'rgba(201,168,76,0.08) 0px 0px 16px',
        'gold-cta': 'rgba(201,168,76,0.25) 0px 2px 8px',
        'elevated': 'rgba(0,0,0,0.3) 0px 4px 12px',
        'modal': 'rgba(0,0,0,0.4) 0px 8px 24px',
        'subtle': 'rgba(0,0,0,0.15) 0px 1px 2px',
        'kb-sm': 'rgba(11,27,62,0.04) 0px 2px 4px',
        'kb-md': 'rgba(11,27,62,0.08) 0px 8px 24px',
        'kb-lg': 'rgba(11,27,62,0.15) 0px 20px 40px -20px, rgba(0,0,0,0.06) 0px 12px 24px -12px',
        'kb-xl': 'rgba(11,27,62,0.20) 0px 30px 45px -30px, rgba(201,168,76,0.08) 0px 4px 12px',
        'kb-gold': 'rgba(201,168,76,0.25) 0px 4px 12px',
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.00', letterSpacing: '-1.056px', fontWeight: '510' }],
        'section': ['24px', { lineHeight: '1.20', letterSpacing: '-0.528px', fontWeight: '510' }],
        'card-title': ['20px', { lineHeight: '1.30', letterSpacing: '-0.24px', fontWeight: '590' }],
        'financial-lg': ['24px', { lineHeight: '1.20', letterSpacing: '-0.3px', fontWeight: '500' }],
        'financial': ['16px', { lineHeight: '1.40', fontWeight: '500' }],
        'financial-sm': ['13px', { lineHeight: '1.40', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}
export default config
