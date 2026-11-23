import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function serveAgenticManifestsPlugin(): Plugin {
  const handleManifestRequest = (req: any, res: any, next: any, isPreview: boolean) => {
    const url = req.url?.split('?')[0];
    if (
      url === '/.well-known/ai-catalog.json' ||
      url === '/.well-known/ard.json' ||
      url === '/ai-catalog.json' ||
      url === '/llms.txt'
    ) {
      const baseDir = isPreview
        ? path.resolve(__dirname, 'dist')
        : path.resolve(__dirname, 'public');
      
      let filePath = path.join(baseDir, url);
      if (!fs.existsSync(filePath) && isPreview) {
        filePath = path.join(__dirname, 'public', url);
      }

      if (fs.existsSync(filePath)) {
        const contentType = url.endsWith('.txt')
          ? 'text/plain; charset=utf-8'
          : url.includes('ai-catalog')
            ? 'application/ai-catalog+json; charset=utf-8'
            : 'application/json; charset=utf-8';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.statusCode = 200;
        res.end(fs.readFileSync(filePath));
        return;
      }
    }
    next();
  };

  return {
    name: 'serve-agentic-manifests',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        handleManifestRequest(req, res, next, false);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        handleManifestRequest(req, res, next, true);
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), serveAgenticManifestsPlugin()],
  server: {
    port: 3000
  },
  preview: {
    port: 3000
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase-vendor';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons-vendor';
          }
        }
      }
    }
  }
});
