import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 品牌主色：深邃蓝 + 霓虹青
        ink: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#64748B',
          500: '#475569',
          600: '#334155',
          700: '#1E293B',
          800: '#1E293B',
          900: '#0F172A', // 主色
          950: '#020617',
        },
        neon: {
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8', // 霓虹青（高亮）
          500: '#0EA5E9',
          600: '#0284C7',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"PingFang SC"',
          '"Helvetica Neue"',
          'Helvetica',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Apple 风格：超大标题
        'display': ['clamp(2.5rem, 6vw, 4.75rem)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'title':  ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      lineHeight: {
        'relaxed-pro': '1.65',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(56, 189, 248, 0.4)' },
          '50%':      { boxShadow: '0 0 24px 4px rgba(56, 189, 248, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'caret-blink': {
          '0%, 50%':   { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        'grid-drift': {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '60px 60px' },
        },
      },
      animation: {
        'fade-up':   'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-glow':'pulse-glow 2.4s ease-in-out infinite',
        'float':     'float 6s ease-in-out infinite',
        'caret':     'caret-blink 1s steps(1) infinite',
        'grid':      'grid-drift 18s linear infinite',
      },
      backgroundImage: {
        'grid-dark': "linear-gradient(rgba(56,189,248,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(56, 189, 248, 0.25)',
        'glow-md': '0 0 40px rgba(56, 189, 248, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
