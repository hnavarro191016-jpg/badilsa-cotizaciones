import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    // Buscar la última nota de remisión para generar el siguiente folio numérico
    const ultimaRemision = await prisma.notaRemision.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!ultimaRemision) {
      return NextResponse.json({ folio: '000001' });
    }

    const folioStr = ultimaRemision.folio.replace(/\D/g, '');
    const numeroActual = parseInt(folioStr || '0', 10);
    const siguienteNumero = numeroActual + 1;
    
    const siguienteFolio = siguienteNumero.toString().padStart(6, '0');

    return NextResponse.json({ folio: siguienteFolio });
  } catch (error) {
    console.error("Error fetching next remision folio:", error);
    return NextResponse.json({ error: 'Failed to fetch next folio' }, { status: 500 });
  }
}
