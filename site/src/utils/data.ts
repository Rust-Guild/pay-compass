import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ProviderInfo {
  url: string;
  give: number;
  rate?: number;
  take?: number;
}

export interface ServiceProvider {
  logo: string;
  name: string;
}

// Структура для topup (пополнение с валютой зачисления)
export interface TopupDenomination {
  currency: string;       // валюта зачисления (USD, EUR...)
  providers: {
    key: string;
    name: string;
    logo: string;
    price: number;
    url: string;
    take: number;
  }[];
}

// Структура для voucher (ваучер без валюты зачисления)
export interface VoucherDenomination {
  name: string;           // имя ваучера ($10, $20...)
  providers: {
    key: string;
    name: string;
    logo: string;
    price: number;
    url: string;
  }[];
}

export interface RegionData {
  id: string;             // ISO-3166-1:A2:US, CUSTOM:CIS
  label: string;          // читаемое имя
  payCurrency: string;    // валюта оплаты (RUB)
  type: 'topups' | 'vouchers';
  
  // для topups
  topups?: TopupDenomination[];
  // для vouchers
  vouchers?: VoucherDenomination[];
}

export interface ServiceData {
  id: string;             // steam, playstation_store
  name: string;           // Steam, PlayStation Store
  categoryId: string;     // game, software
  categoryName: string;   // Игры, ПО
  regions: RegionData[];
}

export interface CategoryData {
  id: string;             // game, software
  name: string;           // Игры, ПО
  services: ServiceData[];
}

// Читаем JSON файл напрямую
function readJsonFile(): any {
  const path = join(process.cwd(), 'public', 'data', 'index.json');
  const raw = readFileSync(path, 'utf-8');
  return JSON.parse(raw);
}

export function loadPaymentData(): any {
  return readJsonFile();
}

export function loadProviders(): Record<string, ServiceProvider> {
  const data = readJsonFile();
  return data.providers as Record<string, ServiceProvider>;
}

// Форматирует имя региона
function formatRegionLabel(id: string): string {
  if (id.startsWith('CUSTOM:')) {
    const name = id.replace('CUSTOM:', '');
    // CIS → СНГ
    if (name === 'CIS') return 'СНГ';
    return name;
  }
  if (id.startsWith('ISO-3166-1:A2:')) {
    return id.replace('ISO-3166-1:A2:', '');
  }
  return id;
}

// Возвращает эмодзи-флаг для региона
export function getRegionFlag(id: string): string {
  if (id.startsWith('CUSTOM:')) {
    const name = id.replace('CUSTOM:', '');
    if (name === 'CIS') return '🌐'; // СНГ — глобальный флаг
    return '🌐';
  }
  if (id.startsWith('ISO-3166-1:A2:')) {
    const code = id.replace('ISO-3166-1:A2:', '').toUpperCase();
    // Преобразуем двухбуквенный код в эмодзи флага
    return String.fromCodePoint(...[...code].map(c => 127397 + c.charCodeAt(0)));
  }
  return '🌍';
}

// Извлекает код страны из ID региона
export function getRegionCode(id: string): string {
  if (id.startsWith('ISO-3166-1:A2:')) {
    return id.replace('ISO-3166-1:A2:', '');
  }
  return '';
}

// Форматирует имя категории
function formatCategoryName(id: string): string {
  const map: Record<string, string> = {
    'game': 'Игры',
    'software': 'ПО и сервисы',
  };
  return map[id] || id;
}

// Форматирует имя сервиса
function formatServiceName(id: string): string {
  return id.replace(/_/g, ' ');
}

// Парсит все данные из JSON
export function parseAllData(): { categories: CategoryData[]; providers: Record<string, ServiceProvider> } {
  const data = readJsonFile();
  const providers = data.providers as Record<string, ServiceProvider>;
  const payments = data.payments;
  
  const categories: CategoryData[] = [];
  
  for (const [catId, catValue] of Object.entries(payments)) {
    if (!catValue || typeof catValue !== 'object') continue;
    
    const category: CategoryData = {
      id: catId,
      name: formatCategoryName(catId),
      services: [],
    };
    
    for (const [serviceId, serviceValue] of Object.entries(catValue)) {
      if (!serviceValue || typeof serviceValue !== 'object') continue;
      
      const service: ServiceData = {
        id: serviceId,
        name: formatServiceName(serviceId),
        categoryId: catId,
        categoryName: category.name,
        regions: [],
      };
      
      // Парсим типы (topups, vouchers)
      for (const [type, typeValue] of Object.entries(serviceValue)) {
        if (!typeValue || typeof typeValue !== 'object') continue;
        if (type !== 'topups' && type !== 'vouchers') continue;
        
        // Парсим регионы
        for (const [regionId, regionValue] of Object.entries(typeValue)) {
          if (!regionValue || typeof regionValue !== 'object') continue;
          
          const region: RegionData = {
            id: regionId,
            label: formatRegionLabel(regionId),
            payCurrency: '',
            type: type as 'topups' | 'vouchers',
          };
          
          // Парсим валюты оплаты -> номиналы -> провайдеры
          for (const [payCurrency, payCurrencyValue] of Object.entries(regionValue)) {
            if (!payCurrencyValue || typeof payCurrencyValue !== 'object') continue;
            region.payCurrency = payCurrency;
            
            if (type === 'topups') {
              region.topups = region.topups || [];
              // Для topups: payCurrency -> receiveCurrency -> providers
              for (const [receiveCurrency, receiveValue] of Object.entries(payCurrencyValue)) {
                if (!receiveValue || typeof receiveValue !== 'object') continue;
                
                const topup: TopupDenomination = {
                  currency: receiveCurrency,
                  providers: [],
                };
                
                for (const [provKey, provValue] of Object.entries(receiveValue)) {
                  if (!provValue || typeof provValue !== 'object' || !('url' in provValue)) continue;
                  const provInfo = providers[provKey] || { name: provKey, logo: '' };
                  topup.providers.push({
                    key: provKey,
                    name: provInfo.name,
                    logo: provInfo.logo,
                    price: (provValue as any).give,
                    url: (provValue as any).url,
                    take: (provValue as any).take || 0,
                  });
                }
                
                if (topup.providers.length > 0) {
                  region.topups.push(topup);
                }
              }
            } else {
              region.vouchers = region.vouchers || [];
              // Для vouchers: payCurrency -> voucherName -> providers
              for (const [voucherName, voucherValue] of Object.entries(payCurrencyValue)) {
                if (!voucherValue || typeof voucherValue !== 'object') continue;
                
                const voucher: VoucherDenomination = {
                  name: voucherName,
                  providers: [],
                };
                
                for (const [provKey, provValue] of Object.entries(voucherValue)) {
                  if (!provValue || typeof provValue !== 'object' || !('url' in provValue)) continue;
                  const provInfo = providers[provKey] || { name: provKey, logo: '' };
                  voucher.providers.push({
                    key: provKey,
                    name: provInfo.name,
                    logo: provInfo.logo,
                    price: (provValue as any).give,
                    url: (provValue as any).url,
                  });
                }
                
                if (voucher.providers.length > 0) {
                  region.vouchers.push(voucher);
                }
              }
            }
          }
          
          if ((region.topups && region.topups.length > 0) || (region.vouchers && region.vouchers.length > 0)) {
            service.regions.push(region);
          }
        }
      }
      
      if (service.regions.length > 0) {
        category.services.push(service);
      }
    }
    
    if (category.services.length > 0) {
      categories.push(category);
    }
  }
  
  return { categories, providers };
}

// Находит лучшую цену среди провайдеров
// Возвращает null если провайдеров 0 или 1 (нечего сравнивать)
export function findBestProvider(prices: { name: string; price: number }[]): { name: string; price: number; savingsPercent: number } | null {
  if (prices.length < 2) return null;
  const best = prices.reduce((min, p) => p.price < min.price ? p : min);
  const worst = prices.reduce((max, p) => p.price > max.price ? p : max);
  const savings = worst.price > best.price ? ((worst.price - best.price) / worst.price * 100) : 0;
  return { name: best.name, price: best.price, savingsPercent: savings };
}
