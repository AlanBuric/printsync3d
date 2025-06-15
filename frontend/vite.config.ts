import { fileURLToPath, URL } from 'url';
import { CommonServerOptions, defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';

const proxy: CommonServerOptions['proxy'] = {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [vue(), tailwindcss(), VueI18nPlugin({ strictMessage: false })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  preview: { proxy, port: 3000 },
  server: { proxy, port: 80 },
});
