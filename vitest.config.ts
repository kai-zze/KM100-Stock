import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    globals: true
  },
  resolve: {
    alias: {
      // Point package imports at the ambient type shims used by tsconfig
      react: '/src/types/ambient.d.ts',
      'react-dom': '/src/types/ambient.d.ts',
      'lucide-react': '/src/types/ambient.d.ts',
      xlsx: '/src/types/ambient.d.ts'
    }
  }
});
