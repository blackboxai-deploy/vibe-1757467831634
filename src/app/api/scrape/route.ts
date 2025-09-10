import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

interface ScrapingRequest {
  url: string;
}

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

export async function POST(request: NextRequest) {
  try {
    const body: ScrapingRequest = await request.json();
    
    if (!body.url) {
      return NextResponse.json(
        { error: 'URL es requerida' }, 
        { status: 400 }
      );
    }

    // Validar URL básica
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' }, 
        { status: 400 }
      );
    }

    // Ejecutar script de Python
    const result = await runPythonScraper(body.url);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error en API de scraping:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        timestamp: Math.floor(Date.now() / 1000)
      }, 
      { status: 500 }
    );
  }
}

function runPythonScraper(url: string): Promise<ScrapingResult> {
  return new Promise((resolve) => {
    const pythonPath = path.join(process.cwd(), 'python');
    const scriptPath = path.join(pythonPath, 'web_scraper.py');
    
    // Ejecutar script de Python
    const pythonProcess = spawn('python3', [scriptPath, url, '--json'], {
      cwd: pythonPath,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      try {
        if (code === 0 && stdout.trim()) {
          // Intentar parsear resultado JSON
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } else {
          // Error en el proceso de Python
          const errorResult: ScrapingResult = {
            success: false,
            url: url,
            error: stderr || 'Error ejecutando el script de Python',
            timestamp: Math.floor(Date.now() / 1000)
          };
          resolve(errorResult);
        }
      } catch (parseError) {
        // Error parsing JSON
        const errorResult: ScrapingResult = {
          success: false,
          url: url,
          error: 'Error procesando respuesta del scraper',
          timestamp: Math.floor(Date.now() / 1000)
        };
        resolve(errorResult);
      }
    });

    pythonProcess.on('error', (error) => {
      const errorResult: ScrapingResult = {
        success: false,
        url: url,
        error: `Error ejecutando Python: ${error.message}`,
        timestamp: Math.floor(Date.now() / 1000)
      };
      resolve(errorResult);
    });

    // Timeout después de 30 segundos
    setTimeout(() => {
      pythonProcess.kill();
      const timeoutResult: ScrapingResult = {
        success: false,
        url: url,
        error: 'Timeout: El scraping tomó demasiado tiempo',
        timestamp: Math.floor(Date.now() / 1000)
      };
      resolve(timeoutResult);
    }, 30000);
  });
}