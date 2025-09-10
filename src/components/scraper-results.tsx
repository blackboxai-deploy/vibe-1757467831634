'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

interface ScraperResultsProps {
  result: ScrapingResult;
}

export function ScraperResults({ result }: ScraperResultsProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getCurrencySymbol = (currency?: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'MXN': '$',
      'ARS': '$'
    };
    return symbols[currency || ''] || '';
  };

  const getSiteColor = (site?: string) => {
    if (site?.includes('amazon')) return 'bg-orange-500';
    if (site?.includes('ebay')) return 'bg-blue-500';
    if (site?.includes('mercado')) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-6 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800">
            Resultado del Scraping
          </CardTitle>
          <div className="flex items-center gap-2">
            {result.site && (
              <Badge 
                variant="secondary" 
                className={`${getSiteColor(result.site)} text-white font-medium`}
              >
                {result.site}
              </Badge>
            )}
            <Badge variant={result.success ? 'default' : 'destructive'}>
              {result.success ? 'Éxito' : 'Error'}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Procesado el {formatTime(result.timestamp)}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* URL */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            URL Analizada
          </h3>
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="text-sm text-gray-600 break-all font-mono">
              {result.url}
            </p>
          </div>
        </div>

        <Separator />

        {result.success ? (
          <div className="space-y-6">
            {/* Título del Producto */}
            {result.title && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  📦 Título del Producto
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-gray-800 font-medium leading-relaxed">
                    {result.title}
                  </p>
                </div>
              </div>
            )}

            {/* Precio */}
            {result.price && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  💰 Precio
                </h3>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-700">
                    {getCurrencySymbol(result.currency)}{result.price}
                    {result.currency && (
                      <span className="text-lg font-normal text-green-600 ml-2">
                        {result.currency}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-green-800 font-medium">
                  ✅ Información extraída exitosamente
                </p>
              </div>
              <p className="text-green-600 text-sm mt-1">
                Los datos han sido procesados y validados correctamente.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Error */}
            <div className="space-y-2">
              <h3 className="font-semibold text-red-700 text-sm uppercase tracking-wide">
                ❌ Error Encontrado
              </h3>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-800 font-medium">
                  {result.error}
                </p>
              </div>
            </div>

            {/* Sugerencias */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">
                💡 Sugerencias para resolver el problema:
              </h4>
              <ul className="text-yellow-700 text-sm space-y-1 list-disc list-inside">
                <li>Verifica que la URL sea correcta y esté activa</li>
                <li>Algunos sitios pueden bloquear bots - intenta más tarde</li>
                <li>Los selectores CSS pueden haber cambiado - consulta la documentación</li>
                <li>Asegúrate de que el producto esté disponible</li>
              </ul>
            </div>
          </div>
        )}

        {/* Información técnica */}
        <Separator />
        <details className="text-sm text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700 font-medium">
            Información técnica del scraping
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded border font-mono text-xs">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}