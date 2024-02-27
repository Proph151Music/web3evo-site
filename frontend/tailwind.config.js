/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'space-mono': ["'Space Mono'", 'monospace']
      },
      transitionProperty: {
        basis: 'flex-basis'
      },

      colors: {
        purple: '#A259FF',
        'purple-faded': '#A259FF33',
        'gray-450': '#858584',
        'gray-550': '#6b7280',
        'gray-600': '#3B3B3B',
        'gray-700': '#2B2B2B'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        appear: {
          from: {
            opacity: '0',
            transform: 'translate(-50%, -48%) scale(0.96)'
          },
          to: {
            opacity: '1',
            transform: 'translate(-50%, -50%) scale(1)'
          }
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        overlayShow: 'fade-in 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        dialogContentShow: 'appear 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'accordion-down': 'accordion-down 0.3s ease-out',
        'accordion-up': 'accordion-up 0.3s ease-out'
      }
    }
  }
};
