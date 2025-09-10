/**
 * Configuración de selectores CSS para diferentes sitios de comercio electrónico
 */

export interface SiteSelectors {
  title: string[];
  price: string[];
}

export interface ScrapingConfig {
  [domain: string]: SiteSelectors;
}

export const SCRAPING_CONFIG: ScrapingConfig = {
  'amazon.com': {
    title: [
      '#productTitle',
      '.product-title',
      '[data-automation-id="product-title"]',
      '.a-size-large.a-size-base-plus',
      'h1.a-size-large'
    ],
    price: [
      '.a-price-whole',
      '.a-price .a-offscreen',
      '#priceblock_dealprice',
      '#priceblock_saleprice',
      '#buy-now-button + .a-price .a-offscreen',
      '.a-price-range .a-price .a-offscreen',
      '[data-automation-id="product-price"] .a-price .a-offscreen',
      '.a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen'
    ]
  },
  'ebay.com': {
    title: [
      '#x-title-label-lbl',
      '.x-title-label-lbl',
      'h1[data-testid="lot-title"]',
      '.notranslate',
      'h1.it-ttl'
    ],
    price: [
      '.notranslate .notranslate',
      '[data-testid="lot-price"] .notranslate',
      '.u-flL.condText',
      '#prcIsum',
      '.u-flL .notranslate'
    ]
  },
  'mercadolibre.com': {
    title: [
      '.ui-pdp-title',
      'h1.ui-pdp-title',
      '.item-title__primary',
      '.item-title'
    ],
    price: [
      '.andes-money-amount__fraction',
      '.price-tag-fraction',
      '.ui-pdp-price__fraction',
      '.price-tag .price-tag-fraction'
    ]
  }
};

export const SUPPORTED_SITES = [
  {
    domain: 'amazon.com',
    name: 'Amazon',
    example: 'https://www.amazon.com/dp/B08N5WRWNW'
  },
  {
    domain: 'ebay.com',
    name: 'eBay',
    example: 'https://www.ebay.com/itm/123456789'
  },
  {
    domain: 'mercadolibre.com',
    name: 'MercadoLibre',
    example: 'https://www.mercadolibre.com.mx/producto'
  }
];

export function extractDomain(url: string): string {
  try {
    const domain = url.replace(/https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return domain.toLowerCase();
  } catch {
    return '';
  }
}

export function getSiteSelectors(url: string): SiteSelectors | null {
  const domain = extractDomain(url);
  
  for (const siteDomain in SCRAPING_CONFIG) {
    if (domain.includes(siteDomain)) {
      return SCRAPING_CONFIG[siteDomain];
    }
  }
  
  return null;
}

export function isSupportedSite(url: string): boolean {
  return getSiteSelectors(url) !== null;
}