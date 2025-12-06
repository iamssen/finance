import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: '/',
  server: {
    host: true,
    https: {
      cert: process.env.LOCALHOST_HTTPS_CERT,
      key: process.env.LOCALHOST_HTTPS_KEY,
      // @ts-expect-error maxSessionMemory is not in the type definition
      maxSessionMemory: 100,
      peerMaxConcurrentStreams: 300,
    },
  },
  build: {
    outDir: 'dist',
  },
  css: {
    postcss: {
      plugins: [autoprefixer({})],
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tsconfigPaths(),
    compression(),
    compression({
      algorithms: ['brotliCompress'],
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
  ],
});
