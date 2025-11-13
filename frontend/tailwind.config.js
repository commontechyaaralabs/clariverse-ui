/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
        extend: {
          colors: {
              background: 'var(--background)',
              foreground: 'var(--foreground)',
              card: {
                DEFAULT: 'var(--card)',
                foreground: 'var(--card-foreground)',
              },
              popover: {
                DEFAULT: 'var(--popover)',
                foreground: 'var(--popover-foreground)',
              },
              primary: {
                DEFAULT: 'var(--primary)',
                foreground: 'var(--primary-foreground)',
              },
              secondary: {
                DEFAULT: 'var(--secondary)',
                foreground: 'var(--secondary-foreground)',
              },
              muted: {
                DEFAULT: 'var(--muted)',
                foreground: 'var(--muted-foreground)',
              },
              accent: {
                DEFAULT: 'var(--accent)',
                foreground: 'var(--accent-foreground)',
              },
              destructive: {
                DEFAULT: 'var(--destructive)',
                foreground: 'var(--destructive-foreground)',
              },
              border: 'var(--border)',
              input: 'var(--input)',
              ring: 'var(--ring)',
              chart: {
                1: 'var(--chart-1)',
                2: 'var(--chart-2)',
                3: 'var(--chart-3)',
                4: 'var(--chart-4)',
                5: 'var(--chart-5)',
              },
              sidebar: {
                DEFAULT: 'var(--sidebar)',
                foreground: 'var(--sidebar-foreground)',
                primary: 'var(--sidebar-primary)',
                'primary-foreground': 'var(--sidebar-primary-foreground)',
                accent: 'var(--sidebar-accent)',
                'accent-foreground': 'var(--sidebar-accent-foreground)',
                border: 'var(--sidebar-border)',
                ring: 'var(--sidebar-ring)',
              },
               // Brand colors - Professional Dark Theme
               'brand-dark-gray': '#141414', /* dark grey - background */
               'brand-violet': '#b90abd', /* Electric Violet - bg +shade */
               'brand-iron': '#d6d9d8', /* iron - footer */
               'brand-white': '#ffffff', /* white - text/button color */
               'brand-blue': '#5332ff', /* blue - text boxes */
               'brand-manatee': '#939394', /* manatee - text boxes */
               'app-black': '#0a0a0a', /* deep black for cards */
            },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
          },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(101, 62, 155, 0.4)' },
          '100%': { boxShadow: '0 0 30px rgba(151, 93, 176, 0.6)' },
        },
      },
      boxShadow: {
        '2xs': 'var(--shadow-2xs)',
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'neu': '8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.05)',
        'neu-hover': '12px 12px 24px rgba(0, 0, 0, 0.5), -12px -12px 24px rgba(255, 255, 255, 0.08)',
        'neu-inset': 'inset 4px 4px 8px rgba(0, 0, 0, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.05)',
        'neu-button': '4px 4px 8px rgba(0, 0, 0, 0.3), -4px -4px 8px rgba(255, 255, 255, 0.05)',
        'neu-button-hover': '6px 6px 12px rgba(0, 0, 0, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.08)',
        'neu-button-active': 'inset 4px 4px 8px rgba(0, 0, 0, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.05)',
        'neu-floating': '12px 12px 24px rgba(0, 0, 0, 0.5), -12px -12px 24px rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neu-gradient': 'linear-gradient(135deg, #2a1f3a 0%, #3a2f4a 100%)',
        'purple-gradient': 'linear-gradient(135deg, #653E9B 0%, #975DB0 50%, #36087D 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
