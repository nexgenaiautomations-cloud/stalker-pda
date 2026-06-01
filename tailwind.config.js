/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Anomaly PDA palette: dark warm sand/khaki with amber tactical accents
        pda: {
          bg: '#15130e',           // deepest background
          panel: '#1c1a13',        // panel base
          panel2: '#23201a',       // hover/sub-panel
          frame: '#0c0b08',        // outer frame
          border: '#3a3326',       // subtle warm border
          borderHot: '#5a4a2a',    // accent border
          rule: '#2a2520',         // hairlines
          amber: '#ffb13b',        // primary accent (active tab, highlights)
          amberHot: '#ffd56b',     // hover/active bright
          amberDim: '#a5752a',     // dim accent
          orange: '#ff8a2b',       // warning/active mission
          red: '#ff3a2b',          // danger/enemy
          green: '#7ec84a',        // friendly/loner
          blue: '#5fb4ff',         // info
          text: '#d9c9a4',         // primary text (sand)
          textBright: '#ffe8c4',   // bright text
          muted: '#8a7a5e',        // dim text
          dim: '#5a4f3e'           // disabled
        }
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', '"VT323"', 'Consolas', 'ui-monospace', 'monospace'],
        stencil: ['"Black Ops One"', '"Share Tech Mono"', 'sans-serif']
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.97' },
          '75%': { opacity: '0.93' }
        },
        blip: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.3' } }
      },
      animation: {
        flicker: 'flicker 5s infinite',
        blip: 'blip 1.4s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
