import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false
  },
  build: {
    // Bump the warning threshold — our heavy chunks (three, firebase) are
    // intentional vendor splits, not actual app code bloat.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — cached across all routes
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Animation library — used everywhere
          'framer': ['framer-motion'],

          // Three.js landing scene — only loaded on '/'
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'maath'],

          // Firebase — auth, firestore, app
          'firebase-vendor': ['firebase/app', 'firebase/firestore'],

          // Icons — used everywhere but standalone
          'icons': ['lucide-react'],

          // Video streaming — only for inner pages
          'hls': ['hls.js'],

          // Email + tilt + particles — misc heavy libs
          'misc': ['@emailjs/browser', 'react-parallax-tilt', 'tsparticles', 'tsparticles-slim', 'react-tsparticles']
        }
      }
    }
  }
})
