import type { APIRoute } from 'astro';

const SITE_URL = (import.meta.env.SITE || 'https://paycompass.ru').replace(/\/$/, '');
const BASE = import.meta.env.BASE_URL || '';

const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${SITE_URL}${BASE}/sitemap.xml
`.trim();

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
