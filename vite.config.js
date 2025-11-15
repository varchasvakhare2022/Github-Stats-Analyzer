import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize build for production
    // Using esbuild (default) - faster and no extra dependencies
    minify: 'esbuild',
    // esbuild automatically removes console/debugger in production
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'framer-motion': ['framer-motion'],
          'charts': ['recharts'],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (optional, can disable for smaller builds)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'recharts'],
  },
  // Preview server configuration for Railway
  preview: {
    host: true, // Allow external connections
    port: process.env.PORT || 4173,
    strictPort: false,
    allowedHosts: [
      'github-stats.up.railway.app',
      '.railway.app', // Allow all Railway subdomains
    ],
  },
})