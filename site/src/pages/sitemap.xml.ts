import type { APIRoute } from 'astro';
import { parseAllData, parseTransferData } from '../utils/data';

const SITE_URL = (import.meta.env.SITE || 'https://paycompass.ru').replace(/\/$/, '');
const BASE = (import.meta.env.BASE_URL || '').replace(/\/$/, '');

function url(path: string) {
  return `${SITE_URL}/${BASE}/${path}`.replace(/\/\/+/g, '/');
}

export const GET: APIRoute = () => {
  const { categories } = parseAllData();
  const { countries } = parseTransferData();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Главная страница
  xml += `  <url>\n`;
  xml += `    <loc>${SITE_URL}/</loc>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // Страницы категорий
  for (const category of categories) {
    xml += `  <url>\n`;
    xml += `    <loc>${url(category.id)}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    // Страницы сервисов
    for (const service of category.services) {
      xml += `  <url>\n`;
      xml += `    <loc>${url(`${category.id}/${service.id}`)}/</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }
  }

  // Главная страница переводов
  xml += `  <url>\n`;
  xml += `    <loc>${url('transfers')}/</loc>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>0.9</priority>\n`;
  xml += `  </url>\n`;

  // Страницы стран переводов
  for (const country of countries) {
    xml += `  <url>\n`;
    xml += `    <loc>${url(`transfers/${country.id}`)}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
