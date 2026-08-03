import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const isAiStudioPreview =
    process.env.DISABLE_HMR === 'true' ||
    process.env.DISABLE_HMR === '1' ||
    Boolean(process.env.K_SERVICE) ||
    Boolean(process.env.CLOUD_RUN_JOB);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      hmr: isAiStudioPreview ? false : true,
      watch: {
        usePolling: false,
      },
    },
  };
});
