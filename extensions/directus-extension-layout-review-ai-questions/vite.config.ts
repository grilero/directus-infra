import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ReviewAIQuestions',
      fileName: () => 'index.js',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', '@directus/extensions-sdk'],
    },
    emptyOutDir: true,
  },
}); 