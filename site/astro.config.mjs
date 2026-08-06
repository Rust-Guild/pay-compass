// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.SITE || 'https://rust-guild.github.io',
  base: '/pay-compass',
});
