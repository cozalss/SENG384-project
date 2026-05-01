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
    modulePreload: {
      resolveDependencies(_filename, deps) {
        // Spline's runtime is intentionally lazy. Vite would otherwise emit a
        // modulepreload for the ~2MB 3D chunk into index.html, making even
        // dashboard/login visits download landing-only WebGL code.
        const landing3dChunks = [
          'spline-',
          'physics-',
          'navmesh-',
          'opentype-',
          'gaussian-splat',
          'boolean-',
          'process-',
        ];
        return deps.filter((dep) => !landing3dChunks.some((name) => dep.includes(name)));
      },
    },
    chunkSizeWarningLimit: 800,
    // Inline anything <= 8 KB as base64 — saves an HTTP round-trip for tiny
    // SVG icons and CSS-referenced images.
    assetsInlineLimit: 8192,
    // Production CSS is split per route so each chunk only ships its own
    // styles. Default already, made explicit.
    cssCodeSplit: true,
    // esbuild is ~10x faster than terser and shrinks output the same amount
    // for our codebase (no advanced terser tricks would help here).
    minify: 'esbuild',
    // Source maps off in production — saves ~30% of total bundle weight at
    // rest, and the symbols leak in maps would expose private logic.
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('vite/preload-helper')) return 'preload-helper';
          const normalizedId = id.replace(/\\/g, '/');
          if (!normalizedId.includes('node_modules')) return undefined;
          if (/\/node_modules\/(react|react-dom|react-router-dom)\//.test(normalizedId)) {
            return 'react-vendor';
          }
          if (normalizedId.includes('/node_modules/framer-motion/')) {
            return 'framer';
          }
          if (normalizedId.includes('/node_modules/firebase/') ||
              normalizedId.includes('/node_modules/@firebase/')) {
            return 'firebase-vendor';
          }
          if (normalizedId.includes('/node_modules/lucide-react/')) {
            return 'icons';
          }
          if (normalizedId.includes('/node_modules/@splinetool/')) {
            return 'spline';
          }
          if (normalizedId.includes('/node_modules/@emailjs/') ||
              normalizedId.includes('/node_modules/react-parallax-tilt/') ||
              normalizedId.includes('/node_modules/classnames/') ||
              normalizedId.includes('/node_modules/tailwind-merge/')) {
            return 'misc';
          }
          return undefined;
        }
      }
    }
  },
  esbuild: {
    // Drop console.* and debugger statements in the production bundle. Saves
    // a few KB and keeps any verbose logging out of users' DevTools tabs.
    drop: ['console', 'debugger'],
    // legalComments: 'none' would also strip license headers; leaving them
    // in keeps us compliant with packages that require attribution.
    legalComments: 'inline',
  },
})
