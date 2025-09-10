"""
Utilidades para Web Scraping de Comercio Electrónico
Incluye headers, selectores CSS y funciones auxiliares
"""

import random
import re
from typing import Dict, List, Optional, Tuple
from fake_useragent import UserAgent

class ScrapingUtils:
    """Clase con utilidades para web scraping"""
    
    def __init__(self):
        self.ua = UserAgent()
        
    def get_random_headers(self) -> Dict[str, str]:
        """
        Genera headers HTTP realistas con User-Agent rotativo
        """
        headers = {
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        }
        return headers
    
    def get_site_selectors(self, domain: str) -> Dict[str, List[str]]:
        """
        Retorna selectores CSS para diferentes sitios de comercio electrónico
        Múltiples selectores para mayor robustez
        """
        selectors = {
            'amazon.com': {
                'title': [
                    '#productTitle',
                    '.product-title',
                    '[data-automation-id="product-title"]',
                    '.a-size-large.a-size-base-plus',
                    'h1.a-size-large'
                ],
                'price': [
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
                'title': [
                    '#x-title-label-lbl',
                    '.x-title-label-lbl',
                    'h1[data-testid="lot-title"]',
                    '.notranslate',
                    'h1.it-ttl'
                ],
                'price': [
                    '.notranslate .notranslate',
                    '[data-testid="lot-price"] .notranslate',
                    '.u-flL.condText',
                    '#prcIsum',
                    '.u-flL .notranslate'
                ]
            },
            'mercadolibre.com': {
                'title': [
                    '.ui-pdp-title',
                    'h1.ui-pdp-title',
                    '.item-title__primary',
                    '.item-title'
                ],
                'price': [
                    '.andes-money-amount__fraction',
                    '.price-tag-fraction',
                    '.ui-pdp-price__fraction',
                    '.price-tag .price-tag-fraction'
                ]
            },
            'mercadolibre.com.mx': {
                'title': [
                    '.ui-pdp-title',
                    'h1.ui-pdp-title',
                    '.item-title__primary'
                ],
                'price': [
                    '.andes-money-amount__fraction',
                    '.price-tag-fraction',
                    '.ui-pdp-price__fraction'
                ]
            }
        }
        
        # Buscar dominio que coincida
        for site_domain, site_selectors in selectors.items():
            if site_domain in domain.lower():
                return site_selectors
                
        # Fallback para sitios no reconocidos
        return {
            'title': ['h1', '.title', '[class*="title"]', '[id*="title"]'],
            'price': ['[class*="price"]', '[id*="price"]', '.price', '.cost']
        }
    
    def clean_text(self, text: str) -> str:
        """
        Limpia y normaliza texto extraído
        """
        if not text:
            return ""
            
        # Remover espacios extra y caracteres especiales
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remover caracteres de control
        text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
        
        return text.strip()
    
    def clean_price(self, price_text: str) -> Optional[str]:
        """
        Extrae y limpia el precio del texto
        """
        if not price_text:
            return None
            
        # Buscar patrones de precio comunes
        price_patterns = [
            r'\$[\d,]+\.?\d*',  # $123.45 o $123,456.78
            r'€[\d,]+\.?\d*',   # €123.45
            r'[\d,]+\.?\d*\s*USD',  # 123.45 USD
            r'[\d,]+\.?\d*\s*EUR',  # 123.45 EUR
            r'[\d,]+\.?\d*\s*MXN',  # 123.45 MXN
        ]
        
        for pattern in price_patterns:
            match = re.search(pattern, price_text)
            if match:
                return match.group(0)
        
        # Si no encuentra patrón específico, buscar números con decimales
        number_match = re.search(r'[\d,]+\.?\d+', price_text)
        if number_match:
            return number_match.group(0)
            
        return price_text.strip()
    
    def extract_domain(self, url: str) -> str:
        """
        Extrae el dominio de una URL
        """
        # Remover protocolo
        domain = re.sub(r'https?://', '', url)
        # Remover www.
        domain = re.sub(r'^www\.', '', domain)
        # Tomar solo la parte del dominio
        domain = domain.split('/')[0]
        return domain.lower()
    
    def validate_url(self, url: str) -> bool:
        """
        Valida si una URL tiene formato correcto
        """
        url_pattern = r'^https?://(?:[-\w.])+(?:\:[0-9]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$'
        return bool(re.match(url_pattern, url))
    
    def get_random_delay(self, min_delay: float = 1.0, max_delay: float = 3.0) -> float:
        """
        Genera un delay aleatorio para evitar detección
        """
        return random.uniform(min_delay, max_delay)