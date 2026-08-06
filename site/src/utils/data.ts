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

export interface TopupDenomination {
  currency: string;
  rate?: number;
  providers: {
    key: string;
    name: string;
    logo: string;
    price: number;
    url: string;
    take: number;
    rate?: number;
  }[];
}

export interface VoucherDenomination {
  name: string;
  providers: {
    key: string;
    name: string;
    logo: string;
    price: number;
    url: string;
  }[];
}

export interface RegionData {
  id: string;
  label: string;
  payCurrency: string;
  type: 'topups' | 'vouchers';
  topups?: TopupDenomination[];
  vouchers?: VoucherDenomination[];
}

export interface ServiceData {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  regions: RegionData[];
  _providerCount?: number;
  _totalRegions?: number;
  _maxSavings?: number;
}

export interface CategoryData {
  id: string;
  name: string;
  services: ServiceData[];
}

// ===== МАППИНГИ =====

const CATEGORY_NAMES: Record<string, string> = {
  games: 'Игры',
  mobile: 'Мобильная связь',
  ewallets: 'Электронные кошельки',
  software: 'ПО и сервисы',
  streaming: 'Стриминг',
};

const SERVICE_NAMES: Record<string, string> = {
  // games
  ea: 'EA',
  xbox: 'Xbox',
  steam: 'Steam',
  roblox: 'Roblox',
  ea_fc_25: 'EA FC 25',
  valorant: 'Valorant',
  free_fire: 'Free Fire',
  minecraft: 'Minecraft',
  battle_net: 'Battle.net',
  pubg_mobile: 'PUBG Mobile',
  marvel_rivals: 'Marvel Rivals',
  arena_breakout: 'Arena Breakout',
  nintendo_eshop: 'Nintendo eShop',
  pubg_new_state: 'PUBG New State',
  razer_gold_pins: 'Razer Gold',
  playstation_store: 'PlayStation Store',
  pubg_battlegrounds: 'PUBG Battlegrounds',
  goddess_of_victory_nikke: 'GODDESS OF VICTORY: Nikke',
  // mobile
  nar: 'Nar (Кыргызстан)',
  esim: 'eSIM',
  activ: 'Activ (Азербайджан)',
  altel: 'Altel (Казахстан)',
  kcell: 'Kcell (Кыргызстан)',
  magti: 'MAGTI (Армения)',
  tele2: 'Tele2',
  ucell: 'Ucell (Узбекистан)',
  mobiuz: 'Mobiuz (Узбекистан)',
  orange: 'Orange',
  bakcell: 'Bakcell (Азербайджан)',
  beeline: 'Beeline',
  cellfie: 'Cellfie (Грузия)',
  megacom: 'Megacom (Кыргызстан)',
  silknet: 'Silknet (Грузия)',
  azercell: 'AzerCell (Азербайджан)',
  geo_cell: 'Geocell (Грузия)',
  uzmobile: 'Uzmobile (Узбекистан)',
  perfectum: 'Perfectum Mobile',
  global_cell: 'Globalcell (Узбекистан)',
  o_nurtelecom: 'NurTelecom (Казахстан)',
  a_mobile_phone: 'Мобильный телефон',
  // ewallets
  alipay: 'Alipay',
  wechat: 'WeChat Pay',
  a_mobile_ewallet: 'Электронный кошелёк',
  // software
  discord: 'Discord',
  app_store: 'App Store',
  // streaming
  twitch: 'Twitch',
};

const REGION_NAMES: Record<string, string> = {
  'US': 'США',
  'DE': 'Германия',
  'GB': 'Великобритания',
  'FR': 'Франция',
  'ES': 'Испания',
  'IT': 'Италия',
  'PL': 'Польша',
  'NL': 'Нидерланды',
  'SE': 'Швеция',
  'NO': 'Норвегия',
  'DK': 'Дания',
  'FI': 'Финляндия',
  'CH': 'Швейцария',
  'AT': 'Австрия',
  'BE': 'Бельгия',
  'CZ': 'Чехия',
  'RO': 'Румыния',
  'PT': 'Португалия',
  'GR': 'Греция',
  'HR': 'Хорватия',
  'UA': 'Украина',
  'RU': 'Россия',
  'BY': 'Беларусь',
  'KZ': 'Казахстан',
  'UZ': 'Узбекистан',
  'GE': 'Грузия',
  'AM': 'Армения',
  'AZ': 'Азербайджан',
  'KG': 'Кыргызстан',
  'TJ': 'Таджикистан',
  'TM': 'Туркменистан',
  'TR': 'Турция',
  'IL': 'Израиль',
  'AE': 'ОАЭ',
  'SA': 'Саудовская Аравия',
  'IN': 'Индия',
  'CN': 'Китай',
  'JP': 'Япония',
  'KR': 'Южная Корея',
  'TH': 'Таиланд',
  'VN': 'Вьетнам',
  'SG': 'Сингапур',
  'MY': 'Малайзия',
  'ID': 'Индонезия',
  'PH': 'Филиппины',
  'BR': 'Бразилия',
  'MX': 'Мексика',
  'AR': 'Аргентина',
  'CL': 'Чили',
  'CO': 'Колумбия',
  'PE': 'Перу',
  'EG': 'Египет',
  'NG': 'Нигерия',
  'ZA': 'ЮАР',
  'NZ': 'Новая Зеландия',
  'CA': 'Канада',
  'AU': 'Австралия',
  'CIS': 'СНГ',
  'GLOBAL': 'Мир',
  'ABKHAZIA': 'Абхазия',
};

// ===== ФУНКЦИИ =====

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

function formatCategoryName(id: string): string {
  return CATEGORY_NAMES[id] || id;
}

function formatServiceName(id: string): string {
  return SERVICE_NAMES[id] || id.replace(/[_-]/g, ' ');
}

function extractRegionCode(id: string): string {
  if (id.startsWith('CUSTOM:')) {
    return id.replace('CUSTOM:', '');
  }
  if (id.startsWith('ISO-3166-1:A2:')) {
    return id.replace('ISO-3166-1:A2:', '');
  }
  return id;
}

function formatRegionLabel(id: string): string {
  const code = extractRegionCode(id);
  return REGION_NAMES[code] || code;
}

export function getRegionFlag(id: string): string {
  if (id.startsWith('CUSTOM:')) {
    return '🌐';
  }
  if (id.startsWith('ISO-3166-1:A2:')) {
    const code = id.replace('ISO-3166-1:A2:', '').toUpperCase();
    return String.fromCodePoint(...[...code].map(c => 127397 + c.charCodeAt(0)));
  }
  return '🌍';
}

export function getRegionCode(id: string): string {
  return extractRegionCode(id);
}

// Подсчёт уникальных провайдеров сервиса
function countProviders(serviceValue: any): number {
  let count = 0;
  for (const [type, typeValue] of Object.entries(serviceValue)) {
    if (type !== 'topups' && type !== 'vouchers') continue;
    for (const [, regionValue] of Object.entries(typeValue as Record<string, any>)) {
      for (const [, payCurrencyValue] of Object.entries(regionValue)) {
        for (const [, denomValue] of Object.entries(payCurrencyValue)) {
          const provObj = denomValue as any;
          if (provObj && typeof provObj === 'object' && 'url' in provObj) {
            count++;
          }
        }
      }
    }
  }
  return count;
}

// Список стран для eSIM (ограниченный набор для главной)
const ESIM_COUNTRIES_ON_HOME = [
  'US', 'GB', 'DE', 'FR', 'ES', 'TH', 'TR', 'AE', 'JP', 'KR',
];

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

    // Собираем сервисы с подсчётом провайдеров
    const servicesRaw: { service: ServiceData; providerCount: number }[] = [];

    for (const [serviceId, serviceValue] of Object.entries(catValue)) {
      if (!serviceValue || typeof serviceValue !== 'object') continue;

      const service: ServiceData = {
        id: serviceId,
        name: formatServiceName(serviceId),
        categoryId: catId,
        categoryName: category.name,
        regions: [],
      };

      for (const [type, typeValue] of Object.entries(serviceValue)) {
        if (!typeValue || typeof typeValue !== 'object') continue;
        if (type !== 'topups' && type !== 'vouchers') continue;

        for (const [regionId, regionValue] of Object.entries(typeValue)) {
          if (!regionValue || typeof regionValue !== 'object') continue;

          const region: RegionData = {
            id: regionId,
            label: formatRegionLabel(regionId),
            payCurrency: '',
            type: type as 'topups' | 'vouchers',
          };

          for (const [payCurrency, payCurrencyValue] of Object.entries(regionValue)) {
            if (!payCurrencyValue || typeof payCurrencyValue !== 'object') continue;
            region.payCurrency = payCurrency;

            if (type === 'topups') {
              region.topups = region.topups || [];
              for (const [receiveCurrency, receiveValue] of Object.entries(payCurrencyValue)) {
                if (!receiveValue || typeof receiveValue !== 'object') continue;

                const topup: TopupDenomination = {
                  currency: receiveCurrency,
                  providers: [],
                };

                // Получаем rate из первого провайдера (курс одинаковый для всех)
                const firstProv = Object.values(receiveValue).find((v: any) => v && 'rate' in v);
                const rate = firstProv ? (firstProv as any).rate : undefined;

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
                    rate,
                  });
                }

                if (topup.providers.length > 0) {
                  region.topups.push(topup);
                }
              }
            } else {
              region.vouchers = region.vouchers || [];
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
        const pCount = countProviders(serviceValue);
        servicesRaw.push({ service, providerCount: pCount });
      }
    }

    // Сортировка: больше провайдеров → выше
    servicesRaw.sort((a, b) => b.providerCount - a.providerCount);
    category.services = servicesRaw.map(s => s.service);

    if (category.services.length > 0) {
      categories.push(category);
    }
  }

  return { categories, providers };
}

// Вычисляет макс. экономию по всем номиналам сервиса
function computeMaxSavings(service: ServiceData): number {
  let maxSavings = 0;
  for (const region of service.regions) {
    if (region.type === 'topups' && region.topups) {
      for (const topup of region.topups) {
        if (topup.providers.length < 2) continue;
        const rates = topup.providers.filter(p => p.take > 0).map(p => p.price / p.take);
        if (rates.length < 2) continue;
        const min = Math.min(...rates);
        const max = Math.max(...rates);
        if (max > min) {
          const savings = ((max - min) / min) * 100;
          if (savings > maxSavings) maxSavings = savings;
        }
      }
    }
    if (region.type === 'vouchers' && region.vouchers) {
      for (const voucher of region.vouchers) {
        if (voucher.providers.length < 2) continue;
        const prices = voucher.providers.map(p => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (max > min) {
          const savings = ((max - min) / min) * 100;
          if (savings > maxSavings) maxSavings = savings;
        }
      }
    }
  }
  return maxSavings;
}

// Версия для главной страницы: ограничивает eSIM регионы
export function parseAllDataForHome(): { categories: CategoryData[]; providers: Record<string, ServiceProvider>; esimTotalRegions: number } {
  const result = parseAllData();
  let esimTotal = 0;

  for (const cat of result.categories) {
    for (const svc of cat.services) {
      if (svc.id === 'esim') {
        esimTotal = svc.regions.length;
        svc._totalRegions = esimTotal;
        svc.regions = svc.regions.filter(r => {
          const code = extractRegionCode(r.id);
          return ESIM_COUNTRIES_ON_HOME.includes(code);
        });
      }
      // Вычисляем макс. экономию для каждого сервиса
      svc._maxSavings = computeMaxSavings(svc);
    }
  }

  return { ...result, esimTotalRegions: esimTotal };
}

export function findBestProvider(prices: { name: string; price: number }[]): { name: string; price: number; savingsPercent: number } | null {
  if (prices.length < 2) return null;
  const best = prices.reduce((min, p) => p.price < min.price ? p : min);
  const worst = prices.reduce((max, p) => p.price > max.price ? p : max);
  const savings = worst.price > best.price ? ((worst.price - best.price) / worst.price * 100) : 0;
  return { name: best.name, price: best.price, savingsPercent: savings };
}
