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
        // 主色调 - 汽水音乐风格粉红
        primary: {
          50: '#fff0f6',
          100: '#ffe1ed',
          200: '#ffc8de',
          300: '#ff9fc4',
          400: '#ff6ba3',
          500: '#ff3381',
          600: '#ed116b',
          700: '#c80858',
          800: '#a60a4a',
          900: '#8c0d42',
        },
        // 深色背景 - 深蓝/深紫色调
        dark: {
          50: '#f0f1f4',
          100: '#e2e4ea',
          200: '#c5c8d4',
          300: '#9ea2b5',
          400: '#767c94',
          500: '#5c6279',
          600: '#4a4f62',
          700: '#3d4152',
          800: '#2a2d3a',
          900: '#1a1c25',
          950: '#0f1015',
        },
        // 强调色
        accent: {
          purple: '#8b5cf6',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'soda-gradient': 'linear-gradient(135deg, #1a1c25 0%, #2a1f35 50%, #1a1c25 100%)',
        'card-gradient': 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'vinyl-spin': 'spin 3s linear infinite',
        'gradient-shift': 'gradientShift 10s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'equalizer': 'equalizer 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        equalizer: {
          '0%, 100%': { height: '40%' },
          '50%': { height: '100%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 51, 129, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 51, 129, 0.4)',
      },
    },
  },
  plugins: [],
}
