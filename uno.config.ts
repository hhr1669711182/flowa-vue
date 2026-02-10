import { defineConfig, presetUno, presetIcons, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  theme: {
    colors: {
      primary: '#1890ff', // Standard Ant Design Blue as placeholder
      secondary: '#52c41a',
      success: '#67c23a',
      warning: '#e6a23c',
      danger: '#f56c6c',
      info: '#909399',
      dark: '#001529', // Sidebar color
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    boxShadow: {
      'card': '0 4px 12px rgba(0, 0, 0, 0.05)',
      'header': '0 1px 4px rgba(0, 21, 41, 0.08)',
    }
  },
  shortcuts: {
    'flex-center': 'flex justify-center items-center',
    'flex-between': 'flex justify-between items-center',
    'card': 'bg-white rounded-lg shadow-card p-4 border border-gray-100',
  }
})
