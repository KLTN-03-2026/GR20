const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    container: false
  },
  theme: {
    extend: {
      colors: {
        orange: '#ee4d2d',
        // Chỉ định nghĩa các màu đang dùng
        'surface-container-low': '#e6f6ff',
        'surface-container-lowest': '#ffffff',
        surface: '#f3faff',
        'on-surface': '#071e27',
        'primary-container': '#1a237e',
        primary: '#000666',
        'on-primary': '#ffffff',
        'secondary-container': '#58e6ff',
        secondary: '#006876',
        error: '#ba1a1a',
        outline: '#767683',
        'outline-variant': '#c6c5d4',
      },
      fontFamily: {
        manrope: ['Manrope'],
        inter: ['Inter'],
      }
    }
  },
  plugins: [
    plugin(function ({ addComponents, theme }) {
      addComponents({
        '.container': {
          maxWidth: theme('columns.7xl'),
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4')
        }
      })
    })
  ]
}