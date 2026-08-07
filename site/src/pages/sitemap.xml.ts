import type { APIRoute } from 'astro';
import { parseAllData } from '../utils/data';

const SITE_URL = (import.meta.env.SITE || 'https://paycompass.ru').replace(/\/$/, '');
const BASE = import.meta.env.BASE_URL || '/';

export const GET: APIRoute = () => {
  const { categories } = parseAllData();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Главная страница
  xml += `  <url>\n`;
  xml += `    <loc>${SITE_URL}${BASE}/</loc>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // Страницы категорий
  for (const category of categories) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}${BASE}/${category.id}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    // Страницы сервисов
    for (const service of category.services) {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}${BASE}/${category.id}/${service.id}/</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
