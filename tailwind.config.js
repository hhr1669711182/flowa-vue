/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#409EFF',
          50: '#ecf5ff',
          100: '#d9ecff',
          200: '#b3d8ff',
          300: '#8cc5ff',
          400: '#66b1ff',
          500: '#409eff',
          600: '#337ecc',
          700: '#265eb8',
          800: '#1d458d',
          900: '#11295b',
        },
        sidebar: {
          DEFAULT: '#001529',
          active: '#1890ff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
        'header': '0 1px 4px rgba(0,21,41,.08)',
      }
    },
  },
  plugins: [],
}
