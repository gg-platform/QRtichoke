import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Security headers for development
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  build: {
    // Security-focused build options
    sourcemap: false, // Don't expose source maps in production
    minify: 'terser',
    chunkSizeWarningLimit: 1000, // Increase limit for large dependencies
    rollupOptions: {
      output: {
        // Prevent potential issues with filename collisions
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Code splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@fluentui/react-components', '@fluentui/react-icons'],
          utils: ['qrcode', '@ctrl/tinycolor', 'dompurify']
        }
      },
    },
  },
  define: {
    // Remove development-only code in production
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
})
