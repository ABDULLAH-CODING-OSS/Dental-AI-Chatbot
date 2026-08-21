import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        // Professional SaaS type scale
        xs: ['11px', { lineHeight: '1.45', letterSpacing: '0.01em' }],           // 11px - smallest labels
        'xs-strong': ['12px', { lineHeight: '1.5', letterSpacing: '0.02em', fontWeight: '600' }], // Small bold text
        sm: ['13px', { lineHeight: '1.5' }],                                     // 13px - secondary text, buttons
        base: ['14px', { lineHeight: '1.6' }],                                   // 14px - body text
        lg: ['16px', { lineHeight: '1.6' }],                                     // 16px - subheadings, section intro
        xl: ['18px', { lineHeight: '1.65' }],                                    // 18px - medium heading
        '2xl': ['20px', { lineHeight: '1.7' }],                                  // 20px - section heading
        '3xl': ['24px', { lineHeight: '1.75' }],                                 // 24px - page title
        '4xl': ['28px', { lineHeight: '1.8' }],                                  // 28px - major heading
      },
      spacing: {
        // Consistent spacing scale
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      borderRadius: {
        // Consistent border radius
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        // Keep existing color config from globals.css
      },
    },
  },
  plugins: [],
};

export default config;
