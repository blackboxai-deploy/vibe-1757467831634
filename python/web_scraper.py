#!/usr/bin/env python3
"""
Web Scraper para Comercio Electrónico
Script completo para extraer precios y nombres de productos
Soporta Amazon, eBay, MercadoLibre y otros sitios

Uso:
    python web_scraper.py <URL>
    
Ejemplo:
    python web_scraper.py https://www.amazon.com/dp/B08N5WRWNW
"""

import json
import sys
import time
import argparse
from typing import Dict, Optional, Any
import requests
from bs4 import BeautifulSoup
from scraper_utils import ScrapingUtils

class EcommerceScraper:
    """
    Scraper principal para sitios de comercio electrónico
    """
    
    def __init__(self, timeout: int = 15, retries: int = 3):
        self.utils = ScrapingUtils()
        self.timeout = timeout
        self.retries = retries
        self.session = requests.Session()
        
    def scrape_product(self, url: str) -> Dict[str, Any]:
        """
        Scraper principal que extrae información del producto
        
        Args:
            url: URL del producto a scrapear
            
        Returns:
            Dict con información del producto o error
        """
        result = {
            'success': False,
            'url': url,
            'title': None,
            'price': None,
            'currency': None,
            'site': None,
            'error': None,
            'timestamp': int(time.time())
        }
        
        try:
            # Validar URL
            if not self.utils.validate_url(url):
                result['error'] = 'URL inválida'
                return result
            
            # Extraer dominio
            domain = self.utils.extract_domain(url)
            result['site'] = domain
            
            # Obtener selectores para el sitio
            selectors = self.utils.get_site_selectors(domain)
            
            # Scraper con reintentos
            soup = None
            for attempt in range(self.retries):
                try:
                    soup = self._fetch_page(url)
                    if soup:
                        break
                except Exception as e:
                    if attempt == self.retries - 1:
                        result['error'] = f'Error al cargar página: {str(e)}'
                        return result
                    # Wait before retry
                    time.sleep(self.utils.get_random_delay(1, 3))
            
            if not soup:
                result['error'] = 'No se pudo cargar la página'
                return result
            
            # Extraer título
            title = self._extract_element(soup, selectors.get('title', []))
            if title:
                result['title'] = self.utils.clean_text(title)
            
            # Extraer precio
            price_text = self._extract_element(soup, selectors.get('price', []))
            if price_text:
                cleaned_price = self.utils.clean_price(price_text)
                if cleaned_price:
                    result['price'] = cleaned_price
                    # Detectar moneda
                    result['currency'] = self._detect_currency(cleaned_price, domain)
            
            # Verificar si se encontró información básica
            if result['title'] or result['price']:
                result['success'] = True
            else:
                result['error'] = 'No se pudieron encontrar elementos del producto. Los selectores CSS pueden haber cambiado.'
                
        except Exception as e:
            result['error'] = f'Error inesperado: {str(e)}'
        
        return result
    
    def _fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """
        Descarga y parsea una página web
        """
        headers = self.utils.get_random_headers()
        
        response = self.session.get(
            url,
            headers=headers,
            timeout=self.timeout,
            allow_redirects=True
        )
        
        response.raise_for_status()
        
        # Parse with BeautifulSoup
        soup = BeautifulSoup(response.content, 'lxml')
        return soup
    
    def _extract_element(self, soup: BeautifulSoup, selectors: list) -> Optional[str]:
        """
        Extrae texto usando múltiples selectores CSS
        """
        for selector in selectors:
            try:
                element = soup.select_one(selector)
                if element:
                    text = element.get_text(strip=True)
                    if text and len(text.strip()) > 0:
                        return text
            except Exception:
                continue
        return None
    
    def _detect_currency(self, price_text: str, domain: str) -> Optional[str]:
        """
        Detecta la moneda basada en el precio y dominio
        """
        if '$' in price_text:
            if '.mx' in domain:
                return 'MXN'
            elif '.com.ar' in domain:
                return 'ARS'
            else:
                return 'USD'
        elif '€' in price_text:
            return 'EUR'
        elif '£' in price_text:
            return 'GBP'
        elif 'MXN' in price_text.upper():
            return 'MXN'
        elif 'EUR' in price_text.upper():
            return 'EUR'
        elif 'USD' in price_text.upper():
            return 'USD'
        else:
            # Inferir por dominio
            if '.mx' in domain or 'mercadolibre.com.mx' in domain:
                return 'MXN'
            elif '.com.ar' in domain:
                return 'ARS'
            elif '.es' in domain or '.fr' in domain or '.de' in domain:
                return 'EUR'
            else:
                return 'USD'

def print_formatted_result(result: Dict[str, Any]) -> None:
    """
    Imprime el resultado formateado en consola
    """
    print("=" * 60)
    print("🛒 RESULTADO DEL WEB SCRAPING")
    print("=" * 60)
    
    if result['success']:
        print(f"✅ ÉXITO - Información extraída correctamente")
        print(f"🌐 Sitio: {result['site']}")
        print(f"🔗 URL: {result['url']}")
        
        if result['title']:
            print(f"📦 Producto: {result['title']}")
        else:
            print(f"📦 Producto: No encontrado")
            
        if result['price']:
            currency_symbol = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'MXN': '$',
                'ARS': '$'
            }.get(result['currency'], '')
            
            print(f"💰 Precio: {currency_symbol}{result['price']} {result['currency'] or ''}")
        else:
            print(f"💰 Precio: No encontrado")
            
    else:
        print(f"❌ ERROR - No se pudo extraer información")
        print(f"🌐 Sitio: {result['site']}")
        print(f"🔗 URL: {result['url']}")
        print(f"⚠️  Error: {result['error']}")
    
    print("=" * 60)

def main():
    """
    Función principal del script
    """
    parser = argparse.ArgumentParser(
        description='Web Scraper para extraer precios de productos de comercio electrónico'
    )
    parser.add_argument('url', help='URL del producto a scrapear')
    parser.add_argument('--timeout', type=int, default=15, help='Timeout en segundos (default: 15)')
    parser.add_argument('--retries', type=int, default=3, help='Número de reintentos (default: 3)')
    parser.add_argument('--json', action='store_true', help='Salida en formato JSON')
    
    args = parser.parse_args()
    
    # Crear scraper
    scraper = EcommerceScraper(timeout=args.timeout, retries=args.retries)
    
    print("🚀 Iniciando web scraping...")
    print(f"🎯 URL objetivo: {args.url}")
    print("⏳ Procesando...")
    
    # Ejecutar scraping
    result = scraper.scrape_product(args.url)
    
    # Mostrar resultado
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print_formatted_result(result)
    
    # Exit code basado en éxito
    sys.exit(0 if result['success'] else 1)

if __name__ == "__main__":
    main()