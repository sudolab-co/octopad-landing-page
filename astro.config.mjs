import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://octopad.ai',
  output: 'static',
  adapter: vercel(),
  build: {
    format: 'file',
  },
});
