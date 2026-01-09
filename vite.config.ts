import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.SHOPIFY_SHOP_DOMAIN': JSON.stringify(env.SHOPIFY_SHOP_DOMAIN),
        'process.env.SHOPIFY_ADMIN_API_TOKEN': JSON.stringify(env.SHOPIFY_ADMIN_API_TOKEN),
        'process.env.SHOPIFY_API_VERSION': JSON.stringify(env.SHOPIFY_API_VERSION || '2024-01'),
        'process.env.PRINTIFY_API_TOKEN': JSON.stringify(env.PRINTIFY_API_TOKEN),
        'process.env.PRINTIFY_SHOP_ID': JSON.stringify(env.PRINTIFY_SHOP_ID),
        'process.env.ETSY_API_KEY': JSON.stringify(env.ETSY_API_KEY),
        'process.env.ETSY_SHOP_ID': JSON.stringify(env.ETSY_SHOP_ID),
        'process.env.ETSY_ACCESS_TOKEN': JSON.stringify(env.ETSY_ACCESS_TOKEN)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
