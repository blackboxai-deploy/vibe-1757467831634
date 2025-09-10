'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScraperResults } from './scraper-results';
import { SUPPORTED_SITES, isSupportedSite } from '@/lib/scraper-config';

interface ScrapingResult {
  success: boolean;
  url: string;
  title?: string;
  price?: string;
  currency?: string;
  site?: string;
  error?: string;
  timestamp: number;
}

export function WebScraper() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScrapingResult | null>(null);
  const [history, setHistory] = useState<ScrapingResult[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      alert('Por favor, ingresa una URL válida');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en la solicitud');
      }

      setResult(data);
      setHistory(prev => [data, ...prev.slice(0, 4)]);
      
    } catch (error) {
      const errorResult: ScrapingResult = {
        success: false,
        url: url.trim(),
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: Math.floor(Date.now() / 1000)
      };
      setResult(errorResult);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleUrl = (exampleUrl: string) => {
    setUrl(exampleUrl);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            🛒 Web Scraper para E-commerce
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Extrae precios y información de productos de sitios como Amazon, eBay y MercadoLibre de forma automática y profesional
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          {SUPPORTED_SITES.map((site) => (
            <Badge 
              key={site.domain} 
              variant="secondary" 
              className="px-3 py-1 text-sm font-medium"
            >
              {site.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Main Scraping Form */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🎯 Extraer Información del Producto
          </CardTitle>
          <p className="text-gray-600">
            Ingresa la URL del producto que quieres analizar y obtén su información al instante
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium text-gray-700">
                URL del Producto
              </label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://www.amazon.com/dp/B08N5WRWNW"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 h-12 text-base"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !url.trim()} 
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analizando...
                    </div>
                  ) : (
                    '🚀 Extraer Datos'
                  )}
                </Button>
              </div>
              
              {url && !isSupportedSite(url) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm font-medium">
                    ⚠️ Sitio no reconocido - Se usarán selectores CSS genéricos
                  </p>
                  <p className="text-yellow-700 text-xs mt-1">
                    Los resultados pueden variar. Para mejores resultados, usa sitios soportados.
                  </p>
                </div>
              )}
            </div>
          </form>

          {/* URL Examples */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">
              💡 URLs de Ejemplo para Probar:
            </h3>
            <div className="grid gap-2 md:grid-cols-1">
              {SUPPORTED_SITES.map((site) => (
                <div 
                  key={site.domain}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {site.name}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 font-mono truncate">
                      {site.example}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleUrl(site.example)}
                    disabled={isLoading}
                    className="ml-3 shrink-0"
                  >
                    Usar
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700">
                  Analizando el producto...
                </p>
                <p className="text-sm text-gray-500">
                  Esto puede tomar unos segundos
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && <ScraperResults result={result} />}

      {/* History */}
      {history.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              📋 Historial Reciente
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Últimas {history.length} consultas realizadas
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={item.success ? 'default' : 'destructive'} className="text-xs">
                      {item.success ? 'Éxito' : 'Error'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(item.timestamp * 1000).toLocaleTimeString('es-ES')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate font-mono">
                    {item.url}
                  </p>
                  {item.success && item.title && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {item.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
            📖 Cómo Usar el Web Scraper
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700">✅ Pasos para usar:</h4>
              <ol className="text-sm text-blue-600 space-y-1 list-decimal list-inside">
                <li>Copia la URL del producto desde el sitio web</li>
                <li>Pégala en el campo de texto arriba</li>
                <li>Haz clic en "Extraer Datos"</li>
                <li>Revisa los resultados obtenidos</li>
              </ol>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700">⚡ Características:</h4>
              <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
                <li>Soporte para múltiples sitios web</li>
                <li>Extracción automática de precios</li>
                <li>Manejo inteligente de errores</li>
                <li>Historial de consultas recientes</li>
              </ul>
            </div>
          </div>
          
          <Separator className="bg-blue-200" />
          
          <div className="bg-white/50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>💡 Tip:</strong> Para obtener mejores resultados, asegúrate de usar URLs completas y actualizadas de los productos. 
              Si encuentras algún error, puede ser que los selectores CSS del sitio hayan cambiado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}